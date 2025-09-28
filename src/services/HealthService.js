// services/HealthService.js
import { getConnection } from "../config/oracledb.pool.js";
import { ErrorFactory } from "../utils/index.js";

export async function checkIntegrations() {
  const results = {
    success: true,
    orm: { driver: "sequelize", ok: false, pool: { min: null, max: null } },
    proc: {
      driver: "node-oracledb",
      ok: false,
      pool: { min: null, max: null },
      clientInit: !!process.env.ORACLE_CLIENT_LIB_DIR,
      clientDir: process.env.ORACLE_CLIENT_LIB_DIR || "N/A",
    },
  };

  try {
    // Test Sequelize ORM
    try {
      const { sequelize } = await import("../config/db.config.js");
      await sequelize.query("SELECT 1 AS x FROM dual", {
        type: sequelize.QueryTypes.SELECT,
      });
      results.orm.ok = true;
      results.orm.pool.min = parseInt(process.env.DB_POOL_MIN) || 2;
      results.orm.pool.max = parseInt(process.env.DB_POOL_MAX) || 10;
    } catch (ormError) {
      results.orm.error = ormError.message;
      results.success = false;
    }

    // Test node-oracledb
    let conn;
    try {
      conn = await getConnection();
      await conn.execute("SELECT 1 AS x FROM dual");
      results.proc.ok = true;
      results.proc.pool.min = parseInt(process.env.ORA_POOL_MIN) || 2;
      results.proc.pool.max = parseInt(process.env.ORA_POOL_MAX) || 10;
    } catch (procError) {
      results.proc.error = procError.message;
      results.success = false;
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch {}
      }
    }

    return results;
  } catch (error) {
    throw ErrorFactory.createError(
      "INTEGRATION_CHECK_FAILED",
      500,
      "Failed to check integrations",
      error
    );
  }
}
