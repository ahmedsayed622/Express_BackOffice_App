// utils/logger.js
import winston from "winston";
import fs from "fs";
import path from "path";
import { resolveFromRoot } from "./paths.js";

// Create logs directory if it doesn't exist (portable path)
const logsDir = resolveFromRoot("logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
  }
);

// Determine log level from environment variable or fallback to NODE_ENV-based default
function getLogLevel() {
  if (process.env.LOG_LEVEL) {
    const validLevels = [
      "error",
      "warn",
      "info",
      "http",
      "verbose",
      "debug",
      "silly",
    ];
    const level = process.env.LOG_LEVEL.toLowerCase();
    return validLevels.includes(level) ? level : "info";
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

// Create logger
const logger = winston.createLogger({
  level: getLogLevel(),
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  defaultMeta: { service: "express-app" },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, "app.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Separate file for error logs
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

export default logger;
