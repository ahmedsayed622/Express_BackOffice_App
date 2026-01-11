// models/CmpDormanSummaryViewModel.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../config/index.js";

const sequelize = getSequelize();
const CmpDormanSummaryViewModel = sequelize.define(
"CmpDormanSummaryViewModel",
{
summaryYear: {
type: DataTypes.INTEGER,
field: "SUMMARY_YEAR",
allowNull: false,
primaryKey: true,
},
maxDormantClientsMonth: {
type: DataTypes.INTEGER,
field: "MAX_DORMANT_CLIENTS_MONTH",
allowNull: true,
},
countDormantClientsMonth: {
type: DataTypes.INTEGER,
field: "COUNT_DORMANT_CLIENTS_MONTH",
allowNull: true,
},
countPlaceholderMonth: {
type: DataTypes.INTEGER,
field: "COUNT_PLACEHOLDER_MONTH",
allowNull: true,
},
},
{
tableName: "CMP_DORMAN_VIEW_SUMMARY",
schema: "EDATA_PL",

timestamps: false,
freezeTableName: true,
}
);


export default CmpDormanSummaryViewModel;
export { CmpDormanSummaryViewModel };
