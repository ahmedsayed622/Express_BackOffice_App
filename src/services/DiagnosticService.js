// services/DiagnosticService.js
import { ENV, getOraclePool, initOraclePool, getSequelize } from "../config/index.js";
import { ErrorFactory } from "../utils/index.js";

/**
 * Diagnostic service for investigating empty data issues
 * Г? Л?? DEVELOPMENT/STAGING ONLY - Do not expose in production
 */
export async function checkSchemaAndData() {
  if (ENV.NODE_ENV === "production") {
    throw ErrorFactory.createError(
      "DIAGNOSTIC_DISABLED",
      403,
      "Diagnostic endpoint disabled in production"
    );
  }

  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    connection: {},
    schemas: {},
    tables: {},
  };

  let conn;
  try {
    let pool = getOraclePool();
    if (!pool) {
      pool = await initOraclePool();
    }
    conn = await pool.getConnection();

    const userResult = await conn.execute(
      "SELECT USER AS current_user, SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema FROM DUAL"
    );
    results.connection = {
      currentUser: userResult.rows[0][0],
      currentSchema: userResult.rows[0][1],
      dbUser: ENV.DB.USER,
    };

    try {
      const backofficeCountResult = await conn.execute(
        "SELECT COUNT(*) AS cnt FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA"
      );
      results.schemas.BACK_OFFICE = {
        accessible: true,
        tableName: "CMP_DORMAN_TBL_MONTHLY_DATA",
        rowCount: backofficeCountResult.rows[0][0],
      };

      const backOfficeSample = await conn.execute(
        `SELECT PROFILE_ID, CLIENT_NAME_EN, INACTIVITY_TO_YEAR 
         FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA 
         WHERE ROWNUM <= 5`
      );
      results.schemas.BACK_OFFICE.sampleData = backOfficeSample.rows.map(
        (row) => ({
          profileId: row[0],
          clientNameEn: row[1],
          inactivityToYear: row[2],
        })
      );

      const gte2025Result = await conn.execute(
        "SELECT COUNT(*) AS cnt FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA WHERE INACTIVITY_TO_YEAR >= 2025"
      );
      results.schemas.BACK_OFFICE.recordsGte2025 = gte2025Result.rows[0][0];
    } catch (backofficeError) {
      results.schemas.BACK_OFFICE = {
        accessible: false,
        error: backofficeError.message,
      };
    }

    const currentUser = results.connection.currentUser;
    try {
      const userSchemaCountResult = await conn.execute(
        `SELECT COUNT(*) AS cnt FROM ${currentUser}.CMP_DORMAN_TBL_MONTHLY_DATA`
      );
      results.schemas[currentUser] = {
        accessible: true,
        tableName: "CMP_DORMAN_TBL_MONTHLY_DATA",
        rowCount: userSchemaCountResult.rows[0][0],
      };

      if (userSchemaCountResult.rows[0][0] > 0) {
        const userSchemaSample = await conn.execute(
          `SELECT PROFILE_ID, CLIENT_NAME_EN, INACTIVITY_TO_YEAR 
           FROM ${currentUser}.CMP_DORMAN_TBL_MONTHLY_DATA 
           WHERE ROWNUM <= 5`
        );
        results.schemas[currentUser].sampleData = userSchemaSample.rows.map(
          (row) => ({
            profileId: row[0],
            clientNameEn: row[1],
            inactivityToYear: row[2],
          })
        );
      }
    } catch (userSchemaError) {
      results.schemas[currentUser] = {
        accessible: false,
        error: userSchemaError.message,
        hint: "Table may not exist in current user schema",
      };
    }

    try {
      const sequelize = getSequelize();
      const [sequelizeResults] = await sequelize.query(
        "SELECT COUNT(*) AS CNT FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA WHERE INACTIVITY_TO_YEAR >= 2025"
      );
      results.tables.sequelizeTest = {
        query: "BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA WHERE INACTIVITY_TO_YEAR >= 2025",
        count: sequelizeResults[0].CNT,
      };
    } catch (seqError) {
      results.tables.sequelizeTest = {
        error: seqError.message,
      };
    }

    results.environment = {
      DB_SYNC: ENV.DB_SYNC,
      NODE_ENV: ENV.NODE_ENV,
      warning:
        ENV.DB_SYNC === "true"
          ? "Г? Л?? DB_SYNC=true: Sequelize may have created tables in wrong schema"
          : "Г?? DB_SYNC disabled, tables not auto-created",
    };

    return results;
  } catch (error) {
    results.success = false;
    results.error = error.message;
    throw ErrorFactory.createError(
      "DIAGNOSTIC_ERROR",
      500,
      "Diagnostic check failed",
      error
    );
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
  }
}
