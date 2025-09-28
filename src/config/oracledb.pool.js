// config/oracledb.pool.js
import oracledb from "oracledb";
import fs from "fs";
import path from "path";
import { logger } from "../utils/index.js";

let pool = null;

/**
 * Initialize Oracle Instant Client if needed (cross-platform)
 */
function maybeInitOracleClient() {
  const libDir = process.env.ORACLE_CLIENT_LIB_DIR;
  if (!libDir) {
    logger.debug(
      "ORACLE_CLIENT_LIB_DIR not set - using system Oracle client libraries",
      {
        service: "oracle-client",
      }
    );
    return false;
  }

  if (!fs.existsSync(libDir)) {
    logger.warn(`ORACLE_CLIENT_LIB_DIR not found: ${libDir} — skipping init`, {
      service: "oracle-client",
      libDir,
    });
    return false;
  }

  try {
    oracledb.initOracleClient({ libDir });
    logger.info(`Oracle client initialized from: ${libDir}`, {
      service: "oracle-client",
      libDir,
      platform: process.platform,
    });
    return true;
  } catch (e) {
    logger.warn(
      `Oracle client init failed: ${e.message} — continuing without explicit init`,
      {
        service: "oracle-client",
        libDir,
        error: e.message,
      }
    );
    return false;
  }
}

/**
 * Initialize Oracle connection pool
 */
export async function initOraclePool() {
  try {
    // Try to initialize Oracle client if configured
    const clientInitialized = maybeInitOracleClient();

    const connectString = `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`;

    const poolConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString,
      poolMin: parseInt(process.env.ORA_POOL_MIN) || 2,
      poolMax: parseInt(process.env.ORA_POOL_MAX) || 10,
      poolTimeout: parseInt(process.env.ORA_POOL_TIMEOUT) || 60,
      queueMax: parseInt(process.env.ORA_QUEUE_MAX) || 500,
      queueTimeout: parseInt(process.env.ORA_QUEUE_TIMEOUT) || 60000,
      stmtCacheSize: parseInt(process.env.ORA_STMT_CACHE) || 50,
      poolAlias: "default",
      events: true,
    };

    pool = await oracledb.createPool(poolConfig);

    logger.info("Oracle connection pool initialized successfully", {
      service: "oracle-pool",
      connectString,
      poolMin: poolConfig.poolMin,
      poolMax: poolConfig.poolMax,
      environment: process.env.NODE_ENV,
      clientInitialized,
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

/**
 * Get a connection from the pool
 */
export async function getConnection() {
  try {
    if (!pool) {
      await initOraclePool();
    }
    return await pool.getConnection();
  } catch (error) {
    logger.error("Failed to get Oracle connection from pool:", {
      service: "oracle-pool",
      error: error.message,
    });
    throw error;
  }
}

/**
 * Close the Oracle connection pool
 */
export async function closeOraclePool() {
  try {
    if (pool) {
      await pool.close(10); // 10 seconds timeout
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

/**
 * Get pool statistics
 */
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

// Graceful shutdown handler
process.on("SIGTERM", closeOraclePool);
process.on("SIGINT", closeOraclePool);
