// controllers/CmpDormanSummaryViewController.js
import { CmpDormanSummaryViewService } from "../services/index.js";

const list = async (req, res) => {
  const data = await CmpDormanSummaryViewService.list();
  return res.json({ success: true, data });
};

export { list };
