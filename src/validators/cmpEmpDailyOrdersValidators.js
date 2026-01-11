// validators/cmpEmpDailyOrdersValidators.js
import { param, query } from "express-validator";
import { buildYyyymmddParam, buildYyyymmddQuery } from "./common.js";

export const invoiceNoParam = [
  param("invoiceNo")
    .isInt({ min: 1 })
    .withMessage("Invoice number must be a positive integer")
    .toInt(),
];

export const execIdParam = [
  param("execId")
    .isString()
    .isLength({ min: 1, max: 18 })
    .withMessage("Execution ID must be a string between 1-18 characters")
    .trim(),
];

export const yyyymmddParam = buildYyyymmddParam("date", {
  format: "Date must be in YYYYMMDD format (8 digits)",
  year: "Year must be between 1900 and 2100",
  month: "Month must be between 01 and 12",
  day: "Day must be between 01 and 31",
});

export const fromDateParam = buildYyyymmddParam("from", {
  format: "From date must be in YYYYMMDD format (8 digits)",
  year: "From year must be between 1900 and 2100",
  month: "From month must be between 01 and 12",
  day: "From day must be between 01 and 31",
});

export const rangeQuery = [
  ...buildYyyymmddQuery("from", {
    format: "From date must be in YYYYMMDD format (8 digits)",
    year: "From year must be between 1900 and 2100",
    month: "From month must be between 01 and 12",
    day: "From day must be between 01 and 31",
  }),
  ...buildYyyymmddQuery("to", {
    format: "To date must be in YYYYMMDD format (8 digits)",
    year: "To year must be between 1900 and 2100",
    month: "To month must be between 01 and 12",
    day: "To day must be between 01 and 31",
  }),
];

export const fromQuery = buildYyyymmddQuery("from", {
  format: "From date must be in YYYYMMDD format (8 digits)",
  year: "From year must be between 1900 and 2100",
  month: "From month must be between 01 and 12",
  day: "From day must be between 01 and 31",
});

export const searchQuery = [
  query("q")
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("Search query must be a string between 1-200 characters")
    .trim(),
];

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
