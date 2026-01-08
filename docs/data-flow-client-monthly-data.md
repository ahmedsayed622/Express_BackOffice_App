# Data Flow Analysis: `/api/v1/client-monthly-data/gte-2025`

## Request Overview

**Endpoint**: `GET /api/v1/client-monthly-data/gte-2025`  
**Purpose**: Retrieve all monthly client data records where `INACTIVITY_TO_YEAR >= 2025`  
**Expected Result**: Array of client monthly data objects  
**Actual Result**: Empty array `[]` (HTTP 200)

---

## Complete Call Chain

### 1. HTTP Request
```http
GET /api/v1/client-monthly-data/gte-2025 HTTP/1.1
Host: localhost:3000
Accept: application/json
```

### 2. Express Middleware Stack
File: [src/app.js](../src/app.js)
```javascript
app.use(helmet());                    // Security headers
app.use(cors());                      // CORS policy
app.use(express.json());              // Body parser
app.use(morgan());                    // HTTP logging
app.use("/api", routes);              // Mount API routes
```

### 3. Root Router
File: [src/routes/index.js](../src/routes/index.js)
```javascript
import v1Routes from "./v1/index.js";
router.use("/v1", v1Routes);          // /api/v1/*
```

### 4. V1 Router
File: [src/routes/v1/index.js](../src/routes/v1/index.js)
```javascript
import cmpDormanClientMonthlyDataRoutes from "./cmpDormanClientMonthlyData.routes.js";
router.use("/client-monthly-data", cmpDormanClientMonthlyDataRoutes);
```

### 5. Monthly Data Routes
File: [src/routes/v1/cmpDormanClientMonthlyData.routes.js](../src/routes/v1/cmpDormanClientMonthlyData.routes.js)
```javascript
router.get("/gte-2025", CmpDormanClientMonthlyDataController.listGte2025);
```
- **No middleware validation** (no parameters to validate)
- Direct controller invocation

### 6. Controller Layer
File: [src/controllers/CmpDormanClientMonthlyDataController.js](../src/controllers/CmpDormanClientMonthlyDataController.js)
```javascript
const listGte2025 = asyncWrapper(async (req, res) => {
  const data = await CmpDormanClientMonthlyDataService.listGte2025();
  return res.json({ success: true, data });
});
```
**Responsibilities**:
- Wrapped in `asyncWrapper` for error handling
- Calls service method
- Returns JSON response: `{ success: true, data: [] }`
- **No data transformation or filtering here**

### 7. Service Layer
File: [src/services/CmpDormanClientMonthlyDataService.js](../src/services/CmpDormanClientMonthlyDataService.js)
```javascript
listGte2025() {
  return CmpDormanClientMonthlyDataRepository.findGte2025();
}
```
**Responsibilities**:
- Simple pass-through to repository
- **No business logic applied**
- **No filtering or pagination**
- Returns whatever repository returns

### 8. Repository Layer
File: [src/repositories/CmpDormanClientMonthlyDataRepository.js](../src/repositories/CmpDormanClientMonthlyDataRepository.js)
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
**Responsibilities**:
- Constructs Sequelize query
- WHERE clause: `INACTIVITY_TO_YEAR >= 2025`
- ORDER BY: `INACTIVITY_TO_YEAR DESC, PROFILE_ID ASC`
- **No limit or offset** (returns all matching rows)

**Sequelize Operator**:
```javascript
import { Op } from "sequelize";
inactivityToYear: { [Op.gte]: 2025 }
```
Translates to SQL: `WHERE "INACTIVITY_TO_YEAR" >= 2025`

### 9. Model Layer
File: [src/models/CmpDormanClientMonthlyDataModel.js](../src/models/CmpDormanClientMonthlyDataModel.js)
```javascript
const CmpDormanClientMonthlyDataModel = sequelize.define(
  "CmpDormanClientMonthlyDataModel",
  {
    profileId: {
      type: DataTypes.STRING(50),
      field: "PROFILE_ID",
      allowNull: false,
      primaryKey: true,
    },
    // ... other columns
    inactivityToYear: {
      type: DataTypes.INTEGER,
      field: "INACTIVITY_TO_YEAR",
      allowNull: true,
    },
  },
  {
    tableName: "CMP_DORMAN_TBL_MONTHLY_DATA",
    schema: "BACK_OFFICE",          // ⚠️ Target schema
    timestamps: false,
    freezeTableName: true,
  }
);
```

**Critical Configuration**:
- `tableName`: `CMP_DORMAN_TBL_MONTHLY_DATA`
- `schema`: `BACK_OFFICE` (should prefix table name)
- `freezeTableName: true` (prevents pluralization)
- Column mapping: `inactivityToYear` → `INACTIVITY_TO_YEAR`

