// middlewares/validateRequest.js
import { validationResult } from "express-validator";
import { ErrorFactory } from "../utils/index.js";

export default function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(ErrorFactory.validation("Validation failed", errors.array()));
  }
  return next();
}
