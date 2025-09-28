// routes/v1/cmpDormanSummaryView.routes.js
import express from "express";
import { asyncWrapper } from "../../utils/asyncWrapper.js";
import { CmpDormanSummaryViewController } from "../../controllers/index.js";

const router = express.Router();

// Summary View routes (read-only)
router.get("/", asyncWrapper(CmpDormanSummaryViewController.list));

export default router;
