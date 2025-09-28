// validators/cmpDormanValidators.js
import { param, query, body } from "express-validator";

export const yearParam = [
  param("year")
    .isInt({ min: 1900, max: 2100 })
    .withMessage("year must be a 4-digit integer within range (1900-2100)"),
];

export const monthParam = [
  param("month")
    .isInt({ min: 1, max: 12 })
    .withMessage("month must be between 1 and 12"),
];

export const profileIdParam = [
  param("profileId").notEmpty().withMessage("profileId is required"),
];

export const inactivityYearQuery = [
  query("inactivityToYear")
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage("inactivityToYear must be a valid year between 1900 and 2100"),
];

export const searchQuery = [
  query("q")
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("q must be a non-empty string with max 200 characters")
    .trim(),
];

export const timeoutQuery = [
  query("timeout")
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage("timeout must be between 0 and 3600 seconds"),
];

export const timeoutBody = [
  body("timeout")
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage("timeout must be between 0 and 3600 seconds"),
];

export const analysisMonthParam = [
  param("analysisMonth")
    .isInt({ min: 190001, max: 210012 })
    .withMessage("analysisMonth must be in YYYYMM format (e.g., 202501)"),
];

export const analysisPeriodQuery = [
  query("analysisPeriodFrom")
    .optional()
    .isInt({ min: 19000101, max: 21001231 })
    .withMessage("analysisPeriodFrom must be in YYYYMMDD format"),
  query("analysisPeriodTo")
    .optional()
    .isInt({ min: 19000101, max: 21001231 })
    .withMessage("analysisPeriodTo must be in YYYYMMDD format"),
];
