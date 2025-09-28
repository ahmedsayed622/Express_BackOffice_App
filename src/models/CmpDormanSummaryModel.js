// models/CmpDormanSummaryModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const CmpDormanSummaryModel = sequelize.define(
  "CmpDormanSummaryModel",
  {
    historyId: {
      type: DataTypes.INTEGER,
      field: "history_id",
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      comment: "Auto-incrementing identity column",
    },
    summaryYear: {
      type: DataTypes.INTEGER,
      field: "summary_year",
      allowNull: false,
      comment: "Year of the summary",
    },
    summaryMonth: {
      type: DataTypes.INTEGER,
      field: "summary_month",
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
      comment: "Month of the summary (1-12)",
    },
    totalDormantClients: {
      type: DataTypes.INTEGER,
      field: "total_dormant_clients",
      allowNull: true,
      defaultValue: 0,
      comment: "Total number of dormant clients",
    },
    placeholderRecords: {
      type: DataTypes.INTEGER,
      field: "placeholder_records",
      allowNull: true,
      defaultValue: 0,
      comment: "Number of placeholder records",
    },
    processingDate: {
      type: DataTypes.INTEGER,
      field: "processing_date",
      allowNull: true,
      comment: "Date when the record was processed in YYYYMMDD format",
    },
    dataQualityScore: {
      type: DataTypes.DECIMAL(5, 2),
      field: "data_quality_score",
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
      comment: "Data quality score (0-100)",
    },
    notes: {
      type: DataTypes.TEXT,
      field: "notes",
      allowNull: true,
      comment: "Additional notes or comments",
    },
  },
  {
    tableName: "BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY",
    schema: process.env.DB_SCHEMA || undefined,
    timestamps: false,
    freezeTableName: true,
    comment: "Summary table for dormant clients analysis",
    indexes: [
      {
        name: "idx_summary_year_month",
        fields: ["summary_year", "summary_month"],
      },
      {
        name: "idx_processing_date",
        fields: ["processing_date"],
      },
    ],
  }
);

export default CmpDormanSummaryModel;
