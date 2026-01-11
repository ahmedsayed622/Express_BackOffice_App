// routes/v1/cmpDormanClientControl.routes.js
import express from "express";
import { asyncWrapper } from "../../utils/index.js";
import { CmpDormanClientControlController } from "../../controllers/index.js";

const router = express.Router();

// Client Control routes
router.get("/", asyncWrapper(CmpDormanClientControlController.list));

export default router;
