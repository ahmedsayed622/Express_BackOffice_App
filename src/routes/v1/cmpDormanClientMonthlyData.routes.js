// routes/v1/cmpDormanClientMonthlyData.routes.js
import express from "express";
import { CmpDormanClientMonthlyDataController } from "../../controllers/index.js";
import { validateRequest } from "../../middlewares/index.js";
import { asyncWrapper } from "../../utils/index.js";
import {
  yearParam,
  profileIdParam,
  clientMonthlyDataCollectionQuery,
  clientMonthlyDataYearQuery,
} from "../../validators/index.js";

const router = express.Router();

/**
 * Collection endpoint - Always paginated
 * GET /v1/client-monthly-data
 * Query params: year, month, q, status, orderBy, limit (default 100), offset (default 0)
 */
router.get(
  "/",
  clientMonthlyDataCollectionQuery,
  validateRequest,
  asyncWrapper(CmpDormanClientMonthlyDataController.getCollection)
);

/**
 * Year-specific endpoint - Optional pagination (full year by default)
 * GET /v1/client-monthly-data/year/:year
 * Query params: month, q, status, orderBy, limit (optional), offset (optional)
 */
router.get(
  "/year/:year",
  yearParam,
  clientMonthlyDataYearQuery,
  validateRequest,
  asyncWrapper(CmpDormanClientMonthlyDataController.getByYear)
);

/**
 * Profile-specific endpoint (single record lookup)
 * GET /v1/client-monthly-data/profile/:profileId
 */
router.get(
  "/profile/:profileId",
  profileIdParam,
  validateRequest,
  asyncWrapper(CmpDormanClientMonthlyDataController.getByProfileId)
);

export default router;
