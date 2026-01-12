// controllers/CmpDormanClientMonthlyDataController.js
import { CmpDormanClientMonthlyDataService } from "../services/index.js";
import {
  ErrorFactory,
  buildPagination,
  buildSort,
  buildClientMonthlyDataFilters,
} from "../utils/index.js";

/**
 * Collection endpoint - Always paginated
 * GET /v1/client-monthly-data
 */
const getCollection = async (req, res) => {
  const filters = buildClientMonthlyDataFilters(req.query);
  const pagination = buildPagination(req.query, { mode: "always" });
  const sort = buildSort(req.query);

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
};

/**
 * Year-specific endpoint - Optional pagination
 * GET /v1/client-monthly-data/year/:year
 */
const getByYear = async (req, res) => {
  const year = parseInt(req.params.year, 10);

  // Build sanitized filters
  const filters = buildClientMonthlyDataFilters(req.query, { year });
  const pagination = buildPagination(req.query, { mode: "optional" });
  const sort = buildSort(req.query);

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
};

/**
 * Profile-specific endpoint (single record)
 * GET /v1/client-monthly-data/profile/:profileId
 */
const getByProfileId = async (req, res) => {
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
};

export { getCollection, getByYear, getByProfileId };
