// validators/cmpEmpDailyOrdersValidators.js
import { query } from "express-validator";
import { buildYyyymmddQuery } from "./common.js";

const ALLOWED_ORDER_BY_FIELDS = [
  "invoiceDate",
  "invoiceNo",
  "execId",
  "stockId",
  "profileId",
  "qty",
  "secondProfile",
  "customerNameEn",
];

export const empDailyOrdersQuery = [
  ...buildYyyymmddQuery("date", {
    format: "date must be in YYYYMMDD format (8 digits)",
    year: "date year must be between 1900 and 2100",
    month: "date month must be between 01 and 12",
    day: "date day must be between 01 and 31",
  }),
  ...buildYyyymmddQuery("from", {
    format: "from must be in YYYYMMDD format (8 digits)",
    year: "from year must be between 1900 and 2100",
    month: "from month must be between 01 and 12",
    day: "from day must be between 01 and 31",
  }),
  ...buildYyyymmddQuery("to", {
    format: "to must be in YYYYMMDD format (8 digits)",
    year: "to year must be between 1900 and 2100",
    month: "to month must be between 01 and 12",
    day: "to day must be between 01 and 31",
  }),
  query("from").custom((value, { req }) => {
    const fromValue = value ?? req.query.from;
    const toValue = req.query.to;
    const hasFrom = fromValue !== undefined && fromValue !== "";
    const hasTo = toValue !== undefined && toValue !== "";

    if (hasFrom !== hasTo) {
      throw new Error("from and to must be provided together");
    }

    if (hasFrom && hasTo) {
      const fromNum = Number(fromValue);
      const toNum = Number(toValue);
      if (Number.isNaN(fromNum) || Number.isNaN(toNum)) {
        throw new Error("from and to must be valid dates");
      }
      if (fromNum > toNum) {
        throw new Error("from must be less than or equal to to");
      }
    }

    return true;
  }),
  query("invoiceNo")
    .optional()
    .isInt({ min: 1 })
    .withMessage("invoiceNo must be a positive integer")
    .toInt(),
  query("execId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("execId must be a positive integer")
    .toInt(),
  query("stockId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("stockId must be a positive integer")
    .toInt(),
  query("q")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("q must be a non-empty string with max 100 characters")
    .trim(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit must be an integer between 1 and 200")
    .toInt(),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset must be a non-negative integer")
    .toInt(),
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
    }),
];
