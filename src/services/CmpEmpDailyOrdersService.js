// services/CmpEmpDailyOrdersService.js
import { CmpEmpDailyOrdersRepository } from "../repositories/index.js";
import { ErrorFactory } from "../utils/index.js";
import { Op } from "sequelize";

const CmpEmpDailyOrdersService = {
  /**
   * List orders with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} Array of orders
   */
  async list(filters = {}) {
    const where = {};

    // Apply filters
    if (filters.execId) {
      where.execId = filters.execId;
    }

    if (filters.invoiceNo) {
      where.invoiceNo = filters.invoiceNo;
    }

    if (filters.profileId) {
      where.profileId = filters.profileId;
    }

    if (filters.stockId) {
      where.stockId = filters.stockId;
    }

    // Date range filtering
    if (filters.from && filters.to) {
      if (filters.from > filters.to) {
        throw ErrorFactory.badRequest(
          "From date must be before or equal to To date"
        );
      }
      where.invoiceDate = {
        [Op.between]: [filters.from, filters.to],
      };
    } else if (filters.from) {
      where.invoiceDate = {
        [Op.gte]: filters.from,
      };
    } else if (filters.to) {
      where.invoiceDate = {
        [Op.lte]: filters.to,
      };
    }

    return await CmpEmpDailyOrdersRepository.findAll(where);
  },

  /**
   * Find orders by invoice number
   * @param {number} invoiceNo - Invoice number
   * @returns {Promise<Array>} Array of matching orders
   */
  async byInvoiceNo(invoiceNo) {
    if (!invoiceNo || invoiceNo <= 0) {
      throw ErrorFactory.badRequest(
        "Invoice number must be a positive integer"
      );
    }

    return await CmpEmpDailyOrdersRepository.findByInvoiceNo(invoiceNo);
  },

  /**
   * Find orders by execution ID
   * @param {string} execId - Execution ID
   * @returns {Promise<Array>} Array of matching orders
   */
  async byExecId(execId) {
    if (!execId || typeof execId !== "string" || execId.trim().length === 0) {
      throw ErrorFactory.badRequest("Execution ID must be a non-empty string");
    }

    return await CmpEmpDailyOrdersRepository.findByExecId(execId.trim());
  },

  /**
   * Find orders by exact invoice date
   * @param {number} yyyymmdd - Date in YYYYMMDD format
   * @returns {Promise<Array>} Array of matching orders
   */
  async byInvoiceDateExact(yyyymmdd) {
    // Additional validation for date format
    const dateStr = String(yyyymmdd);
    if (!/^\d{8}$/.test(dateStr)) {
      throw ErrorFactory.badRequest(
        "Date must be in YYYYMMDD format (8 digits)"
      );
    }

    const year = parseInt(dateStr.substr(0, 4));
    const month = parseInt(dateStr.substr(4, 2));
    const day = parseInt(dateStr.substr(6, 2));

    if (
      year < 1900 ||
      year > 2100 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      throw ErrorFactory.badRequest("Invalid date in YYYYMMDD format");
    }

    return await CmpEmpDailyOrdersRepository.findByInvoiceDateExact(yyyymmdd);
  },

  /**
   * Find orders from a specific date onwards
   * @param {number} yyyymmddMin - Minimum date (default: 20250101)
   * @returns {Promise<Array>} Array of matching orders
   */
  async byInvoiceDateFrom(yyyymmddMin = 20250101) {
    // Validate date format
    const dateStr = String(yyyymmddMin);
    if (!/^\d{8}$/.test(dateStr)) {
      throw ErrorFactory.badRequest(
        "From date must be in YYYYMMDD format (8 digits)"
      );
    }

    const year = parseInt(dateStr.substr(0, 4));
    const month = parseInt(dateStr.substr(4, 2));
    const day = parseInt(dateStr.substr(6, 2));

    if (
      year < 1900 ||
      year > 2100 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      throw ErrorFactory.badRequest("Invalid from date in YYYYMMDD format");
    }

    return await CmpEmpDailyOrdersRepository.findByInvoiceDateFrom(yyyymmddMin);
  },

  /**
   * Find orders within a date range
   * @param {number} from - Start date in YYYYMMDD format
   * @param {number} to - End date in YYYYMMDD format
   * @returns {Promise<Array>} Array of matching orders
   */
  async byInvoiceDateRange(from, to) {
    if (!from || !to) {
      throw ErrorFactory.badRequest(
        "Both from and to dates are required for range query"
      );
    }

    if (from > to) {
      throw ErrorFactory.badRequest(
        "From date must be before or equal to To date"
      );
    }

    // Validate both dates
    const fromStr = String(from);
    const toStr = String(to);

    if (!/^\d{8}$/.test(fromStr) || !/^\d{8}$/.test(toStr)) {
      throw ErrorFactory.badRequest(
        "Both dates must be in YYYYMMDD format (8 digits)"
      );
    }

    // Validate from date
    const fromYear = parseInt(fromStr.substr(0, 4));
    const fromMonth = parseInt(fromStr.substr(4, 2));
    const fromDay = parseInt(fromStr.substr(6, 2));

    if (
      fromYear < 1900 ||
      fromYear > 2100 ||
      fromMonth < 1 ||
      fromMonth > 12 ||
      fromDay < 1 ||
      fromDay > 31
    ) {
      throw ErrorFactory.badRequest("Invalid from date in YYYYMMDD format");
    }

    // Validate to date
    const toYear = parseInt(toStr.substr(0, 4));
    const toMonth = parseInt(toStr.substr(4, 2));
    const toDay = parseInt(toStr.substr(6, 2));

    if (
      toYear < 1900 ||
      toYear > 2100 ||
      toMonth < 1 ||
      toMonth > 12 ||
      toDay < 1 ||
      toDay > 31
    ) {
      throw ErrorFactory.badRequest("Invalid to date in YYYYMMDD format");
    }

    return await CmpEmpDailyOrdersRepository.findByInvoiceDateRange(from, to);
  },

  /**
   * Search orders across multiple fields
   * @param {string} term - Search term
   * @returns {Promise<Array>} Array of matching orders
   */
  async search(term) {
    if (!term || typeof term !== "string" || term.trim().length === 0) {
      throw ErrorFactory.badRequest("Search term must be a non-empty string");
    }

    const cleanTerm = term.trim();
    if (cleanTerm.length > 200) {
      throw ErrorFactory.badRequest(
        "Search term must be 200 characters or less"
      );
    }

    return await CmpEmpDailyOrdersRepository.searchAll(cleanTerm);
  },
};

export default CmpEmpDailyOrdersService;
