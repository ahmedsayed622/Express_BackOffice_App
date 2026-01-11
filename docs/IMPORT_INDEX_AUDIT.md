# Import Index Audit

Scope: enforce a single "layer index" import convention across controllers/services/repositories/validators/middlewares/utils/config, plus error system audit.

## Part A - Layer Audit (No Code Changes)

### Layer: `src/controllers`
- Index present: `src/controllers/index.js`
- Current exports:
  - `CmpDormanClientMonthlyDataController`
  - `CmpDormanClientControlController`
  - `CmpDormanSummaryController`
  - `CmpDormanSummaryViewController`
  - `CmpEmpDailyOrdersController`
- Public API (should be exported):
  - All controllers used by routes, plus Health/Diagnostic/DormantProcedure controllers (currently not exported).
- Internal (should not be exported):
  - None identified; controllers are public entrypoints.

### Layer: `src/services`
- Index present: `src/services/index.js`
- Current exports:
  - `CmpDormanClientMonthlyDataService`
  - `CmpDormanClientControlService`
  - `CmpDormanSummaryService`
  - `CmpDormanSummaryViewService`
  - `CmpDormanDormantProcedureService`
  - `CmpEmpDailyOrdersService`
- Public API (should be exported):
  - Above services plus `HealthService` and `DiagnosticService` (currently deep-imported).
- Internal:
  - None identified; services are consumed by controllers.

### Layer: `src/repositories`
- Index present: `src/repositories/index.js`
- Current exports:
  - `CmpDormanClientMonthlyDataRepository`
  - `CmpDormanClientControlRepository`
  - `CmpDormanSummaryRepository`
  - `CmpDormanSummaryViewRepository`
  - `CmpEmpDailyOrdersRepository`
  - Re-exports from `src/repositories/procedures/index.js`
- Public API:
  - Above repositories and procedure wrappers used by services.
- Internal:
  - `src/repositories/procedures/runner/*` should remain internal (called by wrappers).

### Layer: `src/validators`
- Index present: No (`src/validators/index.js` missing)
- Current exports:
  - N/A (direct file imports only)
- Public API (should be exported):
  - Validators used by routes:
    - `cmpDormanValidators.js`
    - `cmpEmpDailyOrdersValidators.js`
    - `common.js` (if used by routes/controllers)
- Internal:
  - Helper-only validators if not used cross-layer.

### Layer: `src/middlewares`
- Index present: `src/middlewares/index.js`
- Current exports:
  - `requestLogger`, `authenticate`, `handlePreflight`
  - `generalLimiter`, `strictLimiter`, `apiLimiter`
  - `validateRequest`, `errorMiddleware`
- Public API:
  - All exports above.
- Internal:
  - Implementation files (`rateLimiter.js`, `validateRequest.js`, `errorMiddleware.js`).

### Layer: `src/utils`
- Index present: `src/utils/index.js`
- Current exports:
  - `asyncWrapper`
  - `ErrorFactory`, `createError`, `isAppError`
  - `ERROR_CODES`
  - `CustomError`
  - `logger`
  - `HTTP_STATUS_CODES`, `HttpStatusCodes`
  - `projectRoot`, `resolveFromRoot`, `getDirname`, `getFilename`
- Public API:
  - Above exports.
- Internal:
  - Subfolder modules (`async/*`, `errors/*`, `logging/*`, `http/*`, `paths/*`) should not be imported directly cross-layer.

### Layer: `src/config`
- Index present: No (`src/config/index.js` missing)
- Current exports:
  - N/A (direct file imports only)
- Public API (should be exported):
  - `ENV` (bootstrap)
  - Sequelize: `getSequelize`, `initSequelize`, `closeSequelize`
  - Oracle client: `initOracleClientOnce`
  - Oracle pool: `initOraclePool`, `getOraclePool`, `closeOraclePool`, `getPoolStats`
  - CORS: `getCorsOptions`
- Internal:
  - `bootstrap.js` should remain the source of truth for env loading (but exported via index).

## Deep Imports to Replace (Safe)
Controllers -> Services:
- `src/controllers/HealthController.js` -> `../services/HealthService.js`
- `src/controllers/DiagnosticController.js` -> `../services/DiagnosticService.js`
- `src/controllers/CmpEmpDailyOrdersController.js` -> `../services/CmpEmpDailyOrdersService.js`
- `src/controllers/CmpDormanDormantProcedureController.js` -> `../services/CmpDormanDormantProcedureService.js`

Routes -> Controllers:
- `src/routes/v1/index.js` -> direct controller files
- `src/routes/v1/cmpEmpDailyOrders.routes.js` -> `../../controllers/CmpEmpDailyOrdersController.js`

