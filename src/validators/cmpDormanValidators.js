// validators/cmpDormanValidators.js
import { param, query, body } from "express-validator";
import {
  yearParam,
  monthParam,
  paginationQuery,
  yearQuery,
  monthQuery,
  searchQuery,
} from "./common.js";

export { yearParam, monthParam, paginationQuery, yearQuery, monthQuery, searchQuery };

export const profileIdParam = [
  param("profileId").notEmpty().withMessage("profileId is required"),
];

export const inactivityYearQuery = [
  query("inactivityToYear")
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage("inactivityToYear must be a valid year between 1900 and 2100"),
];

export const statusQuery = [
  query("status")
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage("status must be a string with max 50 characters")
    .trim(),
];

const ALLOWED_ORDER_BY_FIELDS = [
  "profileId",
  "analysisPeriodFrom",
  "analysisPeriodTo",
  "analysisMonth",
  "inactivityFromYear",
  "inactivityToYear",
  "clientNameEn",
];

export const orderByQuery = [
  query("orderBy")
    .optional()
    .isString()
    .trim()
    .custom((value) => {
      const parts = value.split(":");
      if (parts.length > 2) {
        throw new Error("orderBy format must be 'field' or 'field:direction'");
      }

      const field = parts[0];
      const direction = parts[1] ? parts[1].toUpperCase() : "ASC";

      if (!ALLOWED_ORDER_BY_FIELDS.includes(field)) {
        throw new Error(
          `orderBy field must be one of: ${ALLOWED_ORDER_BY_FIELDS.join(", ")}`
        );
      }

      if (!["ASC", "DESC"].includes(direction)) {
        throw new Error("orderBy direction must be ASC or DESC");
      }

      return true;
    })
    .withMessage("orderBy must be a valid field with optional direction"),
];

export const clientMonthlyDataCollectionQuery = [
  ...yearQuery,
  ...monthQuery,
  ...searchQuery,
  ...statusQuery,
  ...orderByQuery,
  ...paginationQuery,
];

export const clientMonthlyDataYearQuery = [
  ...monthQuery,
  ...searchQuery,
  ...statusQuery,
  ...orderByQuery,
  ...paginationQuery,
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
