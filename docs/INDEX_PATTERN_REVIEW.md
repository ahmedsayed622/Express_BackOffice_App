# Index Pattern Review

Scope: import/index consistency only (routes, controllers, services, repositories, models/db, utils, config). No behavior changes.

## 1) Proposed Single Standard (Final Rules)
Use layer indexes for all cross-layer imports:
- routes -> controllers: `import { FooController } from "../../controllers/index.js"`
- controllers -> services: `import { FooService } from "../services/index.js"`
- services -> repositories: `import { FooRepository } from "../repositories/index.js"`
- any layer -> utils: `import { logger, ErrorFactory } from "../utils/index.js"`
- any layer -> config: `import { ENV, initOraclePool } from "../config/index.js"`
- repositories -> models/db:
  - Prefer `import { db } from "../models/index.js"` if models index is a stable API.
  - If not stable, allow direct model imports and document as exception.

Allowed:
- Internal imports within the same layer folder.
- Explicit exceptions when index use causes circular dependencies or couples internal modules.

## 2) Current State by Relationship

### routes -> controllers
- Index imports: 4
- Deep imports: 4
- Violations:
  - `src/routes/v1/index.js`: `import { run as runDormantOrchestrator } from "../../controllers/CmpDormanDormantProcedureController.js";`
  - `src/routes/v1/index.js`: `import { checkIntegrations } from "../../controllers/HealthController.js";`
  - `src/routes/v1/index.js`: `import { checkSchemaAndData } from "../../controllers/DiagnosticController.js";`
  - `src/routes/v1/cmpEmpDailyOrders.routes.js`: `import * as CmpEmpDailyOrdersController from "../../controllers/CmpEmpDailyOrdersController.js";`
- Target style:
  - All routes should import controllers via `src/controllers/index.js`.

### controllers -> services
- Index imports: 4
- Deep imports: 4
- Violations:
  - `src/controllers/HealthController.js`: `import * as HealthService from "../services/HealthService.js";`
  - `src/controllers/DiagnosticController.js`: `import * as DiagnosticService from "../services/DiagnosticService.js";`
  - `src/controllers/CmpEmpDailyOrdersController.js`: `import CmpEmpDailyOrdersService from "../services/CmpEmpDailyOrdersService.js";`
  - `src/controllers/CmpDormanDormantProcedureController.js`: `import CmpDormanDormantProcedureService from "../services/CmpDormanDormantProcedureService.js";`
- Target style:
  - All controllers should import services via `src/services/index.js`.

### services -> repositories
- Index imports: 4
- Deep imports: 2
- Violations:
  - `src/services/CmpEmpDailyOrdersService.js`: `import CmpEmpDailyOrdersRepository from "../repositories/CmpEmpDailyOrdersRepository.js";`
  - `src/services/CmpDormanDormantProcedureService.js`: `import { runDormantOrchestrator } from "../repositories/procedures/index.js";`
- Target style:
  - All services should import repositories via `src/repositories/index.js` (procedures are already re-exported there).

### repositories -> models/db
- Index imports: 0
- Deep imports: 5
- Violations (if models index is considered public):
  - `src/repositories/CmpDormanClientMonthlyDataRepository.js`: `import CmpDormanClientMonthlyDataModel from "../models/CmpDormanClientMonthlyDataModel.js";`
  - `src/repositories/CmpDormanClientControlRepository.js`: `import CmpDormanClientControlModel from "../models/CmpDormanClientControlModel.js";`
  - `src/repositories/CmpDormanSummaryRepository.js`: `import CmpDormanSummaryModel from "../models/CmpDormanSummaryModel.js";`
  - `src/repositories/CmpDormanSummaryViewRepository.js`: `import CmpDormanSummaryViewModel from "../models/CmpDormanSummaryViewModel.js";`
  - `src/repositories/CmpEmpDailyOrdersRepository.js`: `import CmpEmpDailyOrdersModel from "../models/CmpEmpDailyOrdersModel.js";`
- Target style (if adopted):
  - `import { db } from "../models/index.js"` and access `db.<ModelName>`.

