// src/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";
import { logger } from "../utils/index.js";

// General rate limiter for internal apps
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Max 1000 requests per 15 minutes (internal app default)
  message: {
    status: "error",
    message:
      "Too many requests. Please try again after a short delay.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("User-Agent"),
    });

    res.status(429).json({
      status: "error",
      message:
        "Too many requests. Please try again after a short delay.",
      retryAfter: "15 minutes",
      timestamp: new Date().toISOString(),
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/health" || req.path === "/";
  },
});

// Strict rate limiter for sensitive operations (e.g., login)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per 15 minutes
  message: {
    status: "error",
    message:
      "Too many attempts. Please try again after 15 minutes.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Strict rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("User-Agent"),
    });

    res.status(429).json({
      status: "error",
      message:
        "Too many attempts. Please try again after 15 minutes.",
      retryAfter: "15 minutes",
      timestamp: new Date().toISOString(),
    });
  },
});

// API rate limiter for public endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per 15 minutes
  message: {
    success: false,
    code: "RATE_LIMIT_EXCEEDED",
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`API rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get("User-Agent"),
    });

    res.status(429).json({
      success: false,
      code: "RATE_LIMIT_EXCEEDED",
      message:
        "Too many requests from this IP, please try again after 15 minutes.",
      timestamp: new Date().toISOString(),
    });
  },
});
