// routes/v1/cmpEmpDailyOrders.routes.js
import { Router } from "express";
import { CmpEmpDailyOrdersController } from "../../controllers/index.js";
import { validateRequest } from "../../middlewares/index.js";
import { asyncWrapper } from "../../utils/index.js";
import { empDailyOrdersQuery, profileIdParam } from "../../validators/index.js";

const router = Router();

// List orders with optional filters
// GET /client-emp-daily-orders?date=YYYYMMDD&from=YYYYMMDD&to=YYYYMMDD&invoiceNo=...&execId=...&stockId=...&q=...&limit=...&offset=...&orderBy=field:direction
router.get(
  "/",
  empDailyOrdersQuery,
  validateRequest,
  asyncWrapper(CmpEmpDailyOrdersController.getCollection)
);

// List orders by profileId with optional filters
// GET /client-emp-daily-orders/profile/:profileId?date=YYYYMMDD&from=YYYYMMDD&to=YYYYMMDD&invoiceNo=...&execId=...&stockId=...&q=...&limit=...&offset=...&orderBy=field:direction
router.get(
  "/profile/:profileId",
  profileIdParam,
  empDailyOrdersQuery,
  validateRequest,
  asyncWrapper(CmpEmpDailyOrdersController.getByProfileId)
);

export default router;
