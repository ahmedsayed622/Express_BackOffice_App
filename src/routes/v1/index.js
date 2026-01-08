// routes/v1/index.js
import { Router } from "express";
import cmpDormanClientMonthlyDataRoutes from "./cmpDormanClientMonthlyData.routes.js";
import cmpDormanClientControlRoutes from "./cmpDormanClientControl.routes.js";
import cmpDormanSummaryRoutes from "./cmpDormanSummary.routes.js";
import cmpDormanSummaryViewRoutes from "./cmpDormanSummaryView.routes.js";
import cmpEmpDailyOrdersRoutes from "./cmpEmpDailyOrders.routes.js";
import { run as runDormantOrchestrator } from "../../controllers/CmpDormanDormantProcedureController.js";
import { checkIntegrations } from "../../controllers/HealthController.js";
import { checkSchemaAndData } from "../../controllers/DiagnosticController.js";
import validateRequest from "../../middlewares/validateRequest.js";
import {
  timeoutQuery,
  timeoutBody,
} from "../../validators/cmpDormanValidators.js";

const router = Router();

// Mount all routes with their respective paths
router.use("/client-monthly-data", cmpDormanClientMonthlyDataRoutes);
router.use("/client-control", cmpDormanClientControlRoutes);
router.use("/summary", cmpDormanSummaryRoutes);
router.use("/summary-view", cmpDormanSummaryViewRoutes);
router.use("/client-emp-daily-orders", cmpEmpDailyOrdersRoutes);

// Health check endpoints
router.get("/health/integrations", checkIntegrations);

// Diagnostic endpoints (development/staging only)
router.get("/diagnostics/schema-data", checkSchemaAndData);

// Procedure endpoints
router.post(
  "/procedures/dormant-orchestrator",
  [...timeoutQuery, ...timeoutBody],
  validateRequest,
  runDormantOrchestrator
);

// Add other v1 routes here as they are created
// router.use("/other-resource", otherRoutes);

export default router;