### any layer -> utils
- Index imports: 16
- Deep imports: 8
- Violations:
  - `src/app.js`: `import logger from "./utils/logging/logger.js";`
  - `src/server.js`: `import logger from "./utils/logging/logger.js";`
  - `src/middlewares/rateLimiter.js`: `import logger from "../utils/logging/logger.js";`
  - `src/middlewares/index.js`: `import logger from "../utils/logging/logger.js";`
  - `src/controllers/CmpDormanDormantProcedureController.js`: `import { asyncWrapper } from "../utils/async/asyncWrapper.js";`
  - `src/routes/v1/cmpDormanSummary.routes.js`: `import { asyncWrapper } from "../../utils/async/asyncWrapper.js";`
  - `src/routes/v1/cmpDormanSummaryView.routes.js`: `import { asyncWrapper } from "../../utils/async/asyncWrapper.js";`
  - `src/routes/v1/cmpDormanClientControl.routes.js`: `import { asyncWrapper } from "../../utils/async/asyncWrapper.js";`
- Target style:
  - All cross-layer imports must use `src/utils/index.js` only.

### any layer -> config
- Index imports: 0
- Deep imports: 21
- Violations (no index exists yet):
  - `src/app.js`: `import { ENV } from "./config/bootstrap.js";`
  - `src/app.js`: `import { getCorsOptions } from "./config/cors.js";`
  - `src/server.js`: `import { ENV } from "./config/bootstrap.js";`
  - `src/server.js`: `import { initOracleClientOnce } from "./config/oracleClient.js";`
  - `src/server.js`: `import { initOraclePool, closeOraclePool } from "./config/oraclePool.js";`
  - `src/server.js`: `import { getSequelize, initSequelize, closeSequelize } from "./config/sequelize.js";`
  - `src/models/index.js`: `import { ENV } from "../config/bootstrap.js";`
  - `src/models/*.js`: `import { getSequelize } from "../config/sequelize.js";` (5 files)
  - `src/services/HealthService.js`: `import { ENV } from "../config/bootstrap.js";`
  - `src/services/HealthService.js`: `import { getOraclePool, initOraclePool } from "../config/oraclePool.js";`
  - `src/services/HealthService.js`: `import { getSequelize } from "../config/sequelize.js";`
  - `src/services/DiagnosticService.js`: same pattern as above
  - `src/middlewares/errorMiddleware.js`: `import { ENV } from "../config/bootstrap.js";`
  - `src/repositories/procedures/runner/oracleProcedureRunner.js`: `import { getOraclePool, initOraclePool } from "../../../config/oraclePool.js";`
  - `src/utils/logging/logger.js`: `import { ENV } from "../../config/bootstrap.js";`
- Target style:
  - Add `src/config/index.js` and route all cross-layer config imports through it.

## 3) Exception List (Deep Imports Allowed)
No confirmed exceptions yet. Potential exception:
- repositories -> models: `src/repositories/*.js` direct model imports may remain if `src/models/index.js` is not intended as a stable public API (it only exports `db` and `syncModels`, not per-model exports). If no models index expansion is desired, document these as allowed deep imports.

## 4) Action Plan (Review Only)
1) Create `src/config/index.js` exporting ENV, CORS, Sequelize, Oracle client/pool helpers.
2) Create `src/validators/index.js` exporting public validators used by routes.
3) Expand `src/controllers/index.js` to include Health/Diagnostic/DormantProcedure controllers.
4) Expand `src/services/index.js` to include HealthService and DiagnosticService.
5) Update route/controller/service imports to use layer index files.
6) Decide on models index strategy:
   - Option A: Export named models from `src/models/index.js` to allow repositories -> models via index.
   - Option B: Keep direct model imports and document as exceptions to avoid over-bundling.
7) Replace all cross-layer utils/config deep imports with `src/utils/index.js` and `src/config/index.js`.

## 5) Summary
Current usage is mixed: controllers/services/repositories mostly use indexes, but routes, utils, and config are inconsistent. Unifying through index.js files is feasible with minimal risk, except for the models layer where a clear public API decision is needed.
