// routes/v1/index.js
import { Router } from "express";
import cmpDormanClientMonthlyDataRoutes from "./cmpDormanClientMonthlyData.routes.js";
import cmpDormanClientControlRoutes from "./cmpDormanClientControl.routes.js";
import cmpDormanSummaryRoutes from "./cmpDormanSummary.routes.js";
import cmpDormanSummaryViewRoutes from "./cmpDormanSummaryView.routes.js";
import cmpEmpDailyOrdersRoutes from "./cmpEmpDailyOrders.routes.js";
import {
  CmpDormanDormantProcedureController,
  HealthController,
  DiagnosticController,
} from "../../controllers/index.js";
import { validateRequest, requireApiKey } from "../../middlewares/index.js";
import { asyncWrapper } from "../../utils/index.js";
import {
  timeoutQuery,
  timeoutBody,
} from "../../validators/index.js";

const router = Router();

// Health check endpoints
router.get(
  "/health/integrations",
  asyncWrapper(HealthController.checkIntegrations)
);

// Require API key for all remaining v1 routes
router.use(requireApiKey);

// Mount all routes with their respective paths
router.use("/client-monthly-data", cmpDormanClientMonthlyDataRoutes);
router.use("/client-control", cmpDormanClientControlRoutes);
router.use("/summary", cmpDormanSummaryRoutes);
router.use("/summary-view", cmpDormanSummaryViewRoutes);
router.use("/client-emp-daily-orders", cmpEmpDailyOrdersRoutes);

// Diagnostic endpoints (development/staging only)
router.get(
  "/diagnostics/schema-data",
  asyncWrapper(DiagnosticController.checkSchemaAndData)
);

// Procedure endpoints
router.post(
  "/procedures/dormant-orchestrator",
  [...timeoutQuery, ...timeoutBody],
  validateRequest,
  asyncWrapper(CmpDormanDormantProcedureController.run)
);

// Add other v1 routes here as they are created
// router.use("/other-resource", otherRoutes);

export default router;
