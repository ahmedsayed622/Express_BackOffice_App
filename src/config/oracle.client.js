// config/oracle.client.js
import oracledb from "oracledb";
import { logger } from "../utils/index.js";

let isInitialized = false;

/**
 * Initialize Oracle Instant Client ONCE (singleton pattern)
 * Supports Thick mode for Oracle 11g compatibility
 * @returns {boolean} true if initialized, false if already initialized or failed
 */
export function initOracleClientOnce() {
  if (isInitialized) {
    logger.debug("Oracle client already initialized, skipping", {
      service: "oracle-client",
    });
    return false;
  }

  try {
    const clientPath = process.env.ORACLE_CLIENT_PATH;
    if (clientPath) {
      oracledb.initOracleClient({ libDir: clientPath });
      isInitialized = true;
      logger.info("Oracle Thick mode client initialized successfully", {
        service: "oracle-client",
        clientPath,
      });
      return true;
    } else {
      // Try default initialization
      logger.warn(
        "ORACLE_CLIENT_PATH not set - attempting default initialization",
        {
          service: "oracle-client",
        }
      );
      try {
        oracledb.initOracleClient();
        isInitialized = true;
        logger.info("Oracle client initialized with default settings", {
          service: "oracle-client",
        });
        return true;
      } catch (defaultError) {
        logger.warn("Could not initialize Oracle client with default settings", {
          service: "oracle-client",
          error: defaultError.message,
        });
        return false;
      }
    }
  } catch (error) {
    // Already initialized or other error
    if (error.message.includes("DPI-1047") || error.message.includes("already initialized")) {
      logger.debug("Oracle client initialization skipped (already done)", {
        service: "oracle-client",
      });
      isInitialized = true;
      return false;
    }
    
    logger.error("Failed to initialize Oracle client:", {
      service: "oracle-client",
      error: error.message,
    });
    logger.warn(
      "Continuing without Oracle Thick mode - some features may be limited",
      {
        service: "oracle-client",
      }
    );
    return false;
  }
}

/**
 * Build Oracle connectString from environment variables
 * Supports backward compatibility with multiple env var names
 * @returns {string} connectString in format "host:port/serviceName"
 */
export function buildConnectString() {
  // Support multiple env var names for backward compatibility
  // Priority: DB_NAME (current) > DB_SERVICE_NAME > DB_SERVICE
  const serviceName = process.env.DB_NAME || 
                     process.env.DB_SERVICE_NAME || 
                     process.env.DB_SERVICE;
  
  if (!serviceName) {
    throw new Error(
      'Missing database service name. Set DB_NAME in environment variables.'
    );
  }

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;

  if (!host || !port) {
    throw new Error(
      'Missing DB_HOST or DB_PORT in environment variables.'
    );
  }

  return `${host}:${port}/${serviceName}`;
}
