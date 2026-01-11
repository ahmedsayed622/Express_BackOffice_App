import dotenvFlow from "dotenv-flow";

dotenvFlow.config();

const requiredEnvVars = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

const serviceName =
  process.env.DB_NAME || process.env.DB_SERVICE_NAME || process.env.DB_SERVICE;

if (!serviceName) {
  missingVars.push("DB_NAME (or DB_SERVICE_NAME/DB_SERVICE)");
}

if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
  console.error(
    "Please check your .env file and ensure all required variables are set"
  );
  process.exit(1);
}

const dbPort = parseInt(process.env.DB_PORT, 10);
const appPort = process.env.APP_PORT
  ? parseInt(process.env.APP_PORT, 10)
  : null;

if (isNaN(dbPort) || dbPort <= 0 || dbPort > 65535) {
  console.error("DB_PORT must be a valid port number (1-65535)");
  process.exit(1);
}

if (appPort && (isNaN(appPort) || appPort <= 0 || appPort > 65535)) {
  console.error("APP_PORT must be a valid port number (1-65535)");
  process.exit(1);
}

if (!process.env.ORACLE_CLIENT_PATH) {
  console.warn("ORACLE_CLIENT_PATH not set in environment variables");
}

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : null;

const connectString = `${process.env.DB_HOST}:${dbPort}/${serviceName}`;

export const ENV = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_PORT: appPort || 3000,
  SERVER_HOST: process.env.SERVER_HOST || "0.0.0.0",
  SERVER_IP: process.env.SERVER_IP || "0.0.0.0",
  ALLOWED_ORIGINS: allowedOrigins,
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING,
  DB_SYNC: process.env.DB_SYNC,
  DB: {
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    HOST: process.env.DB_HOST,
    PORT: dbPort,
    NAME: serviceName,
    CONNECT_STRING: connectString,
  },
  ORACLE: {
    CLIENT_PATH: process.env.ORACLE_CLIENT_PATH,
    CLIENT_LIB_DIR: process.env.ORACLE_CLIENT_LIB_DIR,
  },
  DB_POOL: {
    MAX: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    MIN: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    ACQUIRE: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
    IDLE: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
  },
  ORA_POOL: {
    MIN: parseInt(process.env.ORA_POOL_MIN, 10) || 2,
    MAX: parseInt(process.env.ORA_POOL_MAX, 10) || 10,
    TIMEOUT: parseInt(process.env.ORA_POOL_TIMEOUT, 10) || 60,
    QUEUE_MAX: parseInt(process.env.ORA_QUEUE_MAX, 10) || 500,
    QUEUE_TIMEOUT: parseInt(process.env.ORA_QUEUE_TIMEOUT, 10) || 60000,
    STMT_CACHE: parseInt(process.env.ORA_STMT_CACHE, 10) || 50,
  },
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE: process.env.LOG_FILE || "logs/app.log",
  JWT: {
    SECRET: process.env.JWT_SECRET || "your_jwt_secret_change_in_production",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  },
  SECURITY: {
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    SESSION_SECRET:
      process.env.SESSION_SECRET || "your_session_secret_change_in_production",
  },
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
});

export default ENV;
