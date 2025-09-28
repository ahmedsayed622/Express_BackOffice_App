// repositories/CmpDormanClientMonthlyDataRepository.js
import { Op } from "sequelize";
import CmpDormanClientMonthlyDataModel from "../models/CmpDormanClientMonthlyDataModel.js";

export default {
  findAll(
    where = {},
    order = [
      ["analysisPeriodFrom", "DESC"],
      ["profileId", "ASC"],
    ]
  ) {
    return CmpDormanClientMonthlyDataModel.findAll({
      where,
      order,
    });
  },

  findById(profileId) {
    return CmpDormanClientMonthlyDataModel.findByPk(profileId);
  },

  findGte2025() {
    return CmpDormanClientMonthlyDataModel.findAll({
      where: {
        inactivityToYear: {
          [Op.gte]: 2025,
        },
      },
      order: [
        ["inactivityToYear", "DESC"],
        ["profileId", "ASC"],
      ],
    });
  },

  searchAll(term) {
    const isNumeric = /^\d+$/.test(term);
    const whereCondition = {
      [Op.or]: [
        { profileId: { [Op.like]: `%${term}%` } },
        { clientNameEn: { [Op.like]: `%${term}%` } },
        { unifiedCode: { [Op.like]: `%${term}%` } },
      ],
    };

    if (isNumeric) {
      const numericTerm = parseInt(term, 10);
      whereCondition[Op.or].push(
        { analysisPeriodFrom: numericTerm },
        { analysisPeriodTo: numericTerm },
        { analysisMonth: numericTerm },
        { inactivityFromYear: numericTerm },
        { inactivityToYear: numericTerm }
      );
    }

    return CmpDormanClientMonthlyDataModel.findAll({
      where: whereCondition,
    });
  },
};
