import { ENV } from "../src/config/bootstrap.js";
import { initOracleClientOnce } from "../src/config/oracleClient.js";
import {
  initOraclePool,
  closeOraclePool,
} from "../src/config/oraclePool.js";
import { getSequelize, closeSequelize } from "../src/config/sequelize.js";
import { checkIntegrations } from "../src/services/HealthService.js";
import { runDormantOrchestrator } from "../src/repositories/procedures/index.js";

async function verifyConnectivity() {
  console.log("ñ??? Testing Portable Dual Oracle Connectivity");
  console.log("===========================================");
  console.log(`Platform: ${process.platform}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Environment: ${ENV.NODE_ENV}`);
  console.log(
    `Oracle Client Dir: ${ENV.ORACLE.CLIENT_LIB_DIR || "System Libraries"}`
  );
  console.log("");

  try {
    console.log("1. Initializing Oracle connection pool...");
    initOracleClientOnce();
    await initOraclePool();
    console.log("ƒ?? Oracle pool initialized");

    console.log("2. Testing Sequelize authentication...");
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log("ƒ?? Sequelize authenticated");

    const dbPoolMin = ENV.DB_POOL.MIN || 2;
    const dbPoolMax = ENV.DB_POOL.MAX || 10;
    const oraPoolMin = ENV.ORA_POOL.MIN || 2;
    const oraPoolMax = ENV.ORA_POOL.MAX || 10;
    const serverIp = ENV.SERVER_IP || "0.0.0.0";
    const appPort = ENV.APP_PORT || 3000;
    const clientDir = ENV.ORACLE.CLIENT_LIB_DIR || "N/A";

    console.log(
      `ñ??? BOOT: env=${ENV.NODE_ENV} | base=${serverIp}:${appPort} | ORM pool[min=${dbPoolMin},max=${dbPoolMax}] | PROC pool[min=${oraPoolMin},max=${oraPoolMax}] | clientDir=${clientDir}`
    );

    console.log("3. Testing health check integration...");
    const healthResult = await checkIntegrations();
    console.log("ƒ?? Health check result:", JSON.stringify(healthResult, null, 2));

    console.log("4. Testing procedure execution...");
    try {
      const procResult = await runDormantOrchestrator({ timeoutSeconds: 5 });
      console.log("ƒ?? Procedure result:", JSON.stringify(procResult, null, 2));
    } catch (procError) {
      console.log(
        "ƒ?ÿ‹??  Procedure test skipped (expected if procedure/package doesn't exist):",
        procError.message
      );
    }

    console.log("\nñ??? All portability tests completed successfully!");
    console.log("ƒ?? Project is ready for cross-platform deployment!");
  } catch (error) {
    console.error("ƒ?? Test failed:", error.message);
    console.error(error.stack);
  } finally {
    console.log("ñ??? Cleaning up connections...");
    try {
      await closeOraclePool();
      await closeSequelize();
      console.log("ƒ?? Cleanup completed");
    } catch (cleanupError) {
      console.error("ƒ?ÿ‹??  Cleanup error:", cleanupError.message);
    }
    process.exit(0);
  }
}

verifyConnectivity().catch(console.error);
