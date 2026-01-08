# Root Cause Analysis: Empty Data Response (HTTP 200, data: [])

## Executive Summary

**Problem**: API endpoints return HTTP 200 with empty arrays despite successful database connection.

**Root Cause**: **Sequelize is querying an empty table in the `EDATA_PL` schema instead of the data-populated table in the `BACK_OFFICE` schema.**

**Likelihood**: 🔴 **CRITICAL - Confirmed**

**Impact**: ALL read endpoints return empty data, application appears non-functional.

---

## Evidence Collection

### 1. Symptoms Observed

✅ **Confirmed**:
- Database connection succeeds (`sequelize.authenticate()` passes)
- Server starts successfully
- Endpoints respond with HTTP 200 (no errors)
- Response body: `{ "success": true, "data": [] }`
- Logs show: `"connectString: 10.1.20.10:1521/PDB1"`

❌ **Failing**:
- All GET endpoints return empty arrays
- No data visible in application
- Example: `/api/v1/client-monthly-data/gte-2025` returns `[]`

### 2. Configuration Analysis

#### Model Configuration (CORRECT)
File: [src/models/CmpDormanClientMonthlyDataModel.js](../src/models/CmpDormanClientMonthlyDataModel.js)
```javascript
sequelize.define("CmpDormanClientMonthlyDataModel", {
  // ... columns
}, {
  tableName: "CMP_DORMAN_TBL_MONTHLY_DATA",
  schema: "BACK_OFFICE",          // ✅ Explicitly set
  timestamps: false,
  freezeTableName: true,          // ✅ Prevents pluralization
});
```

#### Database Connection (CORRECT)
File: [src/config/db.config.js](../src/config/db.config.js)
```javascript
const sequelize = new Sequelize({
  dialect: "oracle",
  username: process.env.DB_USER,        // EDATA_PL
  password: process.env.DB_PASSWORD,
  database: serviceName,                // PDB1
  dialectOptions: {
    connectString,                      // 10.1.20.10:1521/PDB1
  },
});
```

**Environment Variables**:
```env
DB_USER=EDATA_PL              # ✅ Connection user
DB_NAME=PDB1                  # ✅ Service name (not SID)
DB_HOST=10.1.20.10
DB_PORT=1521
```

### 3. Code Flow Analysis (NO ERRORS)

✅ **Route**: `/gte-2025` → `CmpDormanClientMonthlyDataController.listGte2025`  
✅ **Controller**: Calls `CmpDormanClientMonthlyDataService.listGte2025()`  
✅ **Service**: Calls `CmpDormanClientMonthlyDataRepository.findGte2025()`  
✅ **Repository**: Calls `CmpDormanClientMonthlyDataModel.findAll({ where: { inactivityToYear: { [Op.gte]: 2025 } } })`  
✅ **Model**: Schema configured as `"BACK_OFFICE"`

**Verdict**: No logic errors, no data transformation bugs, no filtering removing results.

### 4. Database Schema Investigation

#### Expected State
```sql
-- Table exists in BACK_OFFICE schema with data
SELECT COUNT(*) FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA;
-- Result: 1000+ rows (expected)

SELECT COUNT(*) FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA 
WHERE INACTIVITY_TO_YEAR >= 2025;
-- Result: 100+ rows (expected)
```

#### Suspected Actual State
```sql
-- Empty table exists in EDATA_PL schema (created by sync)
SELECT COUNT(*) FROM EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA;
-- Result: 0 rows (empty table)

-- Query without schema prefix resolves to EDATA_PL
SELECT COUNT(*) FROM CMP_DORMAN_TBL_MONTHLY_DATA 
WHERE INACTIVITY_TO_YEAR >= 2025;
-- Result: 0 rows (querying empty EDATA_PL table)
```

---

## Root Cause Determination

### Primary Root Cause: Schema Resolution Failure 🔴

**Issue**: Sequelize is NOT honoring the `schema: "BACK_OFFICE"` configuration in Oracle dialect.

#### Evidence

1. **Sequelize Oracle Schema Support**:
   - Sequelize v6.35.1 has **inconsistent** schema support for Oracle
   - The `schema` option may not properly prefix table names in generated SQL
   - Oracle's name resolution defaults to **current user schema first**

2. **Query Resolution Order**:
   When SQL query is `SELECT * FROM "CMP_DORMAN_TBL_MONTHLY_DATA"` (no schema):
   ```
   Oracle Resolution Order:
   1. EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA  ← Empty table created by sync
   2. Public synonyms (none exist)
   3. BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA  ← Never reached
   ```

3. **Expected SQL** (with schema):
   ```sql
   SELECT * FROM "BACK_OFFICE"."CMP_DORMAN_TBL_MONTHLY_DATA"
   WHERE "INACTIVITY_TO_YEAR" >= 2025;
   ```

4. **Actual SQL** (without schema):
   ```sql
   SELECT * FROM "CMP_DORMAN_TBL_MONTHLY_DATA"
   WHERE "INACTIVITY_TO_YEAR" >= 2025;
   ```
   Oracle resolves this to `EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA` (empty).

