// routes/index.js
import { Router } from "express";
import v1Routes from "./v1/index.js";

const router = Router();

// API versioning
router.use("/v1", v1Routes);

// Default version routing (optional - points to latest stable version)
router.use("/", v1Routes);

// Health check for API
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
});

// API documentation endpoint
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Express BackOffice API",
    version: "v1",
    endpoints: {
      health: "/api/health",
      v1: {
        dormantClients: {
          from2025: "GET /api/v1/dormant-clients/from-2025",
          byYear: "GET /api/v1/dormant-clients/year/:year",
          byYearAndMonth: "GET /api/v1/dormant-clients/year/:year/month/:month",
          statistics: "GET /api/v1/dormant-clients/statistics",
        },
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
