// middlewares/errorMiddleware.js
import { ERROR_CODES } from "../constants/errorCodes.js";
import { logger, isAppError } from "../utils/index.js";

export default function errorMiddleware(err, req, res, next) {
  // Log the error with structured data
  const errorLog = {
    message: err.message,
    code: err.code || "UNKNOWN_ERROR",
    status: err.status || err.statusCode || 500,
    number: err.number || err.errorNum,
    method: req.method,
    url: req.originalUrl,
    user: req.user?.id || "anonymous",
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  };

  // Only add stack trace in non-production
  if (process.env.NODE_ENV !== "production") {
    errorLog.stack = err.stack;
  }

  // If it's an application error, use its properties
  if (isAppError(err)) {
    logger.error("Application Error:", errorLog);

    return res.status(err.status || err.statusCode || 500).json({
      success: false,
      code: err.code,
      message: err.message,
      timestamp: new Date().toISOString(),
      requestId: req.id || "unknown",
    });
  }

  // Handle Sequelize errors
  if (err.name === "SequelizeValidationError") {
    logger.error("Sequelize Validation Error:", errorLog);
    return res.status(400).json({
      success: false,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    logger.error("Sequelize Unique Constraint Error:", errorLog);
    return res.status(409).json({
      success: false,
      code: ERROR_CODES.DUPLICATE_ENTRY,
      message: "Duplicate entry",
      field: err.errors[0]?.path || "unknown",
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Oracle database errors
  if (err.errorNum || err.number) {
    const oracleErrorMessages = {
      1: "Unique constraint violation",
      904: "Invalid identifier",
      942: "Table or view does not exist",
      1017: "Invalid username/password",
      12541: "TNS:no listener",
    };

    logger.error("Oracle Database Error:", errorLog);
    return res.status(500).json({
      success: false,
      code: ERROR_CODES.DATABASE_ERROR,
      message:
        oracleErrorMessages[err.errorNum || err.number] || "Database error",
      number: err.errorNum || err.number,
      timestamp: new Date().toISOString(),
    });
  }

  // Log unknown errors
  logger.error("Unknown Error:", errorLog);

  // Handle other unknown errors - fallback to generic internal error
  const statusCode = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Unexpected server error"
      : err.message || "Unexpected server error";

  return res.status(statusCode).json({
    success: false,
    code: ERROR_CODES.INTERNAL_ERROR,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