### 10. Sequelize Query Generation
File: [src/config/db.config.js](../src/config/db.config.js)

**Sequelize Instance**:
```javascript
const sequelize = new Sequelize({
  dialect: "oracle",
  username: process.env.DB_USER,        // EDATA_PL
  password: process.env.DB_PASSWORD,
  database: serviceName,                // PDB1
  dialectOptions: {
    connectString,                      // 10.1.20.10:1521/PDB1
  },
  logging: process.env.NODE_ENV === "development" 
    ? (msg) => logger.debug(msg) 
    : false,
});
```

**Expected SQL Query** (with schema prefix):
```sql
SELECT 
  "PROFILE_ID", 
  "CLIENT_NAME_EN", 
  "UNIFIED_CODE",
  "ANALYSIS_PERIOD_FROM", 
  "ANALYSIS_PERIOD_TO", 
  "ANALYSIS_MONTH",
  "INACTIVITY_FROM_YEAR", 
  "INACTIVITY_TO_YEAR"
FROM "BACK_OFFICE"."CMP_DORMAN_TBL_MONTHLY_DATA"
WHERE "INACTIVITY_TO_YEAR" >= 2025
ORDER BY "INACTIVITY_TO_YEAR" DESC, "PROFILE_ID" ASC;
```

**Possible Actual Query** (without schema or wrong schema):
```sql
-- Scenario 1: No schema prefix
SELECT ... FROM "CMP_DORMAN_TBL_MONTHLY_DATA"
WHERE "INACTIVITY_TO_YEAR" >= 2025;
-- Oracle resolves to: EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA

-- Scenario 2: Wrong schema resolution
SELECT ... FROM "EDATA_PL"."CMP_DORMAN_TBL_MONTHLY_DATA"
WHERE "INACTIVITY_TO_YEAR" >= 2025;
```

### 11. Database Execution

**Connection Details**:
- User: `EDATA_PL`
- Service: `PDB1`
- ConnectString: `10.1.20.10:1521/PDB1`

**Query Resolution**:
When schema is NOT properly prefixed, Oracle resolves tables in this order:
1. **Current user schema** (`EDATA_PL`)
2. Public synonyms
3. Schema-qualified references

**Problem**:
If the query hits `EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA` instead of `BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA`:
- The table in `EDATA_PL` schema is **empty** (0 rows)
- The table in `BACK_OFFICE` schema has **actual data**

### 12. Response Assembly

**Query Result**: `[]` (empty array)

**Repository returns**: `[]`

**Service returns**: `[]`

**Controller wraps**:
```javascript
return res.json({ success: true, data: [] });
```