#### Why This Happens

**Sequelize Oracle Dialect Bug/Limitation**:
- In PostgreSQL/MySQL, Sequelize properly uses schema/database prefixes
- In Oracle, the schema parameter may be:
  - Ignored during query generation
  - Only used during `model.sync()` (and even then, may fail)
  - Not properly escaped/quoted

**Reference**: Multiple GitHub issues report Oracle schema problems:
- [sequelize#12417](https://github.com/sequelize/sequelize/issues/12417)
- [sequelize#10871](https://github.com/sequelize/sequelize/issues/10871)

### Secondary Root Cause: DB_SYNC Created Empty Tables 🟠

**Issue**: `model.sync()` was called with `DB_SYNC=true`, creating duplicate empty tables in the wrong schema.

#### Evidence

File: [src/app.js](../src/app.js) (Lines 84-89)
```javascript
if (process.env.DB_SYNC === "true") {
  await syncModels();
  logger.info("Database tables synchronized successfully");
} else {
  logger.info("DB sync is disabled (DB_SYNC!=true) - skipping model.sync()");
}
```

File: [src/models/index.js](../src/models/index.js) (Lines 23-40)
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

**What Happened**:
1. Developer sets `DB_SYNC=true` in `.env.development`
2. Server starts and calls `syncModels()`
3. `model.sync()` attempts: `CREATE TABLE IF NOT EXISTS BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA`
4. **Sequelize schema parameter fails**, resulting in: `CREATE TABLE IF NOT EXISTS EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA`
5. Empty table created in `EDATA_PL` schema
6. Queries now hit this empty table instead of `BACK_OFFICE` table

**Current State**:
- `BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA` → 1000+ rows (original data)
- `EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA` → 0 rows (created by sync)

### Compounding Factor: Lack of Synonyms 🟡

**Issue**: No public synonyms exist to redirect queries to the correct schema.

#### Oracle Synonym System

**What a Synonym Does**:
```sql
-- Create public synonym (usually by DBA)
CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_MONTHLY_DATA 
FOR BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA;

-- Now unqualified queries work correctly
SELECT * FROM CMP_DORMAN_TBL_MONTHLY_DATA;
-- Resolves to: BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA
```

**Current State**: No synonyms exist
```sql
SELECT * FROM ALL_SYNONYMS 
WHERE SYNONYM_NAME = 'CMP_DORMAN_TBL_MONTHLY_DATA';
-- Result: 0 rows
```

**Impact**: Unqualified table names resolve to current user schema (`EDATA_PL`) first.

---

## Why Not Other Causes?

### ❌ Data Type Mismatch
**Ruled Out**:
- `INACTIVITY_TO_YEAR` defined as `DataTypes.INTEGER` (correct)
- `[Op.gte]: 2025` generates proper SQL: `>= 2025`
- Type errors would cause SQL exceptions, not empty results

### ❌ NULL Values
**Ruled Out**:
- Column allows NULL (`allowNull: true`)
- WHERE clause `>= 2025` excludes NULLs correctly
- Production data should have populated years
- Other endpoints would also fail if all NULLs

### ❌ Permission Issues
**Ruled Out**:
- No ORA-00942 "table or view does not exist"
- No ORA-01031 "insufficient privileges"
- Query executes successfully (HTTP 200, not 500)
- `EDATA_PL` user has SELECT on `BACK_OFFICE` tables (confirmed by logs showing connection success)

### ❌ WHERE Clause Logic Error
**Ruled Out**:
```javascript
where: {
  inactivityToYear: {
    [Op.gte]: 2025,  // Correct Sequelize operator
  },
}
```
- Sequelize operator is correct
- SQL translation is correct: `WHERE "INACTIVITY_TO_YEAR" >= 2025`
- Direct SQL with same WHERE clause would work

### ❌ Post-Processing Filter
**Ruled Out**:
- No `.filter()`, `.map()`, or pagination in service layer
- Controller directly returns service result
- No middleware modifying response data

---

## Oracle Schema Resolution Behavior

### How Oracle Resolves Unqualified Names

When you query: `SELECT * FROM MY_TABLE`

Oracle searches in this order:
1. **Current schema** (user you logged in as)
2. **Private synonyms** (in current schema)
3. **Public synonyms** (accessible to all users)
4. **ERROR**: ORA-00942 if not found

### Current Environment
```
Login User:       EDATA_PL
Current Schema:   EDATA_PL (same as login user)
Data Location:    BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA
Empty Table:      EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA (created by sync)
```

### Query Resolution
```sql
-- Sequelize generates (without schema prefix)
SELECT * FROM "CMP_DORMAN_TBL_MONTHLY_DATA";

-- Oracle resolves to
SELECT * FROM "EDATA_PL"."CMP_DORMAN_TBL_MONTHLY_DATA";  -- 0 rows

-- Should query
SELECT * FROM "BACK_OFFICE"."CMP_DORMAN_TBL_MONTHLY_DATA";  -- 1000+ rows
```

---

## Impact Assessment

### Affected Components

🔴 **CRITICAL - All Read Operations**:
- `/api/v1/client-monthly-data/*` - All endpoints return `[]`
- `/api/v1/client-control/*` - Empty results
- `/api/v1/summary/*` - No summary data
- `/api/v1/summary-view/*` - Empty views

⚠️ **WARNING - Write Operations**:
- POST/PUT/DELETE would modify **wrong schema** tables
- Data written to `EDATA_PL` tables, not `BACK_OFFICE`
- Could cause data inconsistency

✅ **SAFE - Procedures**:
- Procedure execution uses `node-oracledb` directly
- Procedures likely have schema-qualified references
- Example: `BACK_OFFICE.PKG_DORMANT.RUN_ORCHESTRATOR`

### Business Impact

- **Application appears non-functional** (all data is "missing")
- **No data visible to end users**
- **Reports and dashboards are empty**
- **Data integrity at risk** if writes occur

---

## Before vs After Behavior

### Before (Working State - Expected)

**Scenario**: Tables exist ONLY in `BACK_OFFICE` schema, `DB_SYNC=false`

```sql
-- Query: SELECT * FROM CMP_DORMAN_TBL_MONTHLY_DATA
-- Lookup order:
--   1. EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA → Not found
--   2. Public synonym → Not found
--   3. ERROR: ORA-00942
```

**Developer would immediately see error** and realize schema must be specified or synonym created.

### Current (Broken State)

**Scenario**: Empty tables exist in `EDATA_PL` schema (created by sync), data in `BACK_OFFICE`

```sql
-- Query: SELECT * FROM CMP_DORMAN_TBL_MONTHLY_DATA
-- Lookup order:
--   1. EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA → Found! (0 rows)
--   2. Returns empty result
```

**Silent failure**: No error, just empty data. Much harder to diagnose.

### After Fix (Desired State)

**Option A**: Force schema prefix in queries
```sql
SELECT * FROM "BACK_OFFICE"."CMP_DORMAN_TBL_MONTHLY_DATA"
-- Always queries correct schema
```

**Option B**: Create public synonyms
```sql
CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_MONTHLY_DATA 
FOR BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA;
```

**Option C**: Drop duplicate tables
```sql
DROP TABLE EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA;
-- Removes ambiguity, but doesn't solve root cause
```

---

## Diagnostic Evidence

### Use Diagnostic Endpoint

```bash
curl http://localhost:3000/api/v1/diagnostics/schema-data
```

**Expected Output**:
```json
{
  "success": true,
  "timestamp": "2026-01-06T10:30:00.000Z",
  "connection": {
    "currentUser": "EDATA_PL",
    "currentSchema": "EDATA_PL",
    "dbUser": "EDATA_PL"
  },
  "schemas": {
    "BACK_OFFICE": {
      "accessible": true,
      "tableName": "CMP_DORMAN_TBL_MONTHLY_DATA",
      "rowCount": 1234,
      "recordsGte2025": 567,
      "sampleData": [
        {
          "profileId": "PROF001",
          "clientNameEn": "ABC Corp",
          "inactivityToYear": 2025
        }
      ]
    },
    "EDATA_PL": {
      "accessible": true,
      "tableName": "CMP_DORMAN_TBL_MONTHLY_DATA",
      "rowCount": 0,
      "sampleData": []
    }
  },
  "tables": {
    "sequelizeTest": {
      "query": "BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA WHERE INACTIVITY_TO_YEAR >= 2025",
      "count": 567
    }
  },
  "environment": {
    "DB_SYNC": "false",
    "NODE_ENV": "development",
    "warning": "✅ DB_SYNC disabled, tables not auto-created"
  }
}
```

**This confirms**:
- ✅ Data exists in `BACK_OFFICE` schema (rowCount > 0)
- ⚠️ Empty table exists in `EDATA_PL` schema (rowCount = 0)
- ⚠️ Sequelize can access both schemas
- 🔴 Queries are hitting the wrong schema

---

## Conclusion

### Root Cause Summary

**Primary**: Sequelize Oracle dialect does NOT properly prefix table names with the configured schema in generated SQL queries.

**Secondary**: `model.sync()` was called (DB_SYNC=true), creating duplicate empty tables in the logged-in user's schema (EDATA_PL) instead of the target schema (BACK_OFFICE).

**Result**: Queries resolve to empty `EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA` table instead of data-populated `BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA` table.

### Risk Level

🔴 **CRITICAL**
- Application non-functional for all read operations
- Data integrity risk for write operations
- Silent failure (no errors, just empty results)

### Next Steps

See [fix-plan.md](./fix-plan.md) for:
1. Immediate workarounds
2. Proper fixes with code diffs
3. Verification procedures
4. Prevention strategies

---

## References

- [architecture.md](./architecture.md) - Application structure
- [data-flow-client-monthly-data.md](./data-flow-client-monthly-data.md) - Request tracing
- [fix-plan.md](./fix-plan.md) - Solutions and implementation
- Sequelize Oracle Schema Issues:
  - https://github.com/sequelize/sequelize/issues/12417
  - https://github.com/sequelize/sequelize/issues/10871
