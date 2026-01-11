import { Sequelize } from "sequelize";
import { logger } from "../utils/index.js";
import { ENV } from "./bootstrap.js";
import { initOracleClientOnce } from "./oracleClient.js";

let sequelizeInstance = null;

function createSequelize() {
  initOracleClientOnce();

  const serviceName = ENV.DB.NAME;

  logger.info("Database configuration loaded", {
    service: "sequelize-oracle",
    user: ENV.DB.USER,
    host: ENV.DB.HOST,
    port: ENV.DB.PORT,
    serviceName,
    connectString: ENV.DB.CONNECT_STRING,
  });

  if (ENV.DB_SYNC === "true" && ENV.NODE_ENV === "production") {
    const errorMsg = "DB_SYNC=true is not allowed in production environment";
    logger.error(errorMsg, { service: "sequelize-oracle" });
    throw new Error(errorMsg);
  }

  if (ENV.DB_SYNC === "true") {
    logger.warn(
      "ƒ?ÿ‹??  DB_SYNC=true detected - this may create tables in wrong schema with Oracle",
      {
        service: "sequelize-oracle",
        dbUser: ENV.DB.USER,
        hint: "Tables should be created manually in BACK_OFFICE schema. Set DB_SYNC=false after initial setup.",
      }
    );
  }

  const poolConfig = {
    max: ENV.DB_POOL.MAX,
    min: ENV.DB_POOL.MIN,
    acquire: ENV.DB_POOL.ACQUIRE,
    idle: ENV.DB_POOL.IDLE,
  };

  return new Sequelize({
    dialect: "oracle",
    username: ENV.DB.USER,
    password: ENV.DB.PASSWORD,
    host: ENV.DB.HOST,
    port: ENV.DB.PORT || 1521,
    database: serviceName,
    dialectOptions: {
      connectString: ENV.DB.CONNECT_STRING,
    },
    pool: poolConfig,
    logging: (sql) => {
      console.log("SEQUELIZE_SQL:", sql);
    },
    benchmark: true,
    logQueryParameters: ENV.NODE_ENV === "development",
  });
}

export function getSequelize() {
  if (!sequelizeInstance) {
    sequelizeInstance = createSequelize();
  }
  return sequelizeInstance;
}

export async function initSequelize() {
  const sequelize = getSequelize();

  try {
    await sequelize.authenticate();
    logger.info("ƒ?? Connection to Oracle DB has been established successfully");

    const [results] = await sequelize.query("SELECT SYSDATE FROM DUAL");
    logger.info(`ñ??? Database time: ${results[0].SYSDATE}`);

    return true;
  } catch (error) {
    logger.error("ƒ?? Unable to connect to the database:", {
      service: "sequelize",
      message: error.message,
      code: error.code || "UNKNOWN",
      errno: error.errno,
      environment: ENV.NODE_ENV,
      connectString: ENV.DB.CONNECT_STRING,
    });

    if (error.code === "ENOTFOUND") {
      logger.error("ñ??? Check if the database host is correct and reachable", {
        service: "sequelize",
        host: ENV.DB.HOST,
        port: ENV.DB.PORT,
      });
    } else if (error.errno === 1017) {
      logger.error("ñ??? Check if the username and password are correct", {
        service: "sequelize",
        username: ENV.DB.USER,
      });
    } else if (error.errno === 12514) {
      logger.error(
        "ñ??? ORA-12514: Service name not registered with listener or wrong service name",
        {
          service: "sequelize",
          connectString: ENV.DB.CONNECT_STRING,
          hint: "Check: 1) Service name vs SID, 2) Run 'lsnrctl status' on DB server, 3) Query v$services or show parameter service_names",
        }
      );
    } else if (error.errno === 12541) {
      logger.error(
        "ñ??? Check if the Oracle listener is running on the specified port",
        {
          service: "sequelize",
          connectString: ENV.DB.CONNECT_STRING,
        }
      );
    }

    throw error;
  }
}

export async function closeSequelize() {
  if (sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = null;
  }
}
