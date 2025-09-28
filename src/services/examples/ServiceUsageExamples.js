// services/examples/ServiceUsageExamples.js
/**
 * ⚠️  UPDATED EXAMPLES - Using Current CmpDorman* Services
 *
 * This file contains examples for the current CmpDorman* services with consistent naming:
 * CmpDormanClientMonthlyDataService, CmpDormanClientControlService,
 * CmpDormanSummaryService, and CmpDormanSummaryViewService.
 *
 * The services have the following method signatures:
 * - CmpDormanClientMonthlyDataService: list(), listGte2025(), getById(), searchAll(), listByYear(), listByYearAndMonth(), listByInactivityYear(), listByInactivityYearAndMonth()
 * - CmpDormanClientControlService: list()
 * - CmpDormanSummaryService: list(), latestByYear()
 * - CmpDormanSummaryViewService: list()
 *
 * TODO: Update this file with examples for the service methods
 */

import {
  CmpDormanClientControlService,
  CmpDormanClientMonthlyDataService,
  CmpDormanSummaryService,
  CmpDormanSummaryViewService,
} from "../index.js";

// ========================================
// NEW SERVICE EXAMPLES (TODO: Expand these)
// ========================================

export const newServiceExamples = {
  // CmpDormanClientMonthlyDataService examples
  async getAllMonthlyData() {
    return await CmpDormanClientMonthlyDataService.list();
  },

  async getMonthlyDataByYear(year) {
    return await CmpDormanClientMonthlyDataService.listByYear(year);
  },

  async getMonthlyDataInactive2025Plus() {
    return await CmpDormanClientMonthlyDataService.listGte2025();
  },

  async searchMonthlyData(term) {
    return await CmpDormanClientMonthlyDataService.searchAll(term);
  },

  // CmpDormanClientControlService examples
  async getAllControlData() {
    return await CmpDormanClientControlService.list();
  },

  // CmpDormanSummaryService examples
  async getAllSummary() {
    return await CmpDormanSummaryService.list();
  },

  async getLatestSummaryForYear(year) {
    return await CmpDormanSummaryService.latestByYear(year);
  },

  // CmpDormanSummaryViewService examples
  async getAllSummaryView() {
    return await CmpDormanSummaryViewService.list();
  },
};

// ========================================
// OLD/OUTDATED EXAMPLES BELOW - DO NOT USE
// ========================================
export const clientControlServiceExamples = {
  // Get all records
  async getAllRecords() {
    return await CmpDormanClientControlService.getAllClientControlRecords();
  },

  // Get records by year - MAIN REQUIREMENT
  async getRecordsByYear(year = 2025) {
    return await CmpDormanClientControlService.getClientControlRecordsByYear(
      year
    );
  },

  // Get record by year and month - MAIN REQUIREMENT
  async getRecordByYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanClientControlService.getClientControlRecordByYearAndMonth(
      year,
      month
    );
  },

  // Get current processing status
  async getCurrentProcessingStatus() {
    return await CmpDormanClientControlService.getCurrentProcessingStatus();
  },

  // Search with dynamic queries
  async searchRecords() {
    return await CmpDormanClientControlService.searchClientControlRecords({
      processingYear: { operator: "gte", value: 2020 },
      lastProcessedMonth: { operator: "lte", value: 9 },
    });
  },

  // Create new record
  async createRecord() {
    return await CmpDormanClientControlService.createClientControlRecord({
      processingYear: 2025,
      lastProcessedMonth: 9,
    });
  },
};

// ========================================
// Client Monthly Data Service Examples
// ========================================

/**
 * Client Monthly Data Service Usage Examples
 */
