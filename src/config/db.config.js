// config/db.config.js
import { Sequelize } from "sequelize";
import oracledb from "oracledb";
import { logger } from "../utils/index.js";

// Initialize Oracle client with error handling
try {
  // Try to initialize Oracle client (path can be set via environment if needed)
  const clientPath = process.env.ORACLE_CLIENT_PATH;
  if (clientPath) {
    oracledb.initOracleClient({ libDir: clientPath });
    logger.info("Oracle client initialized successfully", {
      service: "sequelize-oracle",
      clientPath,
    });
  } else {
    logger.warn(
      "Oracle client path not provided - trying default initialization",
      {
        service: "sequelize-oracle",
      }
    );
    try {
      oracledb.initOracleClient();
      logger.info("Oracle client initialized with default settings", {
        service: "sequelize-oracle",
      });
    } catch (defaultError) {
      logger.warn("Could not initialize Oracle client with default settings", {
        service: "sequelize-oracle",
        error: defaultError.message,
      });
    }
  }
} catch (error) {
  logger.error("Failed to initialize Oracle client:", {
    service: "sequelize-oracle",
    error: error.message,
    stack: error.stack,
  });
  logger.warn(
    "Continuing without Oracle client initialization - connection may fail",
    {
      service: "sequelize-oracle",
    }
  );
}

// Enhanced database pool configuration from environment
const poolConfig = {
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
  idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
};

// Build connect string from environment variables
const connectString = `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`;

// Create Sequelize instance with Oracle configuration
const sequelize = new Sequelize({
  dialect: "oracle",
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 1521,
  database: process.env.DB_SERVICE,
  dialectOptions: {
    connectString,
  },
  pool: poolConfig,
  logging:
    process.env.NODE_ENV === "development"
      ? (msg) => logger.debug(msg, { service: "sequelize" })
      : false,
  benchmark: process.env.NODE_ENV === "development",
  logQueryParameters: process.env.NODE_ENV === "development",
});

// Test the connection with enhanced error handling
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ Connection to Oracle DB has been established successfully");

    // Test a simple query to verify the connection works
    const [results] = await sequelize.query("SELECT SYSDATE FROM DUAL");
    logger.info(`📅 Database time: ${results[0].SYSDATE}`);

    return true;
  } catch (error) {
    logger.error("❌ Unable to connect to the database:", {
      service: "sequelize",
      message: error.message,
      code: error.code || "UNKNOWN",
      errno: error.errno,
      sql: error.sql,
      environment: process.env.NODE_ENV,
      connectString,
    });

    // Provide helpful error messages for common Oracle errors
    if (error.code === "ENOTFOUND") {
      logger.error("🔍 Check if the database host is correct and reachable", {
        service: "sequelize",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
      });
    } else if (error.errno === 1017) {
      logger.error("🔐 Check if the username and password are correct", {
        service: "sequelize",
        username: process.env.DB_USER,
      });
    } else if (error.errno === 12541) {
      logger.error(
        "🔌 Check if the Oracle listener is running on the specified port",
        {
          service: "sequelize",
          connectString,
        }
      );
    }

    throw error;
  }
};

// Export the Sequelize instance and test function
export { sequelize, testConnection };
