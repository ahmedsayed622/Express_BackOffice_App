# Index Pattern Enforcement Report

## Rules Enforced
- routes -> controllers via `src/controllers/index.js`
- controllers -> services via `src/services/index.js`
- services -> repositories via `src/repositories/index.js`
- any layer -> utils via `src/utils/index.js`
- any layer -> config via `src/config/index.js`
- Allowed exception: repositories -> models deep imports (kept as-is)

## Changed Files
Layer indexes:
- `src/config/index.js` (added)
- `src/validators/index.js` (added)
- `src/controllers/index.js` (expanded exports)
- `src/services/index.js` (expanded exports)

Import updates (cross-layer only):
- `src/app.js`
- `src/server.js`
- `src/middlewares/index.js`
- `src/middlewares/rateLimiter.js`
- `src/middlewares/errorMiddleware.js`
- `src/utils/logging/logger.js`
- `src/controllers/CmpDormanDormantProcedureController.js`
- `src/controllers/HealthController.js`
- `src/controllers/DiagnosticController.js`
- `src/controllers/CmpEmpDailyOrdersController.js`
- `src/routes/v1/index.js`
- `src/routes/v1/cmpEmpDailyOrders.routes.js`
- `src/routes/v1/cmpDormanClientMonthlyData.routes.js`
- `src/routes/v1/cmpDormanClientControl.routes.js`
- `src/routes/v1/cmpDormanSummary.routes.js`
- `src/routes/v1/cmpDormanSummaryView.routes.js`
- `src/services/CmpEmpDailyOrdersService.js`
- `src/services/CmpDormanDormantProcedureService.js`
- `src/services/HealthService.js`
- `src/services/DiagnosticService.js`
- `src/repositories/procedures/runner/oracleProcedureRunner.js`
- `src/models/index.js`
- `src/models/CmpEmpDailyOrdersModel.js`
- `src/models/CmpDormanClientControlModel.js`
- `src/models/CmpDormanClientMonthlyDataModel.js`
- `src/models/CmpDormanSummaryModel.js`
- `src/models/CmpDormanSummaryViewModel.js`

## Explicit Exception
- repositories -> models: kept as direct imports in repository files. Rationale: models layer is not yet defined as a stable public API.

## Confirmation
- No endpoint names changed.
- No behavior, response shape, validation semantics, query logic, or pagination semantics changed.
- Only import paths and index exports were updated.

## Verification Steps
- `npm run start`
- `curl http://localhost:3000/api/v1/client-monthly-data`
- `curl http://localhost:3000/api/v1/client-monthly-data/year/2025`
- `curl http://localhost:3000/api/v1/client-control`
- `curl http://localhost:3000/api/v1/summary`
- `curl http://localhost:3000/api/v1/summary-view`
- `curl http://localhost:3000/api/v1/client-emp-daily-orders`
