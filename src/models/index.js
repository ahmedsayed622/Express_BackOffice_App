import { sequelize } from "../config/db.config.js";
import CmpDormanClientControlModel, { CmpDormanClientControlModel as CmpDormanClientControlNamed } from "./CmpDormanClientControlModel.js";
import CmpDormanClientMonthlyDataModel, { CmpDormanClientMonthlyDataModel as CmpDormanClientMonthlyDataNamed } from "./CmpDormanClientMonthlyDataModel.js";
import CmpDormanSummaryModel, { CmpDormanSummaryModel as CmpDormanSummaryNamed } from "./CmpDormanSummaryModel.js";
import CmpDormanSummaryViewModel, { CmpDormanSummaryViewModel as CmpDormanSummaryViewNamed } from "./CmpDormanSummaryViewModel.js";
import CmpEmpDailyOrdersModel, { CmpEmpDailyOrdersModel as CmpEmpDailyOrdersNamed } from "./CmpEmpDailyOrdersModel.js";


export const db = {
CmpDormanClientControlModel,
CmpDormanClientControlNamed,
CmpDormanClientMonthlyDataModel,
CmpDormanClientMonthlyDataNamed,
CmpDormanSummaryModel,
CmpDormanSummaryNamed,
CmpDormanSummaryViewModel,
CmpDormanSummaryViewNamed,
CmpEmpDailyOrdersModel,
CmpEmpDailyOrdersNamed,
};


export const syncModels = async () => {
  try {
    // ⚠️ CRITICAL WARNING: Oracle schema sync is unreliable
    // Tables should be created manually in BACK_OFFICE schema
    // This function should NEVER be used in production
    
    if (process.env.DB_SYNC !== "true") {
      console.log("ℹ️  DB_SYNC is disabled - skipping model synchronization");
      console.log("ℹ️  Tables should exist in BACK_OFFICE schema");
      return;
    }

    if (process.env.NODE_ENV === "production") {
      console.error("❌ DB_SYNC is not allowed in production environment");
      throw new Error("Model sync is disabled in production for safety");
    }

    // Additional safety check - prevent creating tables in wrong schema
    const dbUser = process.env.DB_USER;
    if (dbUser !== "BACK_OFFICE") {
      console.error(
        `❌ CRITICAL: Logged in as ${dbUser}, but tables are defined in BACK_OFFICE schema`
      );
      console.error(
        `❌ Sequelize may create tables in ${dbUser} schema instead of BACK_OFFICE`
      );
      console.error(`❌ Aborting sync to prevent duplicate tables in wrong schema`);
      console.error(`💡 To fix: Either login as BACK_OFFICE user, or create tables manually and set DB_SYNC=false`);
      return;
    }

    console.log("🔄 Syncing tables in development mode...");
    const models = [
      CmpDormanClientControlModel,
      CmpDormanClientMonthlyDataModel,
      CmpDormanSummaryModel,
      CmpEmpDailyOrdersModel,
      // ⚠️ الفيو مستبعد من sync
    ];

    for (const model of models) {
      console.log(`🔄 Syncing ${model.name}...`);
      await model.sync({ force: false, alter: false });
    }
  } catch (err) {
    console.error("❌ Error syncing models:", err);
    throw err; // Re-throw to prevent server start with invalid state
  }
};