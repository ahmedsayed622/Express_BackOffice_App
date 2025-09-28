// repositories/procedures/wrappers/dormantOrchestratorWrapper.js
import { runWithOptionalLock } from "../runner/oracleProcedureRunner.js";

export async function runDormantOrchestrator({ timeoutSeconds = 30 } = {}) {
  return runWithOptionalLock({
    sqlBlock: "CMP_DORMANT_PKG.PROCESS_DORMANT_ORCH();",
    lockName: "CMP_DORMANT_ORCH_LOCK",
    timeoutSeconds,
  });
}
