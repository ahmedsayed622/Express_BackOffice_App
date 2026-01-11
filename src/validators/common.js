import { param, query } from "express-validator";

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

export const paginationQuery = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("limit must be an integer between 1 and 1000")
    .toInt(),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset must be a non-negative integer")
    .toInt(),
];

export const yearQuery = [
  query("year")
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage("year must be a 4-digit integer within range (1900-2100)")
    .toInt(),
];

export const monthQuery = [
  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("month must be between 1 and 12")
    .toInt(),
];

export const searchQuery = [
  query("q")
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("q must be a non-empty string with max 200 characters")
    .trim(),
];

function addYyyymmddValidation(chain, messages) {
  return chain
    .matches(/^\d{8}$/)
    .withMessage(messages.format)
    .custom((value) => {
      if (!value) {
        return true;
      }

      const year = parseInt(value.substr(0, 4), 10);
      const month = parseInt(value.substr(4, 2), 10);
      const day = parseInt(value.substr(6, 2), 10);

      if (year < 1900 || year > 2100) {
        throw new Error(messages.year);
      }
      if (month < 1 || month > 12) {
        throw new Error(messages.month);
      }
      if (day < 1 || day > 31) {
        throw new Error(messages.day);
      }

      return true;
    });
}

export function buildYyyymmddParam(paramName, messages) {
  return [addYyyymmddValidation(param(paramName), messages).toInt()];
}

export function buildYyyymmddQuery(queryName, messages) {
  return [
    addYyyymmddValidation(query(queryName).optional(), messages).toInt(),
  ];
}
