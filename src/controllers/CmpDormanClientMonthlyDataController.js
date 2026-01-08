// controllers/CmpDormanClientMonthlyDataController.js
import { CmpDormanClientMonthlyDataService } from "../services/index.js";
import { asyncWrapper, ErrorFactory } from "../utils/index.js";

/**
 * Collection endpoint - Always paginated
 * GET /v1/client-monthly-data
 */
const getCollection = asyncWrapper(async (req, res) => {
  // Build sanitized filters from whitelisted query params
  const filters = {};
  if (req.query.year) filters.year = req.query.year;
  if (req.query.month) filters.month = req.query.month;
  if (req.query.q) filters.q = req.query.q;
  if (req.query.status) filters.status = req.query.status;

  // Build pagination (always applied for collection)
  // Ensure limit and offset are always numbers
  const limit = req.query.limit !== undefined ? parseInt(req.query.limit, 10) : 100;
  const offset = req.query.offset !== undefined ? parseInt(req.query.offset, 10) : 0;
  
  const pagination = {
    limit,
    offset,
    mode: "always",
  };

  // Build sort options
  const sort = {};
  if (req.query.orderBy) {
    const [field, direction = "ASC"] = req.query.orderBy.split(":");
    sort.orderBy = { field, direction: direction.toUpperCase() };
  }

  // Build unified query object
  const queryObject = { filters, pagination, sort };

  // Call service with unified query
  const result = await CmpDormanClientMonthlyDataService.getCollection(
    queryObject
  );

  return res.json({
    success: true,
    data: result.data,
    pagination: {
      limit: pagination.limit,
      offset: pagination.offset,
      count: result.count,
      total: result.total,
    },
  });
});

/**
 * Year-specific endpoint - Optional pagination
 * GET /v1/client-monthly-data/year/:year
 */
const getByYear = asyncWrapper(async (req, res) => {
  const year = parseInt(req.params.year, 10);

  // Build sanitized filters
  const filters = { year };
  if (req.query.month) filters.month = req.query.month;
  if (req.query.q) filters.q = req.query.q;
  if (req.query.status) filters.status = req.query.status;

  // Build pagination (optional for year endpoint)
  const pagination = {
    mode: "optional",
  };

  // If limit/offset provided, apply pagination
  if (req.query.limit !== undefined || req.query.offset !== undefined) {
    pagination.limit = req.query.limit !== undefined ? parseInt(req.query.limit, 10) : 100;
    pagination.offset = req.query.offset !== undefined ? parseInt(req.query.offset, 10) : 0;
  }

  // Build sort options
  const sort = {};
  if (req.query.orderBy) {
    const [field, direction = "ASC"] = req.query.orderBy.split(":");
    sort.orderBy = { field, direction: direction.toUpperCase() };
  }

  // Build unified query object
  const queryObject = { filters, pagination, sort };

  // Call service with unified query
  const result = await CmpDormanClientMonthlyDataService.getByYear(queryObject);

  // Response format depends on whether pagination was applied
  const response = {
    success: true,
    data: result.data,
  };

  if (pagination.limit !== undefined) {
    response.pagination = {
      limit: pagination.limit,
      offset: pagination.offset,
      count: result.count,
      total: result.total,
    };
  }

  return res.json(response);
});

/**
 * Profile-specific endpoint (single record)
 * GET /v1/client-monthly-data/profile/:profileId
 */
const getByProfileId = asyncWrapper(async (req, res) => {
  const profileId = req.params.profileId;
  const data = await CmpDormanClientMonthlyDataService.getByProfileId(
    profileId
  );

  if (!data) {
    throw ErrorFactory.notFound(
      `Record with profileId ${profileId} not found`
    );
  }

  return res.json({ success: true, data });
});

export { getCollection, getByYear, getByProfileId };
