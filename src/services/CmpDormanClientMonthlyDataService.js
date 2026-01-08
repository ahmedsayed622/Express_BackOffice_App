// services/CmpDormanClientMonthlyDataService.js
import { Op } from "sequelize";
import { CmpDormanClientMonthlyDataRepository } from "../repositories/index.js";
import { ErrorFactory } from "../utils/index.js";

/**
 * Build Sequelize where conditions from filters
 */
function buildWhereConditions(filters) {
  const where = {};

  if (filters.year !== undefined && filters.year !== null) {
  where.inactivityToYear = Number(filters.year);
}


 if (filters.month !== undefined && filters.month !== null) {
  where.analysisMonth = Number(filters.month);
}


  if (filters.status) {
    // Map status to appropriate field if needed
    // This is a placeholder - adjust based on actual status field
    where.status = filters.status;
  }

  if (filters.q) {
    // Search across multiple fields
    const term = filters.q.trim();
    const isNumeric = /^\d+$/.test(term);
    
    where[Op.or] = [
      { profileId: { [Op.like]: `%${term}%` } },
      { clientNameEn: { [Op.like]: `%${term}%` } },
      { unifiedCode: { [Op.like]: `%${term}%` } },
    ];

    if (isNumeric) {
      const numericTerm = parseInt(term, 10);
      where[Op.or].push(
        { analysisPeriodFrom: numericTerm },
        { analysisPeriodTo: numericTerm },
        { analysisMonth: numericTerm },
        { inactivityFromYear: numericTerm },
        { inactivityToYear: numericTerm }
      );
    }
  }

  return where;
}

/**
 * Build Sequelize order array from sort options
 */
function buildOrderClause(sort) {
  if (sort.orderBy) {
    return [[sort.orderBy.field, sort.orderBy.direction]];
  }
  // Default ordering
  return [
    ["analysisPeriodFrom", "DESC"],
    ["profileId", "ASC"],
  ];
}

export default {
  /**
   * Collection endpoint - Always paginated
   */
  async getCollection(queryObject) {
    const { filters, pagination, sort } = queryObject;

    const where = buildWhereConditions(filters);
    const order = buildOrderClause(sort);

    // Ensure limit and offset are valid numbers
    const options = {
      limit: Number(pagination.limit) || 100,
      offset: Number(pagination.offset) || 0,
    };

    const result = await CmpDormanClientMonthlyDataRepository.findAndCountAll(
      where,
      order,
      options
    );

    return {
      data: result.rows,
      count: result.rows.length,
      total: result.count,
    };
  },

  /**
   * Year-specific endpoint - Optional pagination
   */
  async getByYear(queryObject) {
    const { filters, pagination, sort } = queryObject;

    const where = buildWhereConditions(filters);
    const order = buildOrderClause(sort);

    // If pagination provided, use it
    if (pagination.limit !== undefined) {
      const options = {
        limit: Number(pagination.limit) || 100,
        offset: Number(pagination.offset) || 0,
      };

      const result = await CmpDormanClientMonthlyDataRepository.findAndCountAll(
        where,
        order,
        options
      );

      return {
        data: result.rows,
        count: result.rows.length,
        total: result.count,
      };
    }

    // No pagination - return all for year
    const data = await CmpDormanClientMonthlyDataRepository.findAll(
      where,
      order
    );

    return { data };
  },

  /**
   * Get by profile ID (single record)
   */
  async getByProfileId(profileId) {
    if (!profileId) {
      throw ErrorFactory.badRequest("Profile ID is required");
    }

    const result = await CmpDormanClientMonthlyDataRepository.findById(
      profileId
    );

    if (!result) {
      throw ErrorFactory.notFound(
        `Record with profileId ${profileId} not found`
      );
    }

    return result;
  },
};
