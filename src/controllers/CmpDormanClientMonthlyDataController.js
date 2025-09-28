// controllers/CmpDormanClientMonthlyDataController.js
import { CmpDormanClientMonthlyDataService } from "../services/index.js";
import { asyncWrapper, ErrorFactory } from "../utils/index.js";

const list = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientMonthlyDataService.list(req.query);
  return res.json({ success: true, data });
});

const listGte2025 = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientMonthlyDataService.listGte2025();
  return res.json({ success: true, data });
});

const getById = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientMonthlyDataService.getById(req.params.id);
  if (!data) {
    throw ErrorFactory.notFound("Record not found");
  }
  return res.json({ success: true, data });
});

const searchAll = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientMonthlyDataService.searchAll(req.query.q);
  return res.json({ success: true, data });
});

const byYear = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientMonthlyDataService.listByYear(
    req.params.year
  );
  return res.json({ success: true, data });
});

const byYearMonth = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientMonthlyDataService.listByYearAndMonth(
    req.params.year,
    req.params.month
  );
  return res.json({ success: true, data });
});

const byInactYear = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientMonthlyDataService.listByInactivityYear(
    req.params.year
  );
  return res.json({ success: true, data });
});

const byInactYearMonth = asyncWrapper(async (req, res) => {
  const data =
    await CmpDormanClientMonthlyDataService.listByInactivityYearAndMonth(
      req.params.year,
      req.params.month
    );
  return res.json({ success: true, data });
});

export {
  list,
  listGte2025,
  getById,
  searchAll,
  byYear,
  byYearMonth,
  byInactYear,
  byInactYearMonth,
};
