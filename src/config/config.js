// config/config.js
import dotenv from "dotenv";

// تحميل متغيرات البيئة
dotenv.config();

// التحقق من المتغيرات المطلوبة
const requiredEnvVars = [
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
  console.error(
    "Please check your .env file and ensure all required variables are set"
  );
  process.exit(1);
}

// التحقق من صحة الأرقام
const dbPort = parseInt(process.env.DB_PORT);
const appPort = parseInt(process.env.APP_PORT);

if (isNaN(dbPort) || dbPort <= 0 || dbPort > 65535) {
  console.error("DB_PORT must be a valid port number (1-65535)");
  process.exit(1);
}

if (appPort && (isNaN(appPort) || appPort <= 0 || appPort > 65535)) {
  console.error("APP_PORT must be a valid port number (1-65535)");
  process.exit(1);
}

// التحقق من مسار Oracle Client
if (!process.env.ORACLE_CLIENT_PATH) {
  console.warn("ORACLE_CLIENT_PATH not set in environment variables");
}

// إعدادات التطبيق
export const config = {
  // إعدادات الخادم
  server: {
    host: process.env.SERVER_HOST || "0.0.0.0", // للاستماع على جميع network interfaces
    port: appPort || 3000,
    environment: process.env.NODE_ENV || "development",
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000"],
  },

  // إعدادات قاعدة البيانات
  database: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: dbPort,
    name: process.env.DB_NAME,
    connectString: `${process.env.DB_HOST}:${dbPort}/${process.env.DB_NAME}`,
  },

  // إعدادات Oracle
  oracle: {
    clientPath: process.env.ORACLE_CLIENT_PATH,
  },

  // إعدادات JWT
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret_change_in_production",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  // إعدادات التسجيل
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
  },

  // إعدادات الأمان
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret:
      process.env.SESSION_SECRET || "your_session_secret_change_in_production",
  },

  // إعدادات تحديد المعدل
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

export default config;
