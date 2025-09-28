// controllers/CmpDormanSummaryController.js
import { CmpDormanSummaryService } from "../services/index.js";

const list = async (req, res) => {
  const data = await CmpDormanSummaryService.list(req.query);
  return res.json({ success: true, data });
};

const latestByYear = async (req, res) => {
  const data = await CmpDormanSummaryService.latestByYear(req.params.year);
  return res.json({ success: true, data });
};

export { list, latestByYear };
