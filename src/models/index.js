import { logger } from "../utils/index.js";
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
    // Critical safety: Oracle schema sync is unreliable.
    // Tables should be created manually in BACK_OFFICE schema.
    // This function should never be used in production.

    if (ENV.DB_SYNC !== "true") {
      logger.info("DB_SYNC is disabled - skipping model synchronization");
      logger.info("Tables should exist in BACK_OFFICE schema");
      return;
    }

    if (ENV.NODE_ENV === "production") {
      logger.error("DB_SYNC is not allowed in production environment");
      throw new Error("Model sync is disabled in production for safety");
    }

    const dbUser = ENV.DB.USER;
    if (dbUser !== "BACK_OFFICE") {
      logger.error(
        "Critical: Logged in as %s, but tables are defined in BACK_OFFICE schema",
        dbUser
      );
      logger.error(
        "Sequelize may create tables in %s schema instead of BACK_OFFICE",
        dbUser
      );
      logger.error(
        "Aborting sync to prevent duplicate tables in the wrong schema"
      );
      logger.error(
        "To fix: Either login as BACK_OFFICE user, or create tables manually and set DB_SYNC=false"
      );
      return;
    }

    logger.info("Syncing tables in development mode...");
    const models = [
      CmpDormanClientControlModel,
      CmpDormanClientMonthlyDataModel,
      CmpDormanSummaryModel,
      CmpEmpDailyOrdersModel,
    ];

    for (const model of models) {
      logger.info("Syncing %s...", model.name);
      await model.sync({ force: false, alter: false });
    }
  } catch (err) {
    logger.error("Error syncing models:", err);
    throw err;
  }
};
