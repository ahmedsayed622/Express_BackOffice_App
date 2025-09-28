// repositories/CmpDormanSummaryRepository.js
import CmpDormanSummaryModel from "../models/CmpDormanSummaryModel.js";

export default {
  findAll(
    where = {},
    order = [
      ["summaryYear", "DESC"],
      ["summaryMonth", "DESC"],
    ]
  ) {
    return CmpDormanSummaryModel.findAll({
      where,
      order,
    });
  },

  findLatestByYear(year) {
    return CmpDormanSummaryModel.findAll({
      where: {
        summaryYear: year,
      },
      order: [["summaryMonth", "DESC"]],
    });
  },
};