Routes -> Middlewares:
- `src/routes/v1/index.js` -> `../../middlewares/validateRequest.js`
- `src/routes/v1/cmpDormanClientMonthlyData.routes.js` -> `../../middlewares/validateRequest.js`

Routes -> Validators:
- `src/routes/v1/index.js` -> `../../validators/cmpDormanValidators.js`
- `src/routes/v1/cmpEmpDailyOrders.routes.js` -> `../../validators/cmpEmpDailyOrdersValidators.js`
- `src/routes/v1/cmpDormanClientMonthlyData.routes.js` -> `../../validators/cmpDormanValidators.js`

Services -> Repositories:
- `src/services/CmpEmpDailyOrdersService.js` -> `../repositories/CmpEmpDailyOrdersRepository.js`

Services -> Config:
- `src/services/HealthService.js` -> `../config/bootstrap.js`, `../config/oraclePool.js`, `../config/sequelize.js`
- `src/services/DiagnosticService.js` -> `../config/bootstrap.js`, `../config/oraclePool.js`, `../config/sequelize.js`

Models -> Config:
- `src/models/*.js` -> `../config/sequelize.js`
- `src/models/index.js` -> `../config/bootstrap.js`

Repositories -> Config:
- `src/repositories/procedures/runner/oracleProcedureRunner.js` -> `../../../config/oraclePool.js`

App/Server -> Utils/Config:
- `src/app.js` -> `./utils/logging/logger.js`, `./config/*.js`
- `src/server.js` -> `./utils/logging/logger.js`, `./config/*.js`
- `src/middlewares/rateLimiter.js` -> `../utils/logging/logger.js`
- `src/middlewares/index.js` -> `../utils/logging/logger.js`
- `src/controllers/CmpDormanDormantProcedureController.js` -> `../utils/async/asyncWrapper.js`
- `src/routes/v1/*` -> `../../utils/async/asyncWrapper.js`

## Deep Imports to Keep (Exceptions + Reasons)
- None confirmed yet. If any new circular dependency is found while routing through layer indexes, it must be listed here with the cycle explanation.

## Error System Audit (Mandatory)

### Files Reviewed
- `src/constants/errorCodes.js`
- `src/utils/errors/errorFactory.js`
- `src/utils/errors/exceptions/CustomError.js`
- Imports of `ErrorFactory`, `createError`, `CustomError`, `ERROR_CODES` (see scan results)

### Runtime Usage of ERROR_CODES
Used codes:
- `INTERNAL_ERROR` (error middleware fallback)
- `VALIDATION_ERROR` (validateRequest, error middleware)
- `NOT_FOUND` (ErrorFactory.notFound usage)
- `BAD_REQUEST` (ErrorFactory.badRequest usage)
- `DATABASE_ERROR` (error middleware Oracle handler)
- `PROC_ERROR` (procedure runner + ErrorFactory.procError)
- `ALREADY_RUNNING` (procedure runner + ErrorFactory.alreadyRunning)
- `TIMEOUT` (procedure runner + ErrorFactory.timeout)
- `DUPLICATE_ENTRY` (error middleware unique constraint)

All current codes are referenced at runtime.

### CustomError Subclasses
Subclasses present:
- `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `DatabaseError`

Observed instantiations:
- No direct instantiation found in current codebase.

### ErrorFactory as Public API
Usage shows that `ErrorFactory` is the primary error creation API:
- Controllers/services/middlewares throw via `ErrorFactory.*`
- Error middleware treats any ErrorFactory-created error as app errors.

Note: `HealthService`/`DiagnosticService` call `ErrorFactory.createError(...)` but `createError` is exported as a standalone function (not a member of `ErrorFactory`). This is an inconsistency to correct after the audit.

### Redundancy Assessment
Current design is layered (codes + factory + base class), but subclasses are unused and add no runtime value.

Conclusion:
- Keep as official error API:
  - `ErrorFactory` (and `createError`)
  - `CustomError` base class
  - `ERROR_CODES`
- Hide or remove:
  - CustomError subclasses (unless a usage appears later). They are redundant in current usage.

## Conventions to Enforce
1) Cross-layer imports must go through layer index.js:
   - Controllers -> `../services/index.js`
   - Services -> `../repositories/index.js`
   - Routes -> `../controllers/index.js`
   - Routes -> `../validators/index.js`
   - Any layer -> `../middlewares/index.js`
   - Any layer -> `../utils/index.js`
   - Any layer -> `../config/index.js`
2) Internal files within the same layer may be imported directly if they are not part of the public API.
3) Exceptions are allowed only to avoid circular dependencies and must be documented.

## Next Step
Proceed to Part B (create/normalize layer indexes), then Part C (refactor imports), then Part D (update this document with changes and verification).
