// repositories/CmpDormanSummaryViewRepository.js
import CmpDormanSummaryViewModel from "../models/CmpDormanSummaryViewModel.js";

export default {
  findAll(order = [["summaryYear", "DESC"]]) {
    return CmpDormanSummaryViewModel.findAll({
      order,
    });
  },
};
