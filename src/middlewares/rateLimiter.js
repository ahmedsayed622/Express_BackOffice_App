// src/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

// General rate limiter - مناسب للتطبيقات الداخلية
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 1000, // حد أقصى 1000 طلب لكل 15 دقيقة (مناسب للتطبيقات الداخلية)
  message: {
    status: "error",
    message: "تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة مرة أخرى بعد قليل.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // إرجاع معلومات rate limit في headers
  legacyHeaders: false, // تعطيل X-RateLimit-* headers القديمة
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("User-Agent"),
    });

    res.status(429).json({
      status: "error",
      message: "تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة مرة أخرى بعد قليل.",
      retryAfter: "15 minutes",
      timestamp: new Date().toISOString(),
    });
  },
  skip: (req) => {
    // تخطي rate limiting للـ health checks
    return req.path === "/health" || req.path === "/";
  },
});

// Strict rate limiter للعمليات الحساسة (مثل تسجيل الدخول)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // حد أقصى 5 محاولات لكل 15 دقيقة
  message: {
    status: "error",
    message:
      "تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى المحاولة مرة أخرى بعد 15 دقيقة.",
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
        "تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى المحاولة مرة أخرى بعد 15 دقيقة.",
      retryAfter: "15 minutes",
      timestamp: new Date().toISOString(),
    });
  },
});

// API rate limiter - للـ API endpoints العامة
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 500, // حد أقصى 500 طلب لكل 15 دقيقة
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
