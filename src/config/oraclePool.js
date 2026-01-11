import oracledb from "oracledb";
import { logger } from "../utils/index.js";
import { ENV } from "./bootstrap.js";
import { initOracleClientOnce } from "./oracleClient.js";

let pool = null;

export async function initOraclePool() {
  if (pool) {
    return pool;
  }

  try {
    initOracleClientOnce();

    const poolConfig = {
      user: ENV.DB.USER,
      password: ENV.DB.PASSWORD,
      connectString: ENV.DB.CONNECT_STRING,
      poolMin: ENV.ORA_POOL.MIN,
      poolMax: ENV.ORA_POOL.MAX,
      poolTimeout: ENV.ORA_POOL.TIMEOUT,
      queueMax: ENV.ORA_POOL.QUEUE_MAX,
      queueTimeout: ENV.ORA_POOL.QUEUE_TIMEOUT,
      stmtCacheSize: ENV.ORA_POOL.STMT_CACHE,
      poolAlias: "default",
      events: true,
    };

    pool = await oracledb.createPool(poolConfig);

    logger.info("Oracle connection pool initialized successfully", {
      service: "oracle-pool",
      connectString: ENV.DB.CONNECT_STRING,
      poolMin: poolConfig.poolMin,
      poolMax: poolConfig.poolMax,
      environment: ENV.NODE_ENV,
    });

    return pool;
  } catch (error) {
    logger.error("Failed to initialize Oracle connection pool:", {
      service: "oracle-pool",
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export function getOraclePool() {
  return pool;
}

export async function closeOraclePool() {
  try {
    if (pool) {
      await pool.close(10);
      pool = null;
      logger.info("Oracle connection pool closed successfully", {
        service: "oracle-pool",
      });
    }
  } catch (error) {
    logger.error("Failed to close Oracle connection pool:", {
      service: "oracle-pool",
      error: error.message,
    });
    throw error;
  }
}

export function getPoolStats() {
  if (!pool) {
    return null;
  }

  return {
    poolAlias: pool.poolAlias,
    poolMin: pool.poolMin,
    poolMax: pool.poolMax,
    poolTimeout: pool.poolTimeout,
    connectionsOpen: pool.connectionsOpen,
    connectionsInUse: pool.connectionsInUse,
  };
}
