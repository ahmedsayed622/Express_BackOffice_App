import app from "./app.js";
import { logger } from "./utils/index.js";
import {
  ENV,
  initOracleClientOnce,
  initOraclePool,
  closeOraclePool,
  getSequelize,
  initSequelize,
  closeSequelize,
} from "./config/index.js";
import { syncModels } from "./models/index.js";

let server;

async function initializeDatabase() {
  try {
    await initSequelize();
    logger.info("Database connection established successfully");

    if (ENV.DB_SYNC === "true") {
      await syncModels();
      logger.info("Database tables synchronized successfully");
    } else {
      logger.info("DB sync is disabled (DB_SYNC!=true) - skipping model.sync()");
    }

    try {
      const sequelize = getSequelize();
      const [countResult] = await sequelize.query(
        "SELECT COUNT(*) AS CNT FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA"
      );
      const recordCount = countResult[0].CNT;

      if (recordCount === 0) {
        logger.warn(
          "ƒ?ÿ‹??  Table BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA is empty",
          {
            service: "startup-check",
            hint: "Check if data has been loaded into BACK_OFFICE schema",
          }
        );
      } else {
        logger.info(
          `ƒ?? Table verification: ${recordCount} records found in BACK_OFFICE schema`,
          {
            service: "startup-check",
          }
        );
      }
    } catch (tableCheckError) {
      logger.error(
        "ƒ?? Unable to query BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA",
        {
          service: "startup-check",
          error: tableCheckError.message,
          hint: "Check: 1) Schema access grants, 2) Public synonyms, 3) Duplicate tables in EDATA_PL schema",
        }
      );

      if (ENV.NODE_ENV === "production") {
        throw new Error("Critical: Unable to access data tables");
      }
    }
  } catch (error) {
    logger.error("Database initialization failed:", error);
    if (ENV.NODE_ENV === "production") {
      throw error;
    }
  }
}

async function startServer() {
  try {
    initOracleClientOnce();
    await initOraclePool();
    logger.info("Oracle connection pool initialized");

    await initializeDatabase();

    const dbPoolMin = ENV.DB_POOL.MIN || 2;
    const dbPoolMax = ENV.DB_POOL.MAX || 10;
    const oraPoolMin = ENV.ORA_POOL.MIN || 2;
    const oraPoolMax = ENV.ORA_POOL.MAX || 10;
    const serverIp = ENV.SERVER_IP || "0.0.0.0";
    const appPort = ENV.APP_PORT || 3000;
    const clientDir = ENV.ORACLE.CLIENT_LIB_DIR || "N/A";

    logger.info(
      `BOOT: env=${ENV.NODE_ENV} | base=${serverIp}:${appPort} | ORM pool[min=${dbPoolMin},max=${dbPoolMax}] | PROC pool[min=${oraPoolMin},max=${oraPoolMax}] | clientDir=${clientDir}`
    );

    server = app.listen(ENV.APP_PORT, ENV.SERVER_HOST, () => {
      logger.info(
        `ñ??? Server is running on ${ENV.SERVER_HOST}:${ENV.APP_PORT} in ${ENV.NODE_ENV} mode`
      );
      logger.info(
        `ñ??? Health check available at: http://localhost:${ENV.APP_PORT}/health`
      );
      logger.info(
        `ñ??? API endpoints available at: http://localhost:${ENV.APP_PORT}/api`
      );

      if (ENV.NODE_ENV === "development") {
        logger.info(`ñ??? Development Access: http://localhost:${ENV.APP_PORT}/api`);
      } else {
        logger.info(`ñ??? Server Access: Check your environment configuration`);
        logger.info(`   - API: http://YOUR_SERVER:${ENV.APP_PORT}/api`);
        logger.info(`   - Health: http://YOUR_SERVER:${ENV.APP_PORT}/health`);
      }
      logger.info(`ñ??? API Documentation: Check API_Documentation.md`);
    });

    return server;
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (!server) {
    return;
  }

  server.close(async () => {
    logger.info("HTTP server closed.");

    try {
      await closeOraclePool();
      logger.info("Oracle connection pool closed.");

      await closeSequelize();
      logger.info("Sequelize database connections closed.");

      process.exit(0);
    } catch (err) {
      logger.error("Error during graceful shutdown:", err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

await startServer();

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});
