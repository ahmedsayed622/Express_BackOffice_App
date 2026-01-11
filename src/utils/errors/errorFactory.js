// utils/errors/errorFactory.js
import CustomError from "./exceptions/CustomError.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";

/**
 * Creates a standardized error object
 * @param {Object} options - Error options
 * @param {string} options.code - Error code from ERROR_CODES
 * @param {number} options.status - HTTP status code
 * @param {string} options.message - Error message
 * @param {number} [options.number] - Oracle error number (if applicable)
 * @param {Error} [options.cause] - Original error that caused this error
 * @param {any} [options.data] - Additional error data
 */
export function createError({
  code,
  status,
  message,
  number = null,
  cause = null,
  data = null,
}) {
  const error = new CustomError(message, status, data);
  error.code = code;
  error.status = status; // Ensure status is set
  error.statusCode = status; // Mirror for compatibility with CustomError
  error.number = number;
  error.cause = cause;
  return error;
}

/**
 * Creates common error types with predefined settings
 */
export const ErrorFactory = {
  // Procedure errors
  alreadyRunning: (message = "A run is already in progress") =>
    createError({
      code: ERROR_CODES.ALREADY_RUNNING,
      status: 409,
      message,
      number: 20001,
    }),

  timeout: (message = "Could not obtain lock within timeout") =>
    createError({
      code: ERROR_CODES.TIMEOUT,
      status: 423,
      message,
      number: 20002,
    }),

  procError: (message, number = null, cause = null) =>
    createError({
      code: ERROR_CODES.PROC_ERROR,
      status: 500,
      message,
      number,
      cause,
    }),

  // Common errors
  notFound: (message = "Resource not found") =>
    createError({
      code: ERROR_CODES.NOT_FOUND,
      status: 404,
      message,
    }),

  validation: (message = "Validation failed", data = null) =>
    createError({
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 422,
      message,
      data,
    }),

  badRequest: (message = "Bad request") =>
    createError({
      code: ERROR_CODES.BAD_REQUEST,
      status: 400,
      message,
    }),

  internal: (message = "Internal server error", cause = null) =>
    createError({
      code: ERROR_CODES.INTERNAL_ERROR,
      status: 500,
      message,
      cause,
    }),
};

/**
 * Helper to check if an error is an application error (CustomError or has our structure)
 * @param {Error} err - Error to check
 * @returns {boolean} - True if it's an application error
 */
export function isAppError(err) {
  return err instanceof CustomError || (err?.code && err?.status);
}

export default createError;