export const clientMonthlyDataServiceExamples = {
  // Get all monthly data
  async getAllMonthlyData() {
    return await CmpDormanClientMonthlyDataService.getAllMonthlyData({
      analysisMonth: 9,
    });
  },

  // Get monthly data by year - MAIN REQUIREMENT
  async getMonthlyDataByYear(year = 2025) {
    return await CmpDormanClientMonthlyDataService.getMonthlyDataByYear(year);
  },

  // Get monthly data by year and month - MAIN REQUIREMENT
  async getMonthlyDataByYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanClientMonthlyDataService.getMonthlyDataByYearAndMonth(
      year,
      month
    );
  },

  // Get monthly data by inactivity to year - SPECIFIC REQUIREMENT
  async getMonthlyDataByInactivityToYear(year = 2025) {
    return await CmpDormanClientMonthlyDataService.getMonthlyDataByInactivityToYear(
      year
    );
  },

  // Get monthly data by inactivity to year and month - SPECIFIC REQUIREMENT
  async getMonthlyDataByInactivityToYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanClientMonthlyDataService.getMonthlyDataByInactivityToYearAndMonth(
      year,
      month
    );
  },

  // Get monthly data by profile ID
  async getMonthlyDataByProfileId(profileId = "PROFILE_123") {
    return await CmpDormanClientMonthlyDataService.getMonthlyDataByProfileId(
      profileId
    );
  },

  // Get monthly data by unified code
  async getMonthlyDataByUnifiedCode(unifiedCode = "UC123456") {
    return await CmpDormanClientMonthlyDataService.getMonthlyDataByUnifiedCode(
      unifiedCode
    );
  },

  // Search monthly data
  async searchMonthlyData() {
    return await CmpDormanClientMonthlyDataService.searchMonthlyData({
      clientNameEn: { operator: "like", value: "Ahmed" },
      inactivityToYear: 2025,
    });
  },
};

// ========================================
// Summary Service Examples
// ========================================

/**
 * Summary Service Usage Examples
 */
export const summaryServiceExamples = {
  // Get all summary records
  async getAllSummaryRecords() {
    return await CmpDormanSummaryService.getAllSummaryRecords();
  },

  // Get summary records by year - MAIN REQUIREMENT
  async getSummaryRecordsByYear(year = 2025) {
    return await CmpDormanSummaryService.getSummaryRecordsByYear(year);
  },

  // Get summary records by year and month - MAIN REQUIREMENT
  async getSummaryRecordsByYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanSummaryService.getSummaryRecordsByYearAndMonth(
      year,
      month
    );
  },

  // Get latest summary record
  async getLatestSummary(year = 2025, month = 9) {
    return await CmpDormanSummaryService.getLatestSummaryByYearAndMonth(
      year,
      month
    );
  },

  // Get summary records by date range
  async getSummaryByDateRange() {
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-12-31");
    return await CmpDormanSummaryService.getSummaryRecordsByDateRange(
      startDate,
      endDate
    );
  },

  // Get high quality summary records
  async getHighQualitySummaries(minScore = 85) {
    return await CmpDormanSummaryService.getHighQualitySummaryRecords(minScore);
  },

  // Get summary statistics
  async getSummaryStatistics() {
    return await CmpDormanSummaryService.getSummaryStatistics();
  },

  // Search summary records
  async searchSummaryRecords() {
    return await CmpDormanSummaryService.searchSummaryRecords({
      summaryYear: 2025,
      dataQualityScore: { operator: "gte", value: 80 },
      totalDormantClients: { operator: "gt", value: 100 },
    });
  },

  // Create new summary record
  async createSummaryRecord() {
    return await CmpDormanSummaryService.createSummaryRecord({
      summaryYear: 2025,
      summaryMonth: 9,
      totalDormantClients: 150,
      placeholderRecords: 10,
      dataQualityScore: 85.5,
      notes: "September 2025 summary - good data quality",
    });
  },
};

// ========================================
// Summary View Service Examples
// ========================================

/**
 * Summary View Service Usage Examples
 */
