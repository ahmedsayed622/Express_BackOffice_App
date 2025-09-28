// services/CmpDormanSummaryService.js
import { CmpDormanSummaryRepository } from "../repositories/index.js";

export default {
  list(filters = {}) {
    return CmpDormanSummaryRepository.findAll(filters);
  },

  latestByYear(year) {
    return CmpDormanSummaryRepository.findLatestByYear(year);
  },
};
