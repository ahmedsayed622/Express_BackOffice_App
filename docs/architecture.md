# Architecture Documentation

## Overview

This Express.js application uses a **layered architecture** with hybrid database connectivity for Oracle databases:
- **Sequelize ORM** for standard CRUD operations
- **node-oracledb** for stored procedure execution

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Request                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express Middleware Layer                      │
│  • CORS          • Helmet         • Rate Limiter                │
│  • Body Parser   • Morgan Logger  • Error Handler               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Routes Layer                             │
│  /api/v1/client-monthly-data     /api/v1/summary               │
│  /api/v1/client-control          /api/v1/health                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Controller Layer                            │
│  • Request validation    • Response formatting                  │
│  • Calls service layer   • Error delegation                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                              │
│  • Business logic        • Data transformation                  │
│  • Calls repository      • Input validation                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Repository Layer                            │
│  • Database queries      • Sequelize model calls                │
│  • WHERE clause logic    • Order/Filter/Search                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Model Layer                              │
│  • Sequelize Models      • Table/Schema Mapping                 │
│  • Column definitions    • Data validation                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Database Configuration                         │
│  ┌─────────────────────┐      ┌───────────────────────┐        │
│  │  Sequelize (ORM)    │      │  node-oracledb (Pool) │        │
│  │  • db.config.js     │      │  • oracledb.pool.js   │        │
│  │  • Connection pool  │      │  • Procedure runner   │        │
│  └──────────┬──────────┘      └──────────┬────────────┘        │
│             │                             │                      │
│             └──────────┬──────────────────┘                      │
│                        │                                         │
│              ┌─────────▼─────────┐                              │
│              │  Oracle Client    │                              │
│              │  (Thick Mode)     │                              │
│              │  oracle.client.js │                              │
│              └─────────┬─────────┘                              │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
           ┌──────────────────────────────┐
           │   Oracle Database Server     │
           │   • BACK_OFFICE schema       │
           │   • EDATA_PL schema          │
           └──────────────────────────────┘
```

## Request Lifecycle for `/api/v1/client-monthly-data/gte-2025`

### 1. **Entry Point** - [src/app.js](../src/app.js)
```javascript
// Server initialization
import routes from "./routes/index.js";
app.use("/api", routes);
```

### 2. **Routing** - [src/routes/index.js](../src/routes/index.js)
```javascript
router.use("/v1", v1Routes);
```

### 3. **V1 Routes** - [src/routes/v1/index.js](../src/routes/v1/index.js)
```javascript
router.use("/client-monthly-data", cmpDormanClientMonthlyDataRoutes);
```

### 4. **Specific Route** - [src/routes/v1/cmpDormanClientMonthlyData.routes.js](../src/routes/v1/cmpDormanClientMonthlyData.routes.js)
```javascript
router.get("/gte-2025", CmpDormanClientMonthlyDataController.listGte2025);
```

### 5. **Controller** - [src/controllers/CmpDormanClientMonthlyDataController.js](../src/controllers/CmpDormanClientMonthlyDataController.js)
```javascript
const listGte2025 = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientMonthlyDataService.listGte2025();
  return res.json({ success: true, data });
});
```

### 6. **Service** - [src/services/CmpDormanClientMonthlyDataService.js](../src/services/CmpDormanClientMonthlyDataService.js)
```javascript
listGte2025() {
  return CmpDormanClientMonthlyDataRepository.findGte2025();
}
```

### 7. **Repository** - [src/repositories/CmpDormanClientMonthlyDataRepository.js](../src/repositories/CmpDormanClientMonthlyDataRepository.js)
```javascript
findGte2025() {
  return CmpDormanClientMonthlyDataModel.findAll({
    where: {
      inactivityToYear: {
        [Op.gte]: 2025,
      },
    },
    order: [
      ["inactivityToYear", "DESC"],
      ["profileId", "ASC"],
    ],
  });
}
```

### 8. **Model** - [src/models/CmpDormanClientMonthlyDataModel.js](../src/models/CmpDormanClientMonthlyDataModel.js)
```javascript
const CmpDormanClientMonthlyDataModel = sequelize.define(
  "CmpDormanClientMonthlyDataModel",
  { /* column definitions */ },
  {
    tableName: "CMP_DORMAN_TBL_MONTHLY_DATA",
    schema: "BACK_OFFICE",  // ⚠️ Critical configuration
    timestamps: false,
    freezeTableName: true,
  }
);
```

### 9. **Database Configuration** - [src/config/db.config.js](../src/config/db.config.js)
```javascript
const sequelize = new Sequelize({
  dialect: "oracle",
  username: process.env.DB_USER,     // e.g., EDATA_PL
  password: process.env.DB_PASSWORD,
  database: serviceName,             // e.g., PDB1 (service name)
  dialectOptions: {
    connectString,                   // e.g., 10.1.20.10:1521/PDB1
  },
});
```

## Key Module Dependencies

### Database Modules
- **`src/config/db.config.js`** - Sequelize configuration and connection test
- **`src/config/oracle.client.js`** - Oracle Instant Client initialization (Thick mode)
- **`src/config/oracledb.pool.js`** - node-oracledb connection pool for procedures

### Core Modules
- **`src/models/index.js`** - Model exports and `syncModels()` function
- **`src/repositories/`** - Data access layer with Sequelize queries
- **`src/services/`** - Business logic layer
- **`src/controllers/`** - HTTP request handlers
- **`src/routes/`** - Express routing configuration

### Utility Modules
- **`src/utils/asyncWrapper.js`** - Async error handling wrapper
- **`src/utils/errorFactory.js`** - Centralized error creation
- **`src/utils/logger.js`** - Winston logging configuration
- **`src/middlewares/errorMiddleware.js`** - Global error handler

## Environment Configuration

Uses **dotenv-flow** for environment-specific settings:
- `.env.development`
- `.env.test`
- `.env.production`

### Critical Environment Variables
```env
# Database Connection
DB_USER=EDATA_PL
DB_PASSWORD=***
DB_HOST=10.1.20.10
DB_PORT=1521
DB_NAME=PDB1                    # Service name (not SID)

