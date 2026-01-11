// services/CmpDormanDormantProcedureService.js
import { runDormantOrchestrator } from "../repositories/index.js";

export default {
  execute: (opts) => runDormantOrchestrator(opts),
};
