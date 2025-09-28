// models/CmpDormanSummaryViewModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const CmpDormanSummaryViewModel = sequelize.define(
  "CmpDormanSummaryViewModel",
  {
    summaryYear: {
      type: DataTypes.INTEGER,
      field: "summary_year",
      allowNull: false,
      primaryKey: true,
      comment: "Year of the summary",
    },
    maxDormantClientsMonth: {
      type: DataTypes.INTEGER,
      field: "max_dormant_clients_month",
      allowNull: true,
      comment: "Month with maximum dormant clients",
    },
    countDormantClientsMonth: {
      type: DataTypes.INTEGER,
      field: "count_dormant_clients_month",
      allowNull: true,
      comment: "Count of dormant clients in the max month",
    },
    countPlaceholderMonth: {
      type: DataTypes.INTEGER,
      field: "count_placeholder_month",
      allowNull: true,
      comment: "Count of placeholder records in the month",
    },
  },
  {
    tableName: "BACK_OFFICE.CMP_DORMAN_VIEW_SUMMARY",
    schema: process.env.DB_SCHEMA || undefined,
    timestamps: false,
    freezeTableName: true,
    comment: "View for summary statistics of dormant clients",
    // Since this is a view, we don't want Sequelize to try to create/modify it
    sync: { force: false },
  }
);

export default CmpDormanSummaryViewModel;
