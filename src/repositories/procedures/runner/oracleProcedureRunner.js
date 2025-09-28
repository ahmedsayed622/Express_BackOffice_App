// repositories/procedures/runner/oracleProcedureRunner.js
import oracledb from "oracledb";
import { getConnection } from "../../../config/oracledb.pool.js";
import { ErrorFactory } from "../../../utils/index.js";

export async function runWithOptionalLock({
  sqlBlock,
  lockName = null,
  timeoutSeconds = 0,
  bindings = {},
}) {
  const wrapped = `BEGIN ${sqlBlock} END;`;

  if (lockName) {
    const lockSql = `
      DECLARE
        l_handle VARCHAR2(128);
        l_res    NUMBER;
      BEGIN
        DBMS_LOCK.ALLOCATE_UNIQUE(:lock_name, l_handle);
        l_res := DBMS_LOCK.REQUEST(l_handle, DBMS_LOCK.X_MODE, :timeout_sec, TRUE);
        IF l_res = 0 THEN
          ${wrapped}
          COMMIT;
        ELSIF l_res = 1 THEN
          RAISE_APPLICATION_ERROR(-20002, 'LOCK_TIMEOUT');
        ELSE
          RAISE_APPLICATION_ERROR(-20001, 'PROCESS_ALREADY_RUNNING');
        END IF;
      END;`;

    let conn;
    try {
      conn = await getConnection();
      await conn.execute(
        lockSql,
        {
          lock_name: lockName,
          timeout_sec: timeoutSeconds,
          ...bindings,
        },
        { autoCommit: false }
      );

      return {
        success: true,
        status: "COMPLETED",
        code: "OK",
        message: "Procedure completed successfully",
        driver: "node-oracledb",
      };
    } catch (err) {
      const msg = String(err?.message || "");
      if (
        msg.includes("PROCESS_ALREADY_RUNNING") ||
        msg.includes("ORA-20001")
      ) {
        throw ErrorFactory.alreadyRunning();
      }
      if (msg.includes("LOCK_TIMEOUT") || msg.includes("ORA-20002")) {
        throw ErrorFactory.timeout();
      }
      throw ErrorFactory.procError(msg, err?.number, err);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch {}
      }
    }
  } else {
    let conn;
    try {
      conn = await getConnection();
      await conn.execute(wrapped, bindings, { autoCommit: true });

      return {
        success: true,
        status: "COMPLETED",
        code: "OK",
        message: "Procedure completed successfully",
        driver: "node-oracledb",
      };
    } catch (err) {
      throw ErrorFactory.procError(
        String(err?.message || ""),
        err?.number,
        err
      );
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch {}
      }
    }
  }
}

export async function runPlainProc({
  packageName,
  procedureName,
  params = {},
}) {
  const paramNames = Object.keys(params);
  const paramPlaceholders = paramNames.map((name) => `:${name}`).join(", ");
  const call = `BEGIN ${packageName}.${procedureName}(${paramPlaceholders}); END;`;

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(call, params, { autoCommit: true });

    return {
      success: true,
      status: "COMPLETED",
      code: "OK",
      message: "Procedure completed successfully",
      driver: "node-oracledb",
    };
  } catch (err) {
    throw ErrorFactory.procError(String(err?.message || ""), err?.number, err);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
  }
}
