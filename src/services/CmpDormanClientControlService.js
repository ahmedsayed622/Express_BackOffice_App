// services/CmpDormanClientControlService.js
import { CmpDormanClientControlRepository } from "../repositories/index.js";

export default {
  list(filters = {}) {
    return CmpDormanClientControlRepository.findAll(filters);
  },
};
