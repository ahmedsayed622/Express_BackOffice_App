// routes/v1/cmpDormanClientMonthlyData.routes.js
import express from "express";
import { CmpDormanClientMonthlyDataController } from "../../controllers/index.js";
import validateRequest from "../../middlewares/validateRequest.js";
import {
  yearParam,
  monthParam,
  profileIdParam,
  searchQuery,
} from "../../validators/cmpDormanValidators.js";

const router = express.Router();

// Client Monthly Data routes
router.get("/", CmpDormanClientMonthlyDataController.list);
router.get("/gte-2025", CmpDormanClientMonthlyDataController.listGte2025);
router.get(
  "/search",
  searchQuery,
  validateRequest,
  CmpDormanClientMonthlyDataController.searchAll
); // ?q=term
router.get(
  "/year/:year",
  yearParam,
  validateRequest,
  CmpDormanClientMonthlyDataController.byYear
);
router.get(
  "/year/:year/month/:month",
  [...yearParam, ...monthParam],
  validateRequest,
  CmpDormanClientMonthlyDataController.byYearMonth
);
router.get(
  "/inact-year/:year",
  yearParam,
  validateRequest,
  CmpDormanClientMonthlyDataController.byInactYear
);
router.get(
  "/inact-year/:year/month/:month",
  [...yearParam, ...monthParam],
  validateRequest,
  CmpDormanClientMonthlyDataController.byInactYearMonth
);
router.get(
  "/:id",
  profileIdParam,
  validateRequest,
  CmpDormanClientMonthlyDataController.getById
);

export default router;
