// repositories/CmpEmpDailyOrdersRepository.js
import { Op } from "sequelize";
import CmpEmpDailyOrdersModel from "../models/CmpEmpDailyOrdersModel.js";

const CmpEmpDailyOrdersRepository = {
  findWithFilters({
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
  } = {}) {
    const where = {};

    if (profileId !== undefined && profileId !== null && profileId !== "") {
      where.profileId = Number(profileId);
    }

    if (date !== undefined && date !== null && date !== "") {
      where.invoiceDate = Number(date);
    } else if (from !== undefined && to !== undefined) {
      where.invoiceDate = {
        [Op.between]: [Number(from), Number(to)],
      };
    }

    if (invoiceNo !== undefined && invoiceNo !== null && invoiceNo !== "") {
      where.invoiceNo = Number(invoiceNo);
    }

    if (execId !== undefined && execId !== null && execId !== "") {
      where.execId = Number(execId);
    }

    if (stockId !== undefined && stockId !== null && stockId !== "") {
      where.stockId = Number(stockId);
    }

    const andConditions = [];
    if (Object.keys(where).length > 0) {
      andConditions.push(where);
    }

    if (q) {
      const term = String(q).trim();
      const numericTerm = parseInt(term, 10);
      const isNumeric = !Number.isNaN(numericTerm) && Number.isFinite(numericTerm);

      const orConditions = [
        { customerNameEn: { [Op.like]: `%${term}%` } },
        { execId: { [Op.like]: `%${term}%` } },
      ];

      if (isNumeric) {
        orConditions.push(
          { invoiceNo: numericTerm },
          { stockId: numericTerm },
          { profileId: numericTerm },
          { qty: numericTerm },
          { secondProfile: numericTerm },
          { invoiceDate: numericTerm }
        );
      }

      andConditions.push({ [Op.or]: orConditions });
    }

    const finalWhere =
      andConditions.length > 1
        ? { [Op.and]: andConditions }
        : andConditions[0] || {};

    let order = [
      ["invoiceDate", "DESC"],
      ["invoiceNo", "ASC"],
    ];

    if (orderBy) {
      const [field, direction = "ASC"] = String(orderBy).split(":");
      order = [[field, direction.toUpperCase()]];
    }

    const hasPagination = limit !== undefined || offset !== undefined;
    if (hasPagination) {
      return CmpEmpDailyOrdersModel.findAndCountAll({
        where: finalWhere,
        order,
        limit: limit !== undefined ? Number(limit) : undefined,
        offset: offset !== undefined ? Number(offset) : undefined,
        raw: true,
      });
    }

    return CmpEmpDailyOrdersModel.findAll({
      where: finalWhere,
      order,
      raw: true,
    });
  },
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
