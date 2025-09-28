// routes/v1/cmpDormanSummary.routes.js
import express from "express";
import { asyncWrapper } from "../../utils/asyncWrapper.js";
import { CmpDormanSummaryController } from "../../controllers/index.js";

const router = express.Router();

// Summary routes (table)
router.get("/", asyncWrapper(CmpDormanSummaryController.list));
router.get(
  "/latest/:year",
  asyncWrapper(CmpDormanSummaryController.latestByYear)
);

export default router;
