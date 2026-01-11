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
import { validateRequest } from "../../middlewares/index.js";
import {
  timeoutQuery,
  timeoutBody,
} from "../../validators/index.js";

const router = Router();

// Mount all routes with their respective paths
router.use("/client-monthly-data", cmpDormanClientMonthlyDataRoutes);
router.use("/client-control", cmpDormanClientControlRoutes);
router.use("/summary", cmpDormanSummaryRoutes);
router.use("/summary-view", cmpDormanSummaryViewRoutes);
router.use("/client-emp-daily-orders", cmpEmpDailyOrdersRoutes);

// Health check endpoints
router.get("/health/integrations", HealthController.checkIntegrations);

// Diagnostic endpoints (development/staging only)
router.get("/diagnostics/schema-data", DiagnosticController.checkSchemaAndData);

// Procedure endpoints
router.post(
  "/procedures/dormant-orchestrator",
  [...timeoutQuery, ...timeoutBody],
  validateRequest,
  CmpDormanDormantProcedureController.run
);

// Add other v1 routes here as they are created
// router.use("/other-resource", otherRoutes);

export default router;
