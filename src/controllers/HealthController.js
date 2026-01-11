// controllers/HealthController.js
import { HealthService } from "../services/index.js";
import { asyncWrapper } from "../utils/index.js";

export const checkIntegrations = asyncWrapper(async (req, res) => {
  const result = await HealthService.checkIntegrations();
  return res.status(200).json(result);
});
