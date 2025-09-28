// services/CmpDormanDormantProcedureService.js
import { runDormantOrchestrator } from "../repositories/procedures/index.js";

export default {
  execute: (opts) => runDormantOrchestrator(opts),
};
