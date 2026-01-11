// routes/v1/cmpEmpDailyOrders.routes.js
import { Router } from "express";
import { CmpEmpDailyOrdersController } from "../../controllers/index.js";
import { validateRequest } from "../../middlewares/index.js";
import {
  invoiceNoParam,
  execIdParam,
  yyyymmddParam,
  fromDateParam,
  rangeQuery,
  empDailyOrdersSearchQuery,
  listFilters,
} from "../../validators/index.js";

const router = Router();

// List orders with optional filters
// GET /client-emp-daily-orders?execId=...&invoiceNo=...&profileId=...&stockId=...&from=...&to=...
router.get("/", listFilters, validateRequest, CmpEmpDailyOrdersController.list);

// Get orders by invoice number
// GET /client-emp-daily-orders/invoice/:invoiceNo
router.get(
  "/invoice/:invoiceNo",
  invoiceNoParam,
  validateRequest,
  CmpEmpDailyOrdersController.byInvoiceNo
);

// Get orders by execution ID
// GET /client-emp-daily-orders/exec/:execId
router.get(
  "/exec/:execId",
  execIdParam,
  validateRequest,
  CmpEmpDailyOrdersController.byExecId
);

// Get orders by exact date
// GET /client-emp-daily-orders/date/:date
router.get(
  "/date/:date",
  yyyymmddParam,
  validateRequest,
  CmpEmpDailyOrdersController.byInvoiceDateExact
);

// Get orders from a specific date onwards
// GET /client-emp-daily-orders/from/:from
router.get(
  "/from/:from",
  fromDateParam,
  validateRequest,
  CmpEmpDailyOrdersController.byInvoiceDateFrom
);

// Get orders within a date range
// GET /client-emp-daily-orders/range?from=YYYYMMDD&to=YYYYMMDD
router.get(
  "/range",
  rangeQuery,
  validateRequest,
  CmpEmpDailyOrdersController.byInvoiceDateRange
);

// Search orders
// GET /client-emp-daily-orders/search?q=term
router.get(
  "/search",
  empDailyOrdersSearchQuery,
  validateRequest,
  CmpEmpDailyOrdersController.search
);

export default router;
