// models/CmpEmpDailyOrdersModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const CmpEmpDailyOrdersModel = sequelize.define(
  "CmpEmpDailyOrdersModel",
  {
    profileId: {
      type: DataTypes.BIGINT,
      field: "PROFILE_ID",
      allowNull: false,
      comment: "Employee profile identifier",
    },
    customerNameEn: {
      type: DataTypes.STRING(400),
      field: "CUSTOMER_NAME_EN",
      allowNull: true,
      comment: "Customer name in English",
    },
    invoiceDate: {
      type: DataTypes.INTEGER,
      field: "INVOICE_DATE",
      allowNull: false,
      comment: "Invoice date as YYYYMMDD integer format",
      validate: {
        isValidYYYYMMDD(value) {
          const str = String(value);
          if (!/^\d{8}$/.test(str)) {
            throw new Error(
              "Invoice date must be in YYYYMMDD format (8 digits)"
            );
          }
          const year = parseInt(str.substr(0, 4));
          const month = parseInt(str.substr(4, 2));
          const day = parseInt(str.substr(6, 2));
          if (
            year < 1900 ||
            year > 2100 ||
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > 31
          ) {
            throw new Error("Invalid date in YYYYMMDD format");
          }
        },
      },
    },
    invoiceNo: {
      type: DataTypes.BIGINT,
      field: "INVOICE_NO",
      allowNull: false,
      comment: "Invoice number",
    },
    execId: {
      type: DataTypes.STRING(18),
      field: "EXECID",
      allowNull: true,
      comment: "Execution identifier",
    },
    stockId: {
      type: DataTypes.BIGINT,
      field: "STOCK_ID",
      allowNull: true,
      comment: "Stock identifier",
    },
    qty: {
      type: DataTypes.INTEGER,
      field: "QUNTY",
      allowNull: true,
      comment: "Quantity (aliased from QUNTY for better naming)",
    },
    secondProfile: {
      type: DataTypes.BIGINT,
      field: '"2nd_Profile"',
      allowNull: true,
      comment: "Second profile identifier (quoted field name)",
    },
  },
  {
    tableName: "CMP_EMP_TBL_DAILY_ORDERS",
    schema: process.env.DB_SCHEMA || undefined,
    timestamps: false,
    freezeTableName: true,
    comment: "Employee daily executed orders tracking table",
    indexes: [
      {
        name: "idx_cmp_emp_daily_orders_date",
        fields: ["INVOICE_DATE"],
      },
      {
        name: "idx_cmp_emp_daily_orders_profile",
        fields: ["PROFILE_ID"],
      },
      {
        name: "idx_cmp_emp_daily_orders_invoice",
        fields: ["INVOICE_NO"],
      },
      {
        name: "idx_cmp_emp_daily_orders_exec",
        fields: ["EXECID"],
      },
    ],
  }
);

export default CmpEmpDailyOrdersModel;
