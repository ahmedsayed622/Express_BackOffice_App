// models/CmpDormanClientMonthlyDataModel.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../config/index.js";

const sequelize = getSequelize();
const CmpDormanClientMonthlyDataModel = sequelize.define(
"CmpDormanClientMonthlyDataModel",
{
profileId: {
type: DataTypes.STRING(50),
field: "PROFILE_ID",
allowNull: false,
primaryKey: true,
},
clientNameEn: {
type: DataTypes.STRING(200),
field: "CLIENT_NAME_EN",
allowNull: true,
},
unifiedCode: {
type: DataTypes.STRING(20),
field: "UNIFIED_CODE",
allowNull: true,
},
analysisPeriodFrom: {
type: DataTypes.INTEGER,
field: "ANALYSIS_PERIOD_FROM",
allowNull: true,
},
analysisPeriodTo: {
type: DataTypes.INTEGER,
field: "ANALYSIS_PERIOD_TO",
allowNull: true,
},
analysisMonth: {
type: DataTypes.INTEGER,
field: "ANALYSIS_MONTH",
allowNull: true,

},
inactivityFromYear: {
type: DataTypes.INTEGER,
field: "INACTIVITY_FROM_YEAR",
allowNull: true,
},
inactivityToYear: {
type: DataTypes.INTEGER,
field: "INACTIVITY_TO_YEAR",
allowNull: true,
},},
{
tableName: "CMP_DORMAN_TBL_CLIENT_MONTHLY_DATA",


timestamps: false,
freezeTableName: true,
}
);


export default CmpDormanClientMonthlyDataModel;
export { CmpDormanClientMonthlyDataModel };
