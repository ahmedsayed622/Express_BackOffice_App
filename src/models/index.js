// models/index.js
import { sequelize } from "../config/db.config.js";
import CmpDormanClientControlModel from "./CmpDormanClientControlModel.js";
import CmpDormanClientMonthlyDataModel from "./CmpDormanClientMonthlyDataModel.js";
import CmpDormanSummaryModel from "./CmpDormanSummaryModel.js";
import CmpDormanSummaryViewModel from "./CmpDormanSummaryViewModel.js";
import CmpEmpDailyOrdersModel from "./CmpEmpDailyOrdersModel.js";

// Define associations if needed
// For example, if there are foreign key relationships:
// CmpDormanClientMonthlyDataModel.belongsTo(CmpDormanClientControlModel, { foreignKey: 'processingYear' });
// CmpDormanSummaryModel.belongsTo(CmpDormanClientControlModel, { foreignKey: 'summaryYear' });

// Export all models
export {
  sequelize,
  CmpDormanClientControlModel,
  CmpDormanClientMonthlyDataModel,
  CmpDormanSummaryModel,
  CmpDormanSummaryViewModel,
  CmpEmpDailyOrdersModel,
};

// Export default object with all models
export default {
  sequelize,
  CmpDormanClientControlModel,
  CmpDormanClientMonthlyDataModel,
  CmpDormanSummaryModel,
  CmpDormanSummaryViewModel,
};
