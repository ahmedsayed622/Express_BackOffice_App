// controllers/CmpEmpDailyOrdersController.js
import { CmpEmpDailyOrdersService } from "../services/index.js";
import { asyncWrapper } from "../utils/index.js";

/**
 * List employee daily orders with optional filters
 * GET /api/v1/client-emp-daily-orders
 * Query params: execId, invoiceNo, profileId, stockId, from, to
 */
export const list = asyncWrapper(async (req, res) => {
  const filters = {
    execId: req.query.execId,
    invoiceNo: req.query.invoiceNo,
    profileId: req.query.profileId,
    stockId: req.query.stockId,
    from: req.query.from,
    to: req.query.to,
  };

  // Remove undefined values
  Object.keys(filters).forEach((key) => {
    if (filters[key] === undefined) {
      delete filters[key];
    }
  });

  const data = await CmpEmpDailyOrdersService.list(filters);
  res.json({ success: true, data });
});

/**
 * Get orders by invoice number
 * GET /api/v1/client-emp-daily-orders/invoice/:invoiceNo
 */
export const byInvoiceNo = asyncWrapper(async (req, res) => {
  const { invoiceNo } = req.params;
  const data = await CmpEmpDailyOrdersService.byInvoiceNo(invoiceNo);
  res.json({ success: true, data });
});

/**
 * Get orders by execution ID
 * GET /api/v1/client-emp-daily-orders/exec/:execId
 */
export const byExecId = asyncWrapper(async (req, res) => {
  const { execId } = req.params;
  const data = await CmpEmpDailyOrdersService.byExecId(execId);
  res.json({ success: true, data });
});

/**
 * Get orders by exact invoice date
 * GET /api/v1/client-emp-daily-orders/date/:date
 */
export const byInvoiceDateExact = asyncWrapper(async (req, res) => {
  const { date } = req.params;
  const data = await CmpEmpDailyOrdersService.byInvoiceDateExact(date);
  res.json({ success: true, data });
});

/**
 * Get orders from a specific date onwards
 * GET /api/v1/client-emp-daily-orders/from/:from
 */
export const byInvoiceDateFrom = asyncWrapper(async (req, res) => {
  const { from } = req.params;
  const data = await CmpEmpDailyOrdersService.byInvoiceDateFrom(from);
  res.json({ success: true, data });
});

/**
 * Get orders within a date range
 * GET /api/v1/client-emp-daily-orders/range?from=YYYYMMDD&to=YYYYMMDD
 */
export const byInvoiceDateRange = asyncWrapper(async (req, res) => {
  const { from, to } = req.query;
  const data = await CmpEmpDailyOrdersService.byInvoiceDateRange(from, to);
  res.json({ success: true, data });
});

/**
 * Search orders across multiple fields
 * GET /api/v1/client-emp-daily-orders/search?q=term
 */
export const search = asyncWrapper(async (req, res) => {
  const { q } = req.query;
  const data = await CmpEmpDailyOrdersService.search(q);
  res.json({ success: true, data });
});
