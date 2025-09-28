// services/CmpDormanClientMonthlyDataService.js
import { Op } from "sequelize";
import { CmpDormanClientMonthlyDataRepository } from "../repositories/index.js";
import { ErrorFactory } from "../utils/index.js";

export default {
  list(filters = {}) {
    return CmpDormanClientMonthlyDataRepository.findAll(filters);
  },

  listGte2025() {
    return CmpDormanClientMonthlyDataRepository.findGte2025();
  },

  async getById(profileId) {
    if (!profileId) {
      throw ErrorFactory.badRequest("Profile ID is required");
    }
    const result =
      await CmpDormanClientMonthlyDataRepository.findById(profileId);
    if (!result) {
      throw ErrorFactory.notFound(
        `Record with profileId ${profileId} not found`
      );
    }
    return result;
  },

  searchAll(term) {
    if (!term || term.trim().length === 0) {
      throw ErrorFactory.badRequest("Search term is required");
    }
    return CmpDormanClientMonthlyDataRepository.searchAll(term.trim());
  },

  listByYear(year) {
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      throw ErrorFactory.badRequest("Year must be between 1900 and 2100");
    }
    return CmpDormanClientMonthlyDataRepository.findAll({
      analysisPeriodFrom: {
        [Op.gte]: yearNum * 10000,
        [Op.lte]: (yearNum + 1) * 10000 - 1,
      },
    });
  },

  listByYearAndMonth(year, month) {
    return CmpDormanClientMonthlyDataRepository.findAll({
      analysisMonth: month,
      analysisPeriodFrom: {
        [Op.gte]: year * 10000,
        [Op.lte]: (year + 1) * 10000 - 1,
      },
    });
  },

  listByInactivityYear(year) {
    return CmpDormanClientMonthlyDataRepository.findAll({
      inactivityToYear: year,
    });
  },

  listByInactivityYearAndMonth(year, month) {
    return CmpDormanClientMonthlyDataRepository.findAll({
      inactivityToYear: year,
      analysisMonth: month,
    });
  },
};
