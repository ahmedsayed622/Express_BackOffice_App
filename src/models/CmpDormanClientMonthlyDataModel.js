// models/CmpDormanClientMonthlyDataModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const CmpDormanClientMonthlyDataModel = sequelize.define(
  "CmpDormanClientMonthlyDataModel",
  {
    profileId: {
      type: DataTypes.STRING(50),
      field: "profile_id",
      allowNull: false,
      primaryKey: true,
      comment: "Unique identifier for the client profile",
    },
    clientNameEn: {
      type: DataTypes.STRING(200),
      field: "client_name_en",
      allowNull: true,
      comment: "Client name in English",
    },
    unifiedCode: {
      type: DataTypes.STRING(20),
      field: "unified_code",
      allowNull: true,
      comment: "Unified identification code",
    },
    analysisPeriodFrom: {
      type: DataTypes.INTEGER,
      field: "analysis_period_from",
      allowNull: true,
      comment: "Start date of the analysis period in YYYYMMDD format",
    },
    analysisPeriodTo: {
      type: DataTypes.INTEGER,
      field: "analysis_period_to",
      allowNull: true,
      comment: "End date of the analysis period in YYYYMMDD format",
    },
    analysisMonth: {
      type: DataTypes.INTEGER,
      field: "analysis_month",
      allowNull: true,
      validate: {
        min: 1,
        max: 12,
      },
      comment: "Month of analysis (1-12)",
    },
    inactivityFromYear: {
      type: DataTypes.INTEGER,
      field: "inactivity_from_year",
      allowNull: true,
      comment: "Year when inactivity started",
    },
    inactivityToYear: {
      type: DataTypes.INTEGER,
      field: "inactivity_to_year",
      allowNull: true,
      comment: "Year when inactivity ended",
    },
  },
  {
    tableName: "BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_MONTHLY_DATA",
    schema: process.env.DB_SCHEMA || undefined,
    timestamps: false,
    freezeTableName: true,
    comment: "Monthly data for dormant clients analysis",
  }
);

export default CmpDormanClientMonthlyDataModel;
