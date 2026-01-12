// controllers/HealthController.js
import { HealthService } from "../services/index.js";

export const checkIntegrations = async (req, res) => {
  const result = await HealthService.checkIntegrations();
  return res.status(200).json(result);
};
