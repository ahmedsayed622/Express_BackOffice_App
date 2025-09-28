// controllers/CmpDormanClientControlController.js
import { CmpDormanClientControlService } from "../services/index.js";
import { asyncWrapper } from "../utils/index.js";

const list = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientControlService.list(req.query);
  return res.json({ success: true, data });
});

export { list };
