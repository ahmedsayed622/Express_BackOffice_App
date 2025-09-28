// repositories/procedures/cmpDorman/runDormantOrchestrator.js
import { runWithOptionalLock } from "../runner/oracleProcedureRunner.js";

export async function runDormantOrchestrator({ timeoutSeconds = 0 } = {}) {
  return runWithOptionalLock({
    lockName: "CMP_DORMANT_ORCH_LOCK", // EXCLUSIVE for this orchestrator only
    timeoutSeconds,
    sqlBlock: `
      BEGIN
        cmp_dormant_pkg_client_processor.cmp_dormant_pro_orchestrator();
      END;
    `,
  });
}
