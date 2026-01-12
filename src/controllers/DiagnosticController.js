// controllers/DiagnosticController.js
import { DiagnosticService } from "../services/index.js";

/**
 * Diagnostic controller for troubleshooting empty data issues.
 * Development/staging only.
 */
export const checkSchemaAndData = async (req, res) => {
  const result = await DiagnosticService.checkSchemaAndData();
  return res.status(200).json(result);
};
