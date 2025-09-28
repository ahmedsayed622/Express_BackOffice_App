// models/CmpDormanClientControlModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const CmpDormanClientControlModel = sequelize.define(
  "CmpDormanClientControlModel",
  {
    processingYear: {
      type: DataTypes.INTEGER,
      field: "processing_year",
      allowNull: false,
      primaryKey: true,
      comment: "The year being processed",
    },
    lastProcessedMonth: {
      type: DataTypes.INTEGER,
      field: "last_processed_month",
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
      comment: "The last month that was processed (1-12)",
    },
  },
  {
    tableName: "BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL",
    schema: process.env.DB_SCHEMA || undefined,
    timestamps: false,
    freezeTableName: true,
    comment: "Control table for tracking processing progress",
  }
);

export default CmpDormanClientControlModel;