export const summaryViewServiceExamples = {
  // Get all summary view records
  async getAllSummaryViewRecords() {
    return await CmpDormanSummaryViewService.getAllSummaryViewRecords();
  },

  // Get summary view record by year - MAIN REQUIREMENT
  async getSummaryViewRecordByYear(year = 2025) {
    return await CmpDormanSummaryViewService.getSummaryViewRecordByYear(year);
  },

  // Get summary view record by year and month - MAIN REQUIREMENT
  async getSummaryViewRecordByYearAndMonth(year = 2025, month = 9) {
    return await CmpDormanSummaryViewService.getSummaryViewRecordByYearAndMonth(
      year,
      month
    );
  },

  // Get summary view records by year range
  async getSummaryViewRecordsByYearRange(startYear = 2020, endYear = 2025) {
    return await CmpDormanSummaryViewService.getSummaryViewRecordsByYearRange(
      startYear,
      endYear
    );
  },

  // Get top years by dormant clients
  async getTopYearsByDormantClients(limit = 5) {
    return await CmpDormanSummaryViewService.getTopYearsByDormantClients(limit);
  },

  // Get records by max dormant clients month
  async getRecordsByMaxDormantClientsMonth(month = 9) {
    return await CmpDormanSummaryViewService.getSummaryViewRecordsByMaxDormantClientsMonth(
      month
    );
  },

  // Get view statistics
  async getViewStatistics() {
    return await CmpDormanSummaryViewService.getViewStatistics();
  },

  // Search summary view records
  async searchSummaryViewRecords() {
    return await CmpDormanSummaryViewService.searchSummaryViewRecords({
      summaryYear: { operator: "between", value: [2020, 2025] },
      countDormantClientsMonth: { operator: "gte", value: 100 },
    });
  },
};

// ========================================
// Complete Service Usage Example
// ========================================

/**
 * Complete example showing how to use all services together
 */
export const completeServiceExample = async () => {
  try {
    console.log("🚀 Service Layer Usage Examples");

    // 1. Check current processing status
    const processingStatus =
      await CmpDormanClientControlService.getCurrentProcessingStatus();
    console.log(
      "📋 Current Processing Status:",
      processingStatus.success ? "Available" : "No data"
    );

    // 2. Get monthly data for current year
    const monthlyDataByYear =
      await CmpDormanClientMonthlyDataService.getMonthlyDataByYear(2025);
    console.log("📊 Monthly Data Records:", monthlyDataByYear.count || 0);

    // 3. Get summary records for September 2025
    const septemberSummary =
      await CmpDormanSummaryService.getSummaryRecordsByYearAndMonth(2025, 9);
    console.log("📈 September Summary Records:", septemberSummary.count || 0);

    // 4. Get view data for 2025
    const viewData2025 =
      await CmpDormanSummaryViewService.getSummaryViewRecordByYear(2025);
    console.log(
      "👁️ View Data for 2025:",
      viewData2025.found ? "Found" : "Not Found"
    );

    // 5. Get clients with inactivity ending in 2025
    const inactiveClients2025 =
      await CmpDormanClientMonthlyDataService.getMonthlyDataByInactivityToYear(
        2025
      );
    console.log(
      "🔍 Clients with inactivity ending in 2025:",
      inactiveClients2025.count || 0
    );

    // 6. Get top years by dormant clients
    const topYears =
      await CmpDormanSummaryViewService.getTopYearsByDormantClients(3);
    console.log("🏆 Top 3 Years by Dormant Clients:", topYears.count || 0);

    // 7. Get comprehensive statistics
    const summaryStats = await CmpDormanSummaryService.getSummaryStatistics();
    const viewStats = await CmpDormanSummaryViewService.getViewStatistics();

    console.log("📊 Service Statistics:", {
      summaryRecordsTotal: summaryStats.data?.totalRecords || 0,
      viewRecordsTotal: viewStats.data?.totalRecords || 0,
      averageDataQuality: summaryStats.data?.averageDataQualityScore || 0,
    });

    return {
      success: true,
      summary: {
        processingStatusAvailable: processingStatus.success,
        monthlyDataRecords: monthlyDataByYear.count || 0,
        septemberSummaries: septemberSummary.count || 0,
        viewData2025Found: viewData2025.found,
        inactiveClients2025: inactiveClients2025.count || 0,
        topYearsFound: topYears.count || 0,
      },
    };
  } catch (error) {
    console.error("❌ Error in complete service example:", error);
    return { success: false, error: error.message };
  }
};

