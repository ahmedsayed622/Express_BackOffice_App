// models/CmpDormanClientControlModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";


const CmpDormanClientControlModel = sequelize.define(
"CmpDormanClientControlModel",
{
processingYear: {
type: DataTypes.INTEGER,
field: "PROCESSING_YEAR",
allowNull: false,
primaryKey: true,
},
lastProcessedMonth: {
type: DataTypes.INTEGER,
field: "LAST_PROCESSED_MONTH",
allowNull: false,
validate: { min: 1, max: 12 },
},
},
{
tableName: "CMP_DORMAN_TBL_CLIENT_CONTROL",


timestamps: false,
freezeTableName: true,
}
);


export default CmpDormanClientControlModel;
export { CmpDormanClientControlModel };