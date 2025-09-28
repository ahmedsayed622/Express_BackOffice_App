// utils/exceptions/CustomError.js
/**
 * Custom error class for application-specific errors
 * Extends the native Error class with additional properties
 */
class CustomError extends Error {
  /**
   * Create a new CustomError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Additional data related to the error
   */
  constructor(message, statusCode = 500, data = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = data;
    this.isOperational = true; // Flag to indicate if this is an operational error
    
    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Some predefined error types for common scenarios
export class BadRequestError extends CustomError {
  constructor(message = 'Bad request', data = null) {
    super(message, 400, data);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized', data = null) {
    super(message, 401, data);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = 'Forbidden', data = null) {
    super(message, 403, data);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found', data = null) {
    super(message, 404, data);
  }
}

export class ValidationError extends CustomError {
  constructor(message = 'Validation failed', data = null) {
    super(message, 422, data);
  }
}

export class DatabaseError extends CustomError {
  constructor(message = 'Database error', data = null) {
    super(message, 500, data);
  }
}

export default CustomError;
