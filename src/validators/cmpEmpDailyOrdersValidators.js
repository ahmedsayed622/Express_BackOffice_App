// validators/cmpEmpDailyOrdersValidators.js
import { param, query } from "express-validator";

// Validate invoice number parameter
export const invoiceNoParam = [
  param("invoiceNo")
    .isInt({ min: 1 })
    .withMessage("Invoice number must be a positive integer")
    .toInt(),
];

// Validate execution ID parameter
export const execIdParam = [
  param("execId")
    .isString()
    .isLength({ min: 1, max: 18 })
    .withMessage("Execution ID must be a string between 1-18 characters")
    .trim(),
];

// Validate YYYYMMDD date parameter
export const yyyymmddParam = [
  param("date")
    .matches(/^\d{8}$/)
    .withMessage("Date must be in YYYYMMDD format (8 digits)")
    .custom((value) => {
      const year = parseInt(value.substr(0, 4));
      const month = parseInt(value.substr(4, 2));
      const day = parseInt(value.substr(6, 2));

      if (year < 1900 || year > 2100) {
        throw new Error("Year must be between 1900 and 2100");
      }
      if (month < 1 || month > 12) {
        throw new Error("Month must be between 01 and 12");
      }
      if (day < 1 || day > 31) {
        throw new Error("Day must be between 01 and 31");
      }

      return true;
    })
    .toInt(),
];

// Validate from date parameter (for route /from/:from)
export const fromDateParam = [
  param("from")
    .matches(/^\d{8}$/)
    .withMessage("From date must be in YYYYMMDD format (8 digits)")
    .custom((value) => {
      const year = parseInt(value.substr(0, 4));
      const month = parseInt(value.substr(4, 2));
      const day = parseInt(value.substr(6, 2));

      if (year < 1900 || year > 2100) {
        throw new Error("Year must be between 1900 and 2100");
      }
      if (month < 1 || month > 12) {
        throw new Error("Month must be between 01 and 12");
      }
      if (day < 1 || day > 31) {
        throw new Error("Day must be between 01 and 31");
      }

      return true;
    })
    .toInt(),
];

// Validate date range query parameters
export const rangeQuery = [
  query("from")
    .optional()
    .matches(/^\d{8}$/)
    .withMessage("From date must be in YYYYMMDD format (8 digits)")
    .custom((value) => {
      if (value) {
        const year = parseInt(value.substr(0, 4));
        const month = parseInt(value.substr(4, 2));
        const day = parseInt(value.substr(6, 2));

        if (year < 1900 || year > 2100) {
          throw new Error("From year must be between 1900 and 2100");
        }
        if (month < 1 || month > 12) {
          throw new Error("From month must be between 01 and 12");
        }
        if (day < 1 || day > 31) {
          throw new Error("From day must be between 01 and 31");
        }
      }
      return true;
    })
    .toInt(),
  query("to")
    .optional()
    .matches(/^\d{8}$/)
    .withMessage("To date must be in YYYYMMDD format (8 digits)")
    .custom((value) => {
      if (value) {
        const year = parseInt(value.substr(0, 4));
        const month = parseInt(value.substr(4, 2));
        const day = parseInt(value.substr(6, 2));

        if (year < 1900 || year > 2100) {
          throw new Error("To year must be between 1900 and 2100");
        }
        if (month < 1 || month > 12) {
          throw new Error("To month must be between 01 and 12");
        }
        if (day < 1 || day > 31) {
          throw new Error("To day must be between 01 and 31");
        }
      }
      return true;
    })
    .toInt(),
];

// Validate from query parameter
export const fromQuery = [
  query("from")
    .optional()
    .matches(/^\d{8}$/)
    .withMessage("From date must be in YYYYMMDD format (8 digits)")
    .custom((value) => {
      if (value) {
        const year = parseInt(value.substr(0, 4));
        const month = parseInt(value.substr(4, 2));
        const day = parseInt(value.substr(6, 2));

        if (year < 1900 || year > 2100) {
          throw new Error("From year must be between 1900 and 2100");
        }
        if (month < 1 || month > 12) {
          throw new Error("From month must be between 01 and 12");
        }
        if (day < 1 || day > 31) {
          throw new Error("From day must be between 01 and 31");
        }
      }
      return true;
    })
    .toInt(),
];

// Validate search query parameter
export const searchQuery = [
  query("q")
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("Search query must be a string between 1-200 characters")
    .trim(),
];

// Validate optional filters for list endpoint
export const listFilters = [
  query("execId")
    .optional()
    .isString()
    .isLength({ min: 1, max: 18 })
    .withMessage("ExecId filter must be a string between 1-18 characters")
    .trim(),
  query("invoiceNo")
    .optional()
    .isInt({ min: 1 })
    .withMessage("InvoiceNo filter must be a positive integer")
    .toInt(),
  query("profileId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ProfileId filter must be a positive integer")
    .toInt(),
  query("stockId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("StockId filter must be a positive integer")
    .toInt(),
  query("from")
    .optional()
    .matches(/^\d{8}$/)
    .withMessage("From date must be in YYYYMMDD format (8 digits)")
    .toInt(),
  query("to")
    .optional()
    .matches(/^\d{8}$/)
    .withMessage("To date must be in YYYYMMDD format (8 digits)")
    .toInt(),
];
