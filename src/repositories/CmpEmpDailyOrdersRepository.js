// repositories/CmpEmpDailyOrdersRepository.js
import { Op } from "sequelize";
import CmpEmpDailyOrdersModel from "../models/CmpEmpDailyOrdersModel.js";

const CmpEmpDailyOrdersRepository = {
  /**
   * Find all records with optional where conditions and ordering
   * @param {Object} where - Where conditions
   * @param {Array} order - Order by conditions
   * @returns {Promise<Array>} Array of records
   */
  async findAll(
    where = {},
    order = [
      ["invoiceDate", "DESC"],
      ["invoiceNo", "DESC"],
    ]
  ) {
    return await CmpEmpDailyOrdersModel.findAll({
      where,
      order,
      raw: true,
    });
  },

  /**
   * Find records by invoice number
   * @param {number} invoiceNo - Invoice number
   * @returns {Promise<Array>} Array of matching records
   */
  async findByInvoiceNo(invoiceNo) {
    return await CmpEmpDailyOrdersModel.findAll({
      where: { invoiceNo },
      order: [["invoiceDate", "DESC"]],
      raw: true,
    });
  },

  /**
   * Find records by execution ID
   * @param {string} execId - Execution ID
   * @returns {Promise<Array>} Array of matching records
   */
  async findByExecId(execId) {
    return await CmpEmpDailyOrdersModel.findAll({
      where: { execId },
      order: [
        ["invoiceDate", "DESC"],
        ["invoiceNo", "DESC"],
      ],
      raw: true,
    });
  },

  /**
   * Find records by exact invoice date (YYYYMMDD)
   * @param {number} yyyymmddNumber - Date in YYYYMMDD format as number
   * @returns {Promise<Array>} Array of matching records
   */
  async findByInvoiceDateExact(yyyymmddNumber) {
    return await CmpEmpDailyOrdersModel.findAll({
      where: { invoiceDate: yyyymmddNumber },
      order: [["invoiceNo", "DESC"]],
      raw: true,
    });
  },

  /**
   * Find records from a specific invoice date onwards
   * @param {number} yyyymmddMin - Minimum date in YYYYMMDD format
   * @returns {Promise<Array>} Array of matching records
   */
  async findByInvoiceDateFrom(yyyymmddMin) {
    return await CmpEmpDailyOrdersModel.findAll({
      where: {
        invoiceDate: {
          [Op.gte]: yyyymmddMin,
        },
      },
      order: [
        ["invoiceDate", "DESC"],
        ["invoiceNo", "DESC"],
      ],
      raw: true,
    });
  },

  /**
   * Find records within an invoice date range
   * @param {number} yyyymmddFrom - Start date in YYYYMMDD format
   * @param {number} yyyymmddTo - End date in YYYYMMDD format
   * @returns {Promise<Array>} Array of matching records
   */
  async findByInvoiceDateRange(yyyymmddFrom, yyyymmddTo) {
    return await CmpEmpDailyOrdersModel.findAll({
      where: {
        invoiceDate: {
          [Op.between]: [yyyymmddFrom, yyyymmddTo],
        },
      },
      order: [
        ["invoiceDate", "DESC"],
        ["invoiceNo", "DESC"],
      ],
      raw: true,
    });
  },

  /**
   * Search across multiple fields
   * @param {string} term - Search term
   * @returns {Promise<Array>} Array of matching records
   */
  async searchAll(term) {
    const numericTerm = parseInt(term);
    const isNumeric = !isNaN(numericTerm) && isFinite(numericTerm);

    const whereClause = {
      [Op.or]: [
        // Always search in string fields
        {
          execId: {
            [Op.like]: `%${term}%`,
          },
        },
        {
          customerNameEn: {
            [Op.like]: `%${term}%`,
          },
        },
        // If term is numeric, search in numeric fields too
        ...(isNumeric
          ? [
              { invoiceNo: numericTerm },
              { invoiceDate: numericTerm },
              { stockId: numericTerm },
              { profileId: numericTerm },
              { secondProfile: numericTerm },
              { qty: numericTerm },
            ]
          : []),
      ],
    };

    return await CmpEmpDailyOrdersModel.findAll({
      where: whereClause,
      order: [
        ["invoiceDate", "DESC"],
        ["invoiceNo", "DESC"],
      ],
      raw: true,
    });
  },
};

export default CmpEmpDailyOrdersRepository;
