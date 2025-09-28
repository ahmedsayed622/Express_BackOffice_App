// repositories/procedures/index.js
export {
  runWithOptionalLock,
  runPlainProc,
} from "./runner/oracleProcedureRunner.js";
export { runDormantOrchestrator } from "./wrappers/dormantOrchestratorWrapper.js";
