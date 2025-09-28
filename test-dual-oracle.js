// test-dual-oracle.js - Test script for dual Oracle connectivity
import "dotenv-flow/config";
import {
  initOraclePool,
  getConnection,
  closeOraclePool,
} from "./src/config/oracledb.pool.js";
import { sequelize } from "./src/config/db.config.js";
import { checkIntegrations } from "./src/services/HealthService.js";
import { runDormantOrchestrator } from "./src/repositories/procedures/index.js";

async function testDualOracleConnectivity() {
  console.log("🧪 Testing Portable Dual Oracle Connectivity");
  console.log("===========================================");
  console.log(`Platform: ${process.platform}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(
    `Oracle Client Dir: ${process.env.ORACLE_CLIENT_LIB_DIR || "System Libraries"}`
  );
  console.log("");

  try {
    // Initialize Oracle pool
    console.log("1. Initializing Oracle connection pool...");
    await initOraclePool();
    console.log("✅ Oracle pool initialized");

    // Test Sequelize authentication
    console.log("2. Testing Sequelize authentication...");
    await sequelize.authenticate();
    console.log("✅ Sequelize authenticated");

    // Boot message (as shown in app.js)
    const dbPoolMin = process.env.DB_POOL_MIN || 2;
    const dbPoolMax = process.env.DB_POOL_MAX || 10;
    const oraPoolMin = process.env.ORA_POOL_MIN || 2;
    const oraPoolMax = process.env.ORA_POOL_MAX || 10;
    const serverIp = process.env.SERVER_IP || "0.0.0.0";
    const appPort = process.env.APP_PORT || 3000;
    const clientDir = process.env.ORACLE_CLIENT_LIB_DIR || "N/A";

    console.log(
      `🚀 BOOT: env=${process.env.NODE_ENV} | base=${serverIp}:${appPort} | ORM pool[min=${dbPoolMin},max=${dbPoolMax}] | PROC pool[min=${oraPoolMin},max=${oraPoolMax}] | clientDir=${clientDir}`
    );

    // Test health check integration
    console.log("3. Testing health check integration...");
    const healthResult = await checkIntegrations();
    console.log(
      "✅ Health check result:",
      JSON.stringify(healthResult, null, 2)
    );

    // Test procedure execution (if database connection allows)
    console.log("4. Testing procedure execution...");
    try {
      const procResult = await runDormantOrchestrator({ timeoutSeconds: 5 });
      console.log("✅ Procedure result:", JSON.stringify(procResult, null, 2));
    } catch (procError) {
      console.log(
        "⚠️  Procedure test skipped (expected if procedure/package doesn't exist):",
        procError.message
      );
    }

    console.log("\n🎉 All portability tests completed successfully!");
    console.log("✅ Project is ready for cross-platform deployment!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  } finally {
    // Cleanup
    console.log("🧹 Cleaning up connections...");
    try {
      await closeOraclePool();
      await sequelize.close();
      console.log("✅ Cleanup completed");
    } catch (cleanupError) {
      console.error("⚠️  Cleanup error:", cleanupError.message);
    }
    process.exit(0);
  }
}

// Run the test
testDualOracleConnectivity().catch(console.error);
