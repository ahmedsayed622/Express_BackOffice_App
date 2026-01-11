// controllers/DiagnosticController.js
import { DiagnosticService } from "../services/index.js";
import { asyncWrapper } from "../utils/index.js";

/**
 * Diagnostic controller for troubleshooting empty data issues
 * ⚠️ DEVELOPMENT/STAGING ONLY
 */
export const checkSchemaAndData = asyncWrapper(async (req, res) => {
  const result = await DiagnosticService.checkSchemaAndData();
  return res.status(200).json(result);
});
