// controllers/HealthController.js
import * as HealthService from "../services/HealthService.js";
import { asyncWrapper } from "../utils/index.js";

export const checkIntegrations = asyncWrapper(async (req, res) => {
  const result = await HealthService.checkIntegrations();
  return res.status(200).json(result);
});