**HTTP Response**:
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": []
}
```

---

## Why Returns Empty Array?

### Hypothesis 1: Schema Resolution Failure ⭐ **MOST LIKELY**

**Cause**: Sequelize is NOT properly using the `schema: "BACK_OFFICE"` configuration.

**Evidence**:
1. Model defines `schema: "BACK_OFFICE"`
2. Connection logs show correct `connectString: 10.1.20.10:1521/PDB1`
3. `sequelize.authenticate()` succeeds (connection works)
4. HTTP 200 response (query executes, no errors)
5. Empty array returned (query succeeds but finds 0 rows)

**Root Cause**:
- Query hits `EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA` (empty, auto-created by sync)
- Should hit `BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA` (contains data)

### Hypothesis 2: DB_SYNC Created Empty Tables ⭐ **LIKELY TRIGGER**

**Cause**: `DB_SYNC=true` was enabled at some point, causing `model.sync()` to create tables in the wrong schema.

**File**: [src/app.js](../src/app.js)
```javascript
if (process.env.DB_SYNC === "true") {
  await syncModels();  // ⚠️ Creates tables
}
```

**File**: [src/models/index.js](../src/models/index.js)
```javascript
export const syncModels = async () => {
  for (const model of models) {
    await model.sync({ force: false, alter: false });
  }
};
```

**What Happened**:
1. `DB_SYNC=true` set in environment
2. `model.sync()` called on startup
3. Sequelize attempted: `CREATE TABLE BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA`
4. **If schema parameter ignored**: Table created in `EDATA_PL` schema instead
5. Result: Empty table `EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA` created
6. Queries resolve to this empty table first

### Hypothesis 3: Data Type Mismatch (UNLIKELY)

**Cause**: Column type mismatch causing comparison failure.

**Check**:
```javascript
inactivityToYear: {
  type: DataTypes.INTEGER,  // Sequelize type
  field: "INACTIVITY_TO_YEAR",
}
```

**SQL**: `WHERE "INACTIVITY_TO_YEAR" >= 2025`

**Verdict**: ❌ Unlikely
- `DataTypes.INTEGER` is correct for numeric comparison
- `[Op.gte]` generates proper SQL `>=` operator
- If there was a type error, query would fail with SQL error, not return empty

### Hypothesis 4: NULL Values (UNLIKELY)

**Cause**: All `INACTIVITY_TO_YEAR` values are NULL.

**Check**:
```javascript
inactivityToYear: {
  allowNull: true,  // ⚠️ Allows NULL
}
```

**SQL**: `WHERE "INACTIVITY_TO_YEAR" >= 2025`  
NULL values are excluded by this condition (NULL >= 2025 is NULL, not true).

**Verdict**: ❌ Unlikely
- Would require ALL records to have NULL `INACTIVITY_TO_YEAR`
- Production data typically has populated year fields
- Other endpoints (by year, by month) would also return empty

### Hypothesis 5: Permission Issue (UNLIKELY)

**Cause**: `EDATA_PL` user lacks SELECT permission on `BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA`.

**Verdict**: ❌ Unlikely
- Query executes successfully (no ORA-00942 "table or view does not exist")
- No ORA-01031 "insufficient privileges"
- Returns empty array, not error

---

## Sequelize Query Logging

### Enable Query Logging

**File**: [src/config/db.config.js](../src/config/db.config.js)
```javascript
const sequelize = new Sequelize({
  logging: process.env.NODE_ENV === "development"
    ? (msg) => logger.debug(msg, { service: "sequelize" })
    : false,
  logQueryParameters: process.env.NODE_ENV === "development",
});
```

### Expected Log Output
When `NODE_ENV=development`, you should see:
```
Executing (default): SELECT "PROFILE_ID", "CLIENT_NAME_EN", ... 
FROM "BACK_OFFICE"."CMP_DORMAN_TBL_MONTHLY_DATA" 
WHERE "INACTIVITY_TO_YEAR" >= 2025 
ORDER BY "INACTIVITY_TO_YEAR" DESC, "PROFILE_ID" ASC;
```

### Actual Log Output (If Schema Missing)
```
Executing (default): SELECT ... FROM "CMP_DORMAN_TBL_MONTHLY_DATA" ...
```
Note: Missing `"BACK_OFFICE".` prefix

---

## Verification Steps

### Step 1: Check Sequelize Query Logs
```bash
# Enable development mode
export NODE_ENV=development

# Start server
npm run start:dev

# Hit endpoint
curl http://localhost:3000/api/v1/client-monthly-data/gte-2025

# Check logs for actual SQL query
```

### Step 2: Run Diagnostic Endpoint
```bash
curl http://localhost:3000/api/v1/diagnostics/schema-data
```

Expected output shows:
- Current user: `EDATA_PL`
- Current schema: `EDATA_PL` or `BACK_OFFICE`
- Row count in `BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA`
- Row count in `EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA`

### Step 3: Direct Database Query
Connect as `EDATA_PL` and run:
```sql
-- Check BACK_OFFICE schema (should have data)
SELECT COUNT(*) FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA 
WHERE INACTIVITY_TO_YEAR >= 2025;

-- Check current user schema (may be empty)
SELECT COUNT(*) FROM EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA 
WHERE INACTIVITY_TO_YEAR >= 2025;

-- Check which schema Sequelize uses
SELECT COUNT(*) FROM CMP_DORMAN_TBL_MONTHLY_DATA 
WHERE INACTIVITY_TO_YEAR >= 2025;
-- This resolves to EDATA_PL schema if no synonym exists
```

### Step 4: Check Table Existence
```sql
-- List tables in BACK_OFFICE schema
SELECT TABLE_NAME FROM ALL_TABLES 
WHERE OWNER = 'BACK_OFFICE' 
AND TABLE_NAME LIKE 'CMP_DORMAN%';

-- List tables in EDATA_PL schema
SELECT TABLE_NAME FROM ALL_TABLES 
WHERE OWNER = 'EDATA_PL' 
AND TABLE_NAME LIKE 'CMP_DORMAN%';

-- Check public synonyms
SELECT SYNONYM_NAME, TABLE_OWNER, TABLE_NAME 
FROM ALL_SYNONYMS 
WHERE SYNONYM_NAME = 'CMP_DORMAN_TBL_MONTHLY_DATA';
```

---

## Conclusion

The data flow is **architecturally sound** with no logic errors. The empty array issue is caused by:

1. **Sequelize querying the wrong schema** despite `schema: "BACK_OFFICE"` configuration
2. **Empty table in EDATA_PL schema** created by `model.sync()` when `DB_SYNC=true`
3. **Lack of schema prefix** in generated SQL, causing Oracle to resolve to current user schema

**Next Steps**: See [root-cause-analysis.md](./root-cause-analysis.md) for detailed investigation and [fix-plan.md](./fix-plan.md) for solutions.
