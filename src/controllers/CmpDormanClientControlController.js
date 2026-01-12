// controllers/CmpDormanClientControlController.js
import { CmpDormanClientControlService } from "../services/index.js";

const list = async (req, res) => {
  const data = await CmpDormanClientControlService.list(req.query);
  return res.json({ success: true, data });
};

export { list };
