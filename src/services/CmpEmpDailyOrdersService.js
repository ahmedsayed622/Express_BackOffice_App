// services/CmpEmpDailyOrdersService.js
import { CmpEmpDailyOrdersRepository } from "../repositories/index.js";

function buildPagination(limit, offset, total, count) {
  if (limit === undefined && offset === undefined) {
    return undefined;
  }

  return {
    limit,
    offset,
    count,
    total,
  };
}

const CmpEmpDailyOrdersService = {
  async getCollection(query = {}) {
    const {
      date,
      from,
      to,
      invoiceNo,
      execId,
      stockId,
      q,
      limit,
      offset,
      orderBy,
    } = query;

    const result = await CmpEmpDailyOrdersRepository.findWithFilters({
      date,
      from,
      to,
      invoiceNo,
      execId,
      stockId,
      q,
      limit,
      offset,
      orderBy,
    });

    if (result && result.rows) {
      return {
        data: result.rows,
        pagination: buildPagination(
          limit,
          offset,
          result.count,
          result.rows.length
        ),
      };
    }

    return { data: result };
  },

  async getByProfileId(profileId, query = {}) {
    const {
      date,
      from,
      to,
      invoiceNo,
      execId,
      stockId,
      q,
      limit,
      offset,
      orderBy,
    } = query;

    const result = await CmpEmpDailyOrdersRepository.findWithFilters({
      profileId,
      date,
      from,
      to,
      invoiceNo,
      execId,
      stockId,
      q,
      limit,
      offset,
      orderBy,
    });

    if (result && result.rows) {
      return {
        data: result.rows,
        pagination: buildPagination(
          limit,
          offset,
          result.count,
          result.rows.length
        ),
      };
    }

    return { data: result };
  },
};

export default CmpEmpDailyOrdersService;
