// controllers/CmpEmpDailyOrdersController.js
import { CmpEmpDailyOrdersService } from "../services/index.js";

/**
 * List employee daily orders with optional filters
 * GET /api/v1/client-emp-daily-orders
 */
export const getCollection = async (req, res) => {
  const query = {
    date: req.query.date,
    from: req.query.from,
    to: req.query.to,
    invoiceNo: req.query.invoiceNo,
    execId: req.query.execId,
    stockId: req.query.stockId,
    q: req.query.q,
    limit: req.query.limit,
    offset: req.query.offset,
    orderBy: req.query.orderBy,
  };

  const result = await CmpEmpDailyOrdersService.getCollection(query);

  return res.json({
    success: true,
    data: result.data,
    ...(result.pagination ? { pagination: result.pagination } : {}),
  });
};

/**
 * List employee daily orders by profile ID with optional filters
 * GET /api/v1/client-emp-daily-orders/profile/:profileId
 */
export const getByProfileId = async (req, res) => {
  const query = {
    date: req.query.date,
    from: req.query.from,
    to: req.query.to,
    invoiceNo: req.query.invoiceNo,
    execId: req.query.execId,
    stockId: req.query.stockId,
    q: req.query.q,
    limit: req.query.limit,
    offset: req.query.offset,
    orderBy: req.query.orderBy,
  };

  const result = await CmpEmpDailyOrdersService.getByProfileId(
    req.params.profileId,
    query
  );

  return res.json({
    success: true,
    data: result.data,
    ...(result.pagination ? { pagination: result.pagination } : {}),
  });
};
