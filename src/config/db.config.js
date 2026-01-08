// config/db.config.js
import { Sequelize } from "sequelize";
import { logger } from "../utils/index.js";
import { initOracleClientOnce, buildConnectString } from "./oracle.client.js";

// Initialize Oracle Thick mode client once
initOracleClientOnce();

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  const errorMsg = `Missing required database environment variables: ${missingVars.join(', ')}`;
  logger.error(errorMsg, { service: "sequelize-oracle" });
  throw new Error(errorMsg);
}

// Build connectString using shared function
let connectString;
let serviceName;
try {
  connectString = buildConnectString();
  serviceName = process.env.DB_NAME || 
                process.env.DB_SERVICE_NAME || 
                process.env.DB_SERVICE;
} catch (error) {
  logger.error(error.message, { service: "sequelize-oracle" });
  throw error;
}

// Log connection info (without password)
logger.info("Database configuration loaded", {
  service: "sequelize-oracle",
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  serviceName,
  connectString,
});

// Validate DB_SYNC is not enabled inappropriately
if (process.env.DB_SYNC === "true" && process.env.NODE_ENV === "production") {
  const errorMsg = "DB_SYNC=true is not allowed in production environment";
  logger.error(errorMsg, { service: "sequelize-oracle" });
  throw new Error(errorMsg);
}

// Warn if DB_SYNC is enabled (potential schema issue with Oracle)
if (process.env.DB_SYNC === "true") {
  logger.warn("⚠️  DB_SYNC=true detected - this may create tables in wrong schema with Oracle", {
    service: "sequelize-oracle",
    dbUser: process.env.DB_USER,
    hint: "Tables should be created manually in BACK_OFFICE schema. Set DB_SYNC=false after initial setup.",
  });
}

// Enhanced database pool configuration from environment
const poolConfig = {
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
  idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
};

// Create Sequelize instance with Oracle configuration
const sequelize = new Sequelize({
  dialect: "oracle",
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 1521,
  database: serviceName,
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
  logging: (sql, timing) => {
    console.log("SEQUELIZE_SQL:", sql);
  },
  benchmark: true,
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
      environment: process.env.NODE_ENV,
      connectString, // Do not log password
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
    } else if (error.errno === 12514) {
      logger.error(
        "🔌 ORA-12514: Service name not registered with listener or wrong service name",
        {
          service: "sequelize",
          connectString,
          hint: "Check: 1) Service name vs SID, 2) Run 'lsnrctl status' on DB server, 3) Query v$services or show parameter service_names",
        }
      );
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