// ========================================
// Service Error Handling Examples
// ========================================

/**
 * Examples of how services handle errors and validation
 */
export const serviceErrorHandlingExamples = {
  // Invalid year example
  async invalidYearExample() {
    try {
      // This should throw a validation error
      await CmpDormanClientControlService.getClientControlRecordsByYear(1800);
    } catch (error) {
      console.log("✅ Validation Error Caught:", error.message);
      return { error: error.message, handled: true };
    }
  },

  // Invalid month example
  async invalidMonthExample() {
    try {
      // This should throw a validation error
      await CmpDormanSummaryService.getSummaryRecordsByYearAndMonth(2025, 13);
    } catch (error) {
      console.log("✅ Validation Error Caught:", error.message);
      return { error: error.message, handled: true };
    }
  },

  // Invalid profile ID example
  async invalidProfileIdExample() {
    try {
      // This should throw a validation error
      await CmpDormanClientMonthlyDataService.getMonthlyDataByProfileId(null);
    } catch (error) {
      console.log("✅ Validation Error Caught:", error.message);
      return { error: error.message, handled: true };
    }
  },
};

// ========================================
// Service Performance Monitoring Example
// ========================================

/**
 * Example of monitoring service performance
 */
export const servicePerformanceExample = async () => {
  const performanceResults = [];

  const services = [
    {
      name: "ClientControl.getAllRecords",
      fn: () => CmpDormanClientControlService.getAllClientControlRecords(),
    },
    {
      name: "MonthlyData.getByYear",
      fn: () => CmpDormanClientMonthlyDataService.getMonthlyDataByYear(2025),
    },
    {
      name: "Summary.getByYearAndMonth",
      fn: () =>
        CmpDormanSummaryService.getSummaryRecordsByYearAndMonth(2025, 9),
    },
    {
      name: "SummaryView.getByYear",
      fn: () => CmpDormanSummaryViewService.getSummaryViewRecordByYear(2025),
    },
  ];

  for (const service of services) {
    const startTime = Date.now();
    try {
      const result = await service.fn();
      const endTime = Date.now();
      const duration = endTime - startTime;

      performanceResults.push({
        service: service.name,
        duration: duration,
        success: result.success,
        recordCount: result.count || (result.found ? 1 : 0),
        performance:
          duration < 100
            ? "excellent"
            : duration < 500
              ? "good"
              : "needs_optimization",
      });

      console.log(
        `⚡ ${service.name}: ${duration}ms - ${result.count || (result.found ? 1 : 0)} records`
      );
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      performanceResults.push({
        service: service.name,
        duration: duration,
        success: false,
        error: error.message,
        performance: "error",
      });

      console.log(
        `❌ ${service.name}: ${duration}ms - Error: ${error.message}`
      );
    }
  }

  return {
    results: performanceResults,
    summary: {
      totalServices: services.length,
      successfulServices: performanceResults.filter((r) => r.success).length,
      averageDuration: Math.round(
        performanceResults.reduce((sum, r) => sum + r.duration, 0) /
          performanceResults.length
      ),
      fastestService: performanceResults.reduce((fastest, current) =>
        current.duration < fastest.duration ? current : fastest
      ),
      slowestService: performanceResults.reduce((slowest, current) =>
        current.duration > slowest.duration ? current : slowest
      ),
    },
  };
};