# Oracle Client
ORACLE_CLIENT_PATH=/path/to/instantclient

# Model Sync Control
DB_SYNC=false                   # ⚠️ Critical: Controls table creation
NODE_ENV=development
```

## Database Schema Resolution

### Sequelize Model Schema Configuration
Each model declares its schema explicitly:

```javascript
{
  tableName: "CMP_DORMAN_TBL_MONTHLY_DATA",
  schema: "BACK_OFFICE",  // ← This tells Sequelize WHERE to find the table
}
```

### Connection User vs Table Schema
- **Connection User**: `DB_USER=EDATA_PL` (who logs in)
- **Table Schema**: `schema: "BACK_OFFICE"` (where tables exist)
- **Query Translation**: `SELECT * FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA`

### Schema Permissions Required
The `EDATA_PL` user must have:
1. `SELECT` privilege on `BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA`
2. Public synonym OR explicit schema qualification
3. Connection rights to the PDB1 service

## Model Sync Behavior

### Purpose of `syncModels()`
Located in [src/models/index.js](../src/models/index.js):
```javascript
export const syncModels = async () => {
  if (process.env.NODE_ENV === "development") {
    const models = [
      CmpDormanClientControlModel,
      CmpDormanClientMonthlyDataModel,
      CmpDormanSummaryModel,
      CmpEmpDailyOrdersModel,
    ];
    for (const model of models) {
      await model.sync({ force: false, alter: false });
    }
  }
};
```

### When Sync is Called
[src/app.js](../src/app.js):
```javascript
if (process.env.DB_SYNC === "true") {
  await syncModels();
  logger.info("Database tables synchronized successfully");
} else {
  logger.info("DB sync is disabled (DB_SYNC!=true) - skipping model.sync()");
}
```

### ⚠️ CRITICAL ISSUE: Schema Resolution During Sync

When `model.sync()` is called, Sequelize behavior varies:

#### Expected Behavior (Oracle)
With `schema: "BACK_OFFICE"` in model options, Sequelize **should**:
```sql
CREATE TABLE BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA (...)
```

#### Actual Behavior (Potential Bug)
**If Sequelize doesn't properly support Oracle schema parameter**, it may:
```sql
CREATE TABLE EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA (...)
```
This creates the table in the **logged-in user's schema** (EDATA_PL) instead of BACK_OFFICE.

#### Result
- **Empty table created**: `EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA` (0 rows)
- **Data exists in**: `BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA` (has data)
- **Queries hit the empty table** because Sequelize resolves to current user schema first

## Query Generation

### Sequelize Query Translation
```javascript
// JavaScript code
CmpDormanClientMonthlyDataModel.findAll({
  where: { inactivityToYear: { [Op.gte]: 2025 } }
});
```

### Expected SQL (With Schema)
```sql
SELECT "PROFILE_ID", "CLIENT_NAME_EN", "UNIFIED_CODE", 
       "ANALYSIS_PERIOD_FROM", "ANALYSIS_PERIOD_TO", 
       "ANALYSIS_MONTH", "INACTIVITY_FROM_YEAR", "INACTIVITY_TO_YEAR"
FROM "BACK_OFFICE"."CMP_DORMAN_TBL_MONTHLY_DATA"
WHERE "INACTIVITY_TO_YEAR" >= 2025
ORDER BY "INACTIVITY_TO_YEAR" DESC, "PROFILE_ID" ASC;
```

### Actual SQL (If Schema Resolution Fails)
```sql
SELECT ... FROM "CMP_DORMAN_TBL_MONTHLY_DATA"  -- No schema prefix
-- Oracle resolves to: EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA (empty)
```

## Summary

The architecture is **well-structured** with clear separation of concerns:
- ✅ Proper layering (Routes → Controllers → Services → Repositories → Models)
- ✅ Hybrid database approach (Sequelize + node-oracledb)
- ✅ Comprehensive error handling
- ✅ Environment-based configuration

**The empty data issue** is NOT caused by architectural problems, but by:
1. **Schema resolution** during model sync or queries
2. **DB_SYNC accidentally enabled** creating empty tables in wrong schema
3. **Sequelize querying wrong schema** despite explicit schema configuration

See [root-cause-analysis.md](./root-cause-analysis.md) for detailed investigation.
