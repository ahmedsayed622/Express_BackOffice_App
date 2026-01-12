// utils/http/queryParams.js
export function buildPagination(query, { mode, defaultLimit = 100, defaultOffset = 0 }) {
  const pagination = { mode };
  const hasLimit = query.limit !== undefined;
  const hasOffset = query.offset !== undefined;

  if (mode === "always" || hasLimit || hasOffset) {
    pagination.limit = hasLimit ? parseInt(query.limit, 10) : defaultLimit;
    pagination.offset = hasOffset ? parseInt(query.offset, 10) : defaultOffset;
  }

  return pagination;
}

export function buildSort(query) {
  const sort = {};
  if (query.orderBy) {
    const [field, direction = "ASC"] = query.orderBy.split(":");
    sort.orderBy = { field, direction: direction.toUpperCase() };
  }
  return sort;
}

export function buildClientMonthlyDataFilters(query, baseFilters = {}) {
  const filters = { ...baseFilters };
  if (query.year) filters.year = query.year;
  if (query.month) filters.month = query.month;
  if (query.q) filters.q = query.q;
  if (query.status) filters.status = query.status;
  return filters;
}
