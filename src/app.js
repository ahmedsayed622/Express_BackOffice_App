// src/app.js
import "dotenv-flow/config"; // Load environment variables first
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "express-async-errors";
import routes from "./routes/index.js";
import logger from "./utils/logger.js";
import { sequelize, testConnection } from "./config/db.config.js";
import { config } from "./config/config.js";
import { getCorsConfiguration } from "./config/cors.config.js";
import {
  errorMiddleware,
  generalLimiter,
  requestLogger,
} from "./middlewares/index.js";
import { syncModels } from "./models/index.js";
import { initOraclePool, closeOraclePool } from "./config/oracledb.pool.js";

// Initialize Express app
const app = express();

// Trust proxy (important for production behind reverse proxy)
app.set("trust proxy", 1);

// Get environment-specific CORS configuration
const corsOptions = getCorsConfiguration();

// Enhanced Helmet configuration for better security
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

// Essential middleware
app.use(helmet(helmetOptions)); // Enhanced security headers
app.use(cors(corsOptions)); // Environment-specific CORS configuration

// Apply rate limiting conditionally - Perfect for internal corporate apps
const shouldUseRateLimit =
  process.env.ENABLE_RATE_LIMITING === "true" ||
  config.server.environment === "production";

if (shouldUseRateLimit) {
  app.use(generalLimiter);
  logger.info("✅ Rate limiting enabled");
} else {
  logger.info("⚠️  Rate limiting disabled - Internal environment detected");
}

app.use(express.json({ limit: "10mb" })); // Parse JSON with size limit
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded with size limit

// Enhanced Morgan logging with custom format
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
    skip: (req, res) => process.env.NODE_ENV === "test",
  })
); // Enhanced HTTP request logging

// Test database connection and sync models
(async () => {
  try {
    await testConnection();
    logger.info("Database connection established successfully");

    await syncModels();
    logger.info("Database tables synchronized successfully");
  } catch (error) {
    logger.error("Database initialization failed:", error);
    // Don't exit in development for easier debugging
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

// API routes
app.use("/api", routes);

// Health check endpoint with enhanced information
app.get("/health", (req, res) => {
  const healthInfo = {
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
  };

  res.status(200).json(healthInfo);
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express BackOffice API is running",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed.");

    try {
      // Close Oracle connection pool
      await closeOraclePool();
      logger.info("Oracle connection pool closed.");

      // Close database connections
      if (sequelize) {
        await sequelize.close();
        logger.info("Sequelize database connections closed.");
      }

      process.exit(0);
    } catch (err) {
      logger.error("Error during graceful shutdown:", err);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Initialize services and start the server
async function startServer() {
  try {
    // Initialize Oracle connection pool
    await initOraclePool();
    logger.info("Oracle connection pool initialized");

    // Log dual pool configuration with portability info
    const dbPoolMin = process.env.DB_POOL_MIN || 2;
    const dbPoolMax = process.env.DB_POOL_MAX || 10;
    const oraPoolMin = process.env.ORA_POOL_MIN || 2;
    const oraPoolMax = process.env.ORA_POOL_MAX || 10;
    const serverIp = process.env.SERVER_IP || "0.0.0.0";
    const appPort = process.env.APP_PORT || 3000;
    const clientDir = process.env.ORACLE_CLIENT_LIB_DIR || "N/A";

    logger.info(
      `BOOT: env=${process.env.NODE_ENV} | base=${serverIp}:${appPort} | ORM pool[min=${dbPoolMin},max=${dbPoolMax}] | PROC pool[min=${oraPoolMin},max=${oraPoolMax}] | clientDir=${clientDir}`
    );

    // Start the server
    const PORT = config.server.port;
    const HOST = config.server.host;
    const server = app.listen(PORT, HOST, () => {
      logger.info(
        `🚀 Server is running on ${HOST}:${PORT} in ${config.server.environment} mode`
      );
      logger.info(
        `📍 Health check available at: http://localhost:${PORT}/health`
      );
      logger.info(
        `🔧 API endpoints available at: http://localhost:${PORT}/api`
      );

      // Log all available IP addresses for network access
      logger.info(`🌐 Company Network Access:`);
      logger.info(`   - http://10.1.118.200:${PORT}/api`);
      logger.info(`   - http://10.1.118.200:${PORT}/health`);
      logger.info(`📋 API Documentation: Check API_Documentation.md`);
    });

    return server;
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Start the application
const server = await startServer();

// Handle graceful shutdown
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application specific logging, throwing an error, or other logic here
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

export default app;
