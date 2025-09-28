// services/CmpDormanSummaryViewService.js
import { CmpDormanSummaryViewRepository } from "../repositories/index.js";

export default {
  list() {
    return CmpDormanSummaryViewRepository.findAll();
  },
};
