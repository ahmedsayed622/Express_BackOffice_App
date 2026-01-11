// models/CmpEmpDailyOrdersModel.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../config/index.js";

const sequelize = getSequelize();
const CmpEmpDailyOrdersModel = sequelize.define(
"CmpEmpDailyOrdersModel",
{
profileId: {
type: DataTypes.BIGINT,
field: "PROFILE_ID",
allowNull: false,
},
customerNameEn: {
type: DataTypes.STRING(400),
field: "CUSTOMER_NAME_EN",
allowNull: true,
},
invoiceDate: {
type: DataTypes.INTEGER,
field: "INVOICE_DATE",
allowNull: false,
},
invoiceNo: {
type: DataTypes.BIGINT,
field: "INVOICE_NO",
allowNull: false,
},
execId: {
type: DataTypes.STRING(18),
field: "EXECID",
allowNull: true,
},
stockId: {
type: DataTypes.BIGINT,
field: "STOCK_ID",
allowNull: true,
},
qty: {
type: DataTypes.INTEGER,
field: "QUNTY",
allowNull: true,
},
secondProfile: {
type: DataTypes.BIGINT,
field: "SECOND_PROFILE",
allowNull: true,
},
},
{
tableName: "CMP_EMP_TBL_DAILY_ORDERS",


timestamps: false,
freezeTableName: true,
}
);


export default CmpEmpDailyOrdersModel;
export { CmpEmpDailyOrdersModel };
