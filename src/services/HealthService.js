// services/HealthService.js
import { ENV, getOraclePool, initOraclePool, getSequelize } from "../config/index.js";
import { ErrorFactory } from "../utils/index.js";

export async function checkIntegrations() {
  const results = {
    success: true,
    orm: { driver: "sequelize", ok: false, pool: { min: null, max: null } },
    proc: {
      driver: "node-oracledb",
      ok: false,
      pool: { min: null, max: null },
      clientInit: !!ENV.ORACLE.CLIENT_LIB_DIR,
      clientDir: ENV.ORACLE.CLIENT_LIB_DIR || "N/A",
    },
  };

  try {
    // Test Sequelize ORM
    try {
      const sequelize = getSequelize();
      await sequelize.query("SELECT 1 AS x FROM dual", {
        type: sequelize.QueryTypes.SELECT,
      });
      results.orm.ok = true;
      results.orm.pool.min = ENV.DB_POOL.MIN;
      results.orm.pool.max = ENV.DB_POOL.MAX;
    } catch (ormError) {
      results.orm.error = ormError.message;
      results.success = false;
    }

    // Test node-oracledb
    let conn;
    try {
      let pool = getOraclePool();
      if (!pool) {
        pool = await initOraclePool();
      }
      conn = await pool.getConnection();
      await conn.execute("SELECT 1 AS x FROM dual");
      results.proc.ok = true;
      results.proc.pool.min = ENV.ORA_POOL.MIN;
      results.proc.pool.max = ENV.ORA_POOL.MAX;
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
