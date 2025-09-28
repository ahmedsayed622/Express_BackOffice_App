// src/middlewares/index.js - Unified middleware exports
import logger from "../utils/logger.js";

// Request logging middleware (enhanced)
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
    originalSend.call(this, data);
  };

  next();
};

// Enhanced authentication middleware
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Authentication token required",
    });
  }

  const token = authHeader.substring(7);

  try {
    // JWT verification would go here
    // For now, just pass through (since no auth is implemented yet)
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Invalid authentication token",
    });
  }
};

// CORS preflight handler
export const handlePreflight = (req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", true);
    return res.sendStatus(200);
  }
  next();
};

// Export all rate limiters
export { generalLimiter, strictLimiter, apiLimiter } from "./rateLimiter.js";

// Export validation middleware
export { default as validateRequest } from "./validateRequest.js";

// Export error middleware
export { default as errorMiddleware } from "./errorMiddleware.js";
