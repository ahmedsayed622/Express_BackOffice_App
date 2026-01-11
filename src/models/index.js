import { ENV } from "../config/index.js";
import CmpDormanClientControlModel, {
  CmpDormanClientControlModel as CmpDormanClientControlNamed,
} from "./CmpDormanClientControlModel.js";
import CmpDormanClientMonthlyDataModel, {
  CmpDormanClientMonthlyDataModel as CmpDormanClientMonthlyDataNamed,
} from "./CmpDormanClientMonthlyDataModel.js";
import CmpDormanSummaryModel, {
  CmpDormanSummaryModel as CmpDormanSummaryNamed,
} from "./CmpDormanSummaryModel.js";
import CmpDormanSummaryViewModel, {
  CmpDormanSummaryViewModel as CmpDormanSummaryViewNamed,
} from "./CmpDormanSummaryViewModel.js";
import CmpEmpDailyOrdersModel, {
  CmpEmpDailyOrdersModel as CmpEmpDailyOrdersNamed,
} from "./CmpEmpDailyOrdersModel.js";

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
    // ƒ?ÿ‹?? CRITICAL WARNING: Oracle schema sync is unreliable
    // Tables should be created manually in BACK_OFFICE schema
    // This function should NEVER be used in production

    if (ENV.DB_SYNC !== "true") {
      console.log("ƒ??‹??  DB_SYNC is disabled - skipping model synchronization");
      console.log("ƒ??‹??  Tables should exist in BACK_OFFICE schema");
      return;
    }

    if (ENV.NODE_ENV === "production") {
      console.error("ƒ?? DB_SYNC is not allowed in production environment");
      throw new Error("Model sync is disabled in production for safety");
    }

    const dbUser = ENV.DB.USER;
    if (dbUser !== "BACK_OFFICE") {
      console.error(
        `ƒ?? CRITICAL: Logged in as ${dbUser}, but tables are defined in BACK_OFFICE schema`
      );
      console.error(
        `ƒ?? Sequelize may create tables in ${dbUser} schema instead of BACK_OFFICE`
      );
      console.error(
        "ƒ?? Aborting sync to prevent duplicate tables in wrong schema"
      );
      console.error(
        "ñ??? To fix: Either login as BACK_OFFICE user, or create tables manually and set DB_SYNC=false"
      );
      return;
    }

    console.log("ñ??? Syncing tables in development mode...");
    const models = [
      CmpDormanClientControlModel,
      CmpDormanClientMonthlyDataModel,
      CmpDormanSummaryModel,
      CmpEmpDailyOrdersModel,
      // ƒ?ÿ‹?? á?â?â?â?â? â?á?á?á?á?á? â?â? sync
    ];

    for (const model of models) {
      console.log(`ñ??? Syncing ${model.name}...`);
      await model.sync({ force: false, alter: false });
    }
  } catch (err) {
    console.error("ƒ?? Error syncing models:", err);
    throw err;
  }
};
