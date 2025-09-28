// repositories/examples/RepositoryUsageExamples.js
/**
 * Examples of how to use the Repository Layer
 * This file demonstrates various usage patterns for each repository
 */

import {
  CmpDormanClientControlRepository,
  CmpDormanClientMonthlyDataRepository,
  CmpDormanSummaryRepository,
  CmpDormanSummaryViewRepository,
} from "../index.js";

// ========================================
// Client Control Repository Examples
// ========================================

/**
 * Client Control Repository Usage Examples
 */
export const clientControlExamples = {
  // Find all records
  async getAllRecords() {
    return await CmpDormanClientControlRepository.findAll();
  },

  // Find by year
  async getRecordsByYear(year = 2025) {
    return await CmpDormanClientControlRepository.findByYear(year);
  },

  // Find by year and month
  async getRecordByYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanClientControlRepository.findByYearAndMonth(
      year,
      month
    );
  },

  // Dynamic search examples
  async dynamicSearchExamples() {
    // Search by processing year greater than or equal to 2020
    const result1 = await CmpDormanClientControlRepository.dynamicSearch({
      processingYear: { operator: "gte", value: 2020 },
    });

    // Search by multiple conditions
    const result2 = await CmpDormanClientControlRepository.dynamicSearch({
      processingYear: 2025,
      lastProcessedMonth: { operator: "lte", value: 9 },
    });

    return { result1, result2 };
  },

  // Create new record
  async createRecord() {
    return await CmpDormanClientControlRepository.create({
      processingYear: 2025,
      lastProcessedMonth: 9,
    });
  },
};

// ========================================
// Client Monthly Data Repository Examples
// ========================================

/**
 * Client Monthly Data Repository Usage Examples
 */
export const clientMonthlyDataExamples = {
  // Find all records with filters
  async getAllWithFilters() {
    return await CmpDormanClientMonthlyDataRepository.findAll({
      analysisMonth: 9,
      inactivityToYear: 2025,
    });
  },

  // Find by inactivity to year (specific requirement)
  async getByInactivityToYear(year = 2025) {
    return await CmpDormanClientMonthlyDataRepository.findByInactivityToYear(
      year
    );
  },

  // Find by inactivity to year and month (specific requirement)
  async getByInactivityToYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanClientMonthlyDataRepository.findByInactivityToYearAndMonth(
      year,
      month
    );
  },

  // Find by year (using analysis period)
  async getRecordsByYear(year = 2025) {
    return await CmpDormanClientMonthlyDataRepository.findByYear(year);
  },

  // Find by year and month
  async getRecordsByYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanClientMonthlyDataRepository.findByYearAndMonth(
      year,
      month
    );
  },

  // Dynamic search examples
  async dynamicSearchExamples() {
    // Search by client name (like operator)
    const result1 = await CmpDormanClientMonthlyDataRepository.dynamicSearch({
      clientNameEn: { operator: "like", value: "Ahmed" },
    });

    // Search by analysis period range
    const result2 = await CmpDormanClientMonthlyDataRepository.dynamicSearch({
      analysisPeriodFrom: { operator: "gte", value: new Date("2025-01-01") },
      analysisPeriodTo: { operator: "lte", value: new Date("2025-12-31") },
    });

    // Search by multiple inactivity years
    const result3 = await CmpDormanClientMonthlyDataRepository.dynamicSearch({
      inactivityToYear: { operator: "in", value: [2024, 2025] },
    });

    return { result1, result2, result3 };
  },
};

// ========================================
// Summary Repository Examples
// ========================================

/**
 * Summary Repository Usage Examples
 */
export const summaryExamples = {
  // Find all records
  async getAllRecords() {
    return await CmpDormanSummaryRepository.findAll();
  },

  // Find by year
  async getRecordsByYear(year = 2025) {
    return await CmpDormanSummaryRepository.findByYear(year);
  },

  // Find by year and month
  async getRecordsByYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanSummaryRepository.findByYearAndMonth(year, month);
  },

  // Find latest record for year and month
  async getLatestRecord(year = 2025, month = 9) {
    return await CmpDormanSummaryRepository.findLatestByYearAndMonth(
      year,
      month
    );
  },

  // Get summary statistics
  async getStatistics() {
    return await CmpDormanSummaryRepository.getSummaryStatistics();
  },

  // Dynamic search examples
  async dynamicSearchExamples() {
    // Search by data quality score range
    const result1 = await CmpDormanSummaryRepository.dynamicSearch({
      dataQualityScore: { operator: "between", value: [80, 100] },
    });

    // Search by processing date
    const result2 = await CmpDormanSummaryRepository.dynamicSearch({
      processingDate: { operator: "gte", value: new Date("2025-01-01") },
    });

    // Search records with notes
    const result3 = await CmpDormanSummaryRepository.dynamicSearch({
      notes: { operator: "isNotNull" },
    });

    return { result1, result2, result3 };
  },
};

// ========================================
// Summary View Repository Examples
// ========================================

/**
 * Summary View Repository Usage Examples
 */
export const summaryViewExamples = {
  // Find all view records
  async getAllViewRecords() {
    return await CmpDormanSummaryViewRepository.findAll();
  },

  // Find by year
  async getViewRecordByYear(year = 2025) {
    return await CmpDormanSummaryViewRepository.findByYear(year);
  },

  // Find by year and max dormant clients month
  async getViewRecordByYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanSummaryViewRepository.findByYearAndMonth(year, month);
  },

  // Find top years by dormant clients
  async getTopYearsByDormantClients(limit = 5) {
    return await CmpDormanSummaryViewRepository.findTopYearsByDormantClients(
      limit
    );
  },

  // Get view statistics
  async getViewStatistics() {
    return await CmpDormanSummaryViewRepository.getViewStatistics();
  },

  // Dynamic search examples
  async dynamicSearchExamples() {
    // Search by dormant clients count range
    const result1 = await CmpDormanSummaryViewRepository.dynamicSearch({
      countDormantClientsMonth: { operator: "between", value: [100, 1000] },
    });

    // Search by year range
    const result2 = await CmpDormanSummaryViewRepository.dynamicSearch({
      summaryYear: { operator: "between", value: [2020, 2025] },
    });

    return { result1, result2 };
  },
};

// ========================================
// Complete Usage Example
// ========================================

/**
 * Complete example showing how to use all repositories together
 */
export const completeExample = async () => {
  try {
    console.log("🚀 Repository Layer Usage Examples");

    // 1. Get control records for current year
    const controlRecords =
      await CmpDormanClientControlRepository.findByYear(2025);
    console.log("📋 Control Records:", controlRecords?.length || 0);

    // 2. Get monthly data for clients with inactivity ending in 2025
    const inactiveClients =
      await CmpDormanClientMonthlyDataRepository.findByInactivityToYear(2025);
    console.log("👥 Inactive Clients:", inactiveClients?.length || 0);

    // 3. Get summary data for September 2025
    const septemberSummary =
      await CmpDormanSummaryRepository.findByYearAndMonth(2025, 9);
    console.log("📊 September Summary Records:", septemberSummary?.length || 0);

    // 4. Get view data for 2025
    const viewData = await CmpDormanSummaryViewRepository.findByYear(2025);
    console.log("👁️ View Data for 2025:", viewData ? "Found" : "Not Found");

    // 5. Perform dynamic search across repositories
    const dynamicResults = await Promise.all([
      CmpDormanClientControlRepository.dynamicSearch({
        processingYear: { operator: "gte", value: 2024 },
      }),
      CmpDormanSummaryRepository.dynamicSearch({
        dataQualityScore: { operator: "gte", value: 90 },
      }),
    ]);

    console.log("🔍 Dynamic Search Results:", {
      controlRecords: dynamicResults[0]?.length || 0,
      highQualitySummaries: dynamicResults[1]?.length || 0,
    });

    return {
      success: true,
      summary: {
        controlRecords: controlRecords?.length || 0,
        inactiveClients: inactiveClients?.length || 0,
        septemberSummaries: septemberSummary?.length || 0,
        viewDataFound: !!viewData,
      },
    };
  } catch (error) {
    console.error("❌ Error in complete example:", error);
    return { success: false, error: error.message };
  }
};
