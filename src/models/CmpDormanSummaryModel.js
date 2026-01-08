// models/CmpDormanSummaryModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";


const CmpDormanSummaryModel = sequelize.define(
"CmpDormanSummaryModel",
{
historyId: {
type: DataTypes.INTEGER,
field: "HISTORY_ID",
allowNull: false,
primaryKey: true,
autoIncrement: true,
},
summaryYear: {
type: DataTypes.INTEGER,
field: "SUMMARY_YEAR",
allowNull: false,
},
summaryMonth: {
type: DataTypes.INTEGER,
field: "SUMMARY_MONTH",
allowNull: false,
validate: { min: 1, max: 12 },
},
totalDormantClients: {
type: DataTypes.INTEGER,
field: "TOTAL_DORMANT_CLIENTS",
allowNull: true,
defaultValue: 0,
},
placeholderRecords: {
type: DataTypes.INTEGER,
field: "PLACEHOLDER_RECORDS",
allowNull: true,
defaultValue: 0,
},
processingDate: {
type: DataTypes.INTEGER,
field: "PROCESSING_DATE",
allowNull: true,
},
dataQualityScore: {
type: DataTypes.INTEGER,
field: "DATA_QUALITY_SCORE",
allowNull: true,
},
notes: {
type: DataTypes.STRING(4000),
field: "NOTES",
allowNull: true,
},
},
{
tableName: "CMP_DORMAN_TBL_SUMMARY",


timestamps: false,
freezeTableName: true,
}
);


export default CmpDormanSummaryModel;
export { CmpDormanSummaryModel };