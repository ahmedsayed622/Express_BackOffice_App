// controllers/DiagnosticController.js
import * as DiagnosticService from "../services/DiagnosticService.js";
import { asyncWrapper } from "../utils/index.js";

/**
 * Diagnostic controller for troubleshooting empty data issues
 * ⚠️ DEVELOPMENT/STAGING ONLY
 */
export const checkSchemaAndData = asyncWrapper(async (req, res) => {
  const result = await DiagnosticService.checkSchemaAndData();
  return res.status(200).json(result);
});
