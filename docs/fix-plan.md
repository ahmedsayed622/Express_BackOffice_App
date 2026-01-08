# Fix Plan: Resolve Empty Data Issue

## Overview

**Problem**: Sequelize queries return empty arrays because they hit the wrong schema (EDATA_PL) instead of the data schema (BACK_OFFICE).

**Solution Strategy**: Force schema prefixing in all Sequelize queries using custom configuration.

---

## Solution Options

### Option 1: Manual Schema Prefixing in Queries ⭐ RECOMMENDED
**Pros**: 
- Guaranteed to work
- No dependency on Sequelize schema support
- Explicit and clear
- Works with current Sequelize version

**Cons**: 
- Requires code changes in repositories
- More verbose queries

### Option 2: Create Database Synonyms
**Pros**:
- No code changes needed
- Centralized database-level fix

**Cons**:
- Requires DBA access
- Doesn't prevent future sync issues
- Doesn't address root cause

### Option 3: Sequelize Raw Queries
**Pros**:
- Complete control over SQL

**Cons**:
- Loses ORM benefits
- More maintenance burden
- Significant refactoring required

---

## Recommended Fix: Option 1 (Manual Schema Prefixing)

### Implementation Plan

We'll modify repositories to explicitly specify schema-qualified table names in queries.

---

## Code Changes

### Change 1: Update Repository to Use Table Name Helper

#### File: `src/repositories/CmpDormanClientMonthlyDataRepository.js`

**Current Code** (Lines 1-64):
```javascript
// repositories/CmpDormanClientMonthlyDataRepository.js
import { Op } from "sequelize";
import CmpDormanClientMonthlyDataModel from "../models/CmpDormanClientMonthlyDataModel.js";

export default {
  findAll(
    where = {},
    order = [
      ["analysisPeriodFrom", "DESC"],
      ["profileId", "ASC"],
    ]
  ) {
    return CmpDormanClientMonthlyDataModel.findAll({
      where,
      order,
    });
  },

  findById(profileId) {
    return CmpDormanClientMonthlyDataModel.findByPk(profileId);
  },

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
  },

  searchAll(term) {
    const isNumeric = /^\d+$/.test(term);
    const whereCondition = {
      [Op.or]: [
        { profileId: { [Op.like]: `%${term}%` } },
        { clientNameEn: { [Op.like]: `%${term}%` } },
        { unifiedCode: { [Op.like]: `%${term}%` } },
      ],
    };

    if (isNumeric) {
      const numericTerm = parseInt(term, 10);
      whereCondition[Op.or].push(
        { analysisPeriodFrom: numericTerm },
        { analysisPeriodTo: numericTerm },
        { analysisMonth: numericTerm },
        { inactivityFromYear: numericTerm },
        { inactivityToYear: numericTerm }
      );
    }

    return CmpDormanClientMonthlyDataModel.findAll({
      where: whereCondition,
    });
  },
};
```

**New Code** (with schema-qualified raw queries):
```javascript
// repositories/CmpDormanClientMonthlyDataRepository.js
import { Op } from "sequelize";
import CmpDormanClientMonthlyDataModel from "../models/CmpDormanClientMonthlyDataModel.js";
import { sequelize } from "../config/db.config.js";

// Helper to get schema-qualified table name
const getFullTableName = () => {
  const schema = CmpDormanClientMonthlyDataModel.options.schema || "BACK_OFFICE";
  const tableName = CmpDormanClientMonthlyDataModel.tableName;
  return `"${schema}"."${tableName}"`;
};

export default {
  async findAll(
    where = {},
    order = [
      ["analysisPeriodFrom", "DESC"],
      ["profileId", "ASC"],
    ]
  ) {
    // Build WHERE clause
    const whereClause = Object.keys(where).length > 0
      ? `WHERE ${buildWhereClause(where)}`
      : "";
    
    // Build ORDER BY clause
    const orderClause = order.length > 0
      ? `ORDER BY ${order.map(([col, dir]) => `"${toDbColumn(col)}" ${dir}`).join(", ")}`
      : "";

    const sql = `
      SELECT 
        "PROFILE_ID", "CLIENT_NAME_EN", "UNIFIED_CODE",
        "ANALYSIS_PERIOD_FROM", "ANALYSIS_PERIOD_TO", "ANALYSIS_MONTH",
        "INACTIVITY_FROM_YEAR", "INACTIVITY_TO_YEAR"
      FROM ${getFullTableName()}
      ${whereClause}
      ${orderClause}
    `;

    const [results] = await sequelize.query(sql);
    return results.map(mapToModel);
  },

  async findById(profileId) {
    const sql = `
      SELECT 
        "PROFILE_ID", "CLIENT_NAME_EN", "UNIFIED_CODE",
        "ANALYSIS_PERIOD_FROM", "ANALYSIS_PERIOD_TO", "ANALYSIS_MONTH",
        "INACTIVITY_FROM_YEAR", "INACTIVITY_TO_YEAR"
      FROM ${getFullTableName()}
      WHERE "PROFILE_ID" = :profileId
    `;

    const [results] = await sequelize.query(sql, {
      replacements: { profileId },
    });

    return results.length > 0 ? mapToModel(results[0]) : null;
  },

  async findGte2025() {
    const sql = `
      SELECT 
        "PROFILE_ID", "CLIENT_NAME_EN", "UNIFIED_CODE",
        "ANALYSIS_PERIOD_FROM", "ANALYSIS_PERIOD_TO", "ANALYSIS_MONTH",
        "INACTIVITY_FROM_YEAR", "INACTIVITY_TO_YEAR"
      FROM ${getFullTableName()}
      WHERE "INACTIVITY_TO_YEAR" >= 2025
      ORDER BY "INACTIVITY_TO_YEAR" DESC, "PROFILE_ID" ASC
    `;

    const [results] = await sequelize.query(sql);
    return results.map(mapToModel);
  },

  async searchAll(term) {
    const isNumeric = /^\d+$/.test(term);
    const likeTerm = `%${term}%`;

    let sql = `
      SELECT 
        "PROFILE_ID", "CLIENT_NAME_EN", "UNIFIED_CODE",
        "ANALYSIS_PERIOD_FROM", "ANALYSIS_PERIOD_TO", "ANALYSIS_MONTH",
        "INACTIVITY_FROM_YEAR", "INACTIVITY_TO_YEAR"
      FROM ${getFullTableName()}
      WHERE (
        "PROFILE_ID" LIKE :likeTerm OR
        "CLIENT_NAME_EN" LIKE :likeTerm OR
        "UNIFIED_CODE" LIKE :likeTerm
    `;

    const replacements = { likeTerm };

    if (isNumeric) {
      const numericTerm = parseInt(term, 10);
      sql += `
        OR "ANALYSIS_PERIOD_FROM" = :numericTerm
        OR "ANALYSIS_PERIOD_TO" = :numericTerm
        OR "ANALYSIS_MONTH" = :numericTerm
        OR "INACTIVITY_FROM_YEAR" = :numericTerm
        OR "INACTIVITY_TO_YEAR" = :numericTerm
      `;
      replacements.numericTerm = numericTerm;
    }

    sql += ")";

    const [results] = await sequelize.query(sql, { replacements });
    return results.map(mapToModel);
  },
};

// Helper: Map database column names to model property names
function mapToModel(row) {
  return {
    profileId: row.PROFILE_ID,
    clientNameEn: row.CLIENT_NAME_EN,
    unifiedCode: row.UNIFIED_CODE,
    analysisPeriodFrom: row.ANALYSIS_PERIOD_FROM,
    analysisPeriodTo: row.ANALYSIS_PERIOD_TO,
    analysisMonth: row.ANALYSIS_MONTH,
    inactivityFromYear: row.INACTIVITY_FROM_YEAR,
    inactivityToYear: row.INACTIVITY_TO_YEAR,
  };
}

// Helper: Convert camelCase to DB_COLUMN
function toDbColumn(camelCase) {
  const mapping = {
    profileId: "PROFILE_ID",
    clientNameEn: "CLIENT_NAME_EN",
    unifiedCode: "UNIFIED_CODE",
    analysisPeriodFrom: "ANALYSIS_PERIOD_FROM",
    analysisPeriodTo: "ANALYSIS_PERIOD_TO",
    analysisMonth: "ANALYSIS_MONTH",
    inactivityFromYear: "INACTIVITY_FROM_YEAR",
    inactivityToYear: "INACTIVITY_TO_YEAR",
  };
  return mapping[camelCase] || camelCase.toUpperCase();
}

// Helper: Build WHERE clause from object
function buildWhereClause(where) {
  const conditions = [];
  for (const [key, value] of Object.entries(where)) {
    const dbCol = toDbColumn(key);
    if (typeof value === "object" && value[Op.gte]) {
      conditions.push(`"${dbCol}" >= ${value[Op.gte]}`);
    } else if (typeof value === "object" && value[Op.lte]) {
      conditions.push(`"${dbCol}" <= ${value[Op.lte]}`);
    } else {
      conditions.push(`"${dbCol}" = ${typeof value === "string" ? `'${value}'` : value}`);
    }
  }
  return conditions.join(" AND ");
}
```

---

### Change 2: Alternative - Use Sequelize with Schema Override

If we want to keep using Sequelize ORM but force schema qualification:

#### File: `src/models/CmpDormanClientMonthlyDataModel.js`

**Add a custom query method**:

```javascript
// At the end of the file, after model definition

// Override default query to force schema prefix
CmpDormanClientMonthlyDataModel.addHook('beforeFind', (options) => {
  // Force schema qualification in raw SQL
  if (!options.raw) {
    options.raw = false;
  }
  
  // Store original table name
  const originalTableName = CmpDormanClientMonthlyDataModel.tableName;
  const schema = CmpDormanClientMonthlyDataModel.options.schema;
  
  // Override with schema-qualified name
  CmpDormanClientMonthlyDataModel.tableName = `"${schema}"."${originalTableName}"`;
});

export default CmpDormanClientMonthlyDataModel;
export { CmpDormanClientMonthlyDataModel };
```

**Note**: This approach is experimental and may not work reliably with Sequelize Oracle dialect.

---

## Minimal Safe Fix (RECOMMENDED FOR IMMEDIATE DEPLOYMENT)

### Step 1: Disable DB_SYNC Permanently

#### File: `.env.development`, `.env.test`, `.env.production`

**Add or update**:
```env
# ⚠️ CRITICAL: Never enable this with Oracle schema-qualified models
# Tables should already exist in BACK_OFFICE schema
DB_SYNC=false
```

### Step 2: Drop Duplicate Tables (Database Task)

**Execute as DBA or EDATA_PL user**:
```sql
-- Check if duplicate tables exist in EDATA_PL schema
SELECT TABLE_NAME FROM USER_TABLES 
WHERE TABLE_NAME LIKE 'CMP_DORMAN%' OR TABLE_NAME LIKE 'CMP_EMP%';

-- If tables exist, drop them
DROP TABLE EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA;
DROP TABLE EDATA_PL.CMP_DORMAN_TBL_CLIENT_CONTROL;
DROP TABLE EDATA_PL.CMP_DORMAN_TBL_SUMMARY;
DROP TABLE EDATA_PL.CMP_EMP_TBL_DAILY_ORDERS;

-- Verify tables are gone
SELECT TABLE_NAME FROM USER_TABLES 
WHERE TABLE_NAME LIKE 'CMP%';
-- Should return 0 rows
```

### Step 3: Create Public Synonyms (Database Task)

**Execute as DBA**:
```sql
-- Create synonyms pointing to BACK_OFFICE schema
CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_MONTHLY_DATA 
FOR BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA;

CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_CLIENT_CONTROL 
FOR BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL;

CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_SUMMARY 
FOR BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY;

CREATE PUBLIC SYNONYM CMP_EMP_TBL_DAILY_ORDERS 
FOR BACK_OFFICE.CMP_EMP_TBL_DAILY_ORDERS;

-- Grant privileges to EDATA_PL
GRANT SELECT, INSERT, UPDATE, DELETE ON BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA TO EDATA_PL;
GRANT SELECT, INSERT, UPDATE, DELETE ON BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL TO EDATA_PL;
GRANT SELECT, INSERT, UPDATE, DELETE ON BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY TO EDATA_PL;
GRANT SELECT, INSERT, UPDATE, DELETE ON BACK_OFFICE.CMP_EMP_TBL_DAILY_ORDERS TO EDATA_PL;

-- Verify synonyms
SELECT SYNONYM_NAME, TABLE_OWNER, TABLE_NAME 
FROM ALL_SYNONYMS 
WHERE SYNONYM_NAME LIKE 'CMP%';
```

### Step 4: Add Sync Prevention Safeguard

#### File: `src/models/index.js`

**Current Code** (Lines 23-40):
```javascript
export const syncModels = async () => {
try {
if (process.env.NODE_ENV === "development") {
console.log("🔄 Syncing tables in development mode...");
const models = [
CmpDormanClientControlModel,
CmpDormanClientMonthlyDataModel,
CmpDormanSummaryModel,
CmpEmpDailyOrdersModel,
// ⚠️ الفيو مستبعد من sync
];


for (const model of models) {
console.log(`🔄 Syncing ${model.name}...`);
await model.sync({ force: false, alter: false });
}
}
} catch (err) {
console.error("❌ Error syncing models:", err);
}
};
```

**New Code** (with safeguards):
```javascript
export const syncModels = async () => {
  try {
    // ⚠️ CRITICAL WARNING: Oracle schema sync is unreliable
    // Tables should be created manually in BACK_OFFICE schema
    // This function should NEVER be used in production
    
    if (process.env.DB_SYNC !== "true") {
      console.log("ℹ️  DB_SYNC is disabled - skipping model synchronization");
      return;
    }

    if (process.env.NODE_ENV === "production") {
      console.error("❌ DB_SYNC is not allowed in production environment");
      throw new Error("Model sync is disabled in production for safety");
    }

    // Additional safety check
    const dbUser = process.env.DB_USER;
    if (dbUser !== "BACK_OFFICE") {
      console.warn(
        `⚠️  WARNING: Logged in as ${dbUser}, but tables are defined in BACK_OFFICE schema`
      );
      console.warn(
        `⚠️  Sequelize may create tables in ${dbUser} schema instead of BACK_OFFICE`
      );
      console.warn(`⚠️  Aborting sync to prevent duplicate tables`);
      return;
    }

    console.log("🔄 Syncing tables in development mode...");
    const models = [
      CmpDormanClientControlModel,
      CmpDormanClientMonthlyDataModel,
      CmpDormanSummaryModel,
      CmpEmpDailyOrdersModel,
      // ⚠️ الفيو مستبعد من sync
    ];

    for (const model of models) {
      console.log(`🔄 Syncing ${model.name}...`);
      await model.sync({ force: false, alter: false });
    }
  } catch (err) {
    console.error("❌ Error syncing models:", err);
    throw err; // Re-throw to prevent server start with invalid state
  }
};
```

### Step 5: Add Environment Variable Documentation

#### File: `.env.example`

**Add warning**:
```env
# ⚠️ DATABASE SYNC CONFIGURATION (CRITICAL)
# 
# NEVER set DB_SYNC=true when using Oracle with schema-qualified models
# 
# Reason: Sequelize Oracle dialect may not properly honor the schema
# parameter, resulting in tables being created in the wrong schema.
# 
# Tables should be created manually by DBA in the BACK_OFFICE schema.
# 
# If DB_SYNC=true was previously enabled, you may have duplicate empty
# tables in the EDATA_PL schema. Contact DBA to drop them.
#
DB_SYNC=false

# Oracle Database Connection
# DB_USER should match the login user (e.g., EDATA_PL)
# Tables should exist in BACK_OFFICE schema with proper grants/synonyms
DB_USER=EDATA_PL
DB_PASSWORD=***
DB_HOST=10.1.20.10
DB_PORT=1521
DB_NAME=PDB1
```

---

## Verification Steps

### Step 1: Run Diagnostic Endpoint

```bash
curl http://localhost:3000/api/v1/diagnostics/schema-data | jq
```

**Expected Output**:
```json
{
  "success": true,
  "schemas": {
    "BACK_OFFICE": {
      "rowCount": 1234,
      "recordsGte2025": 567
    },
    "EDATA_PL": {
      "accessible": false,
      "error": "ORA-00942: table or view does not exist"
    }
  }
}
```

**Explanation**:
- ✅ BACK_OFFICE table has data
- ✅ EDATA_PL table does NOT exist (dropped)
- ✅ Queries will resolve via synonym to BACK_OFFICE

### Step 2: Test Endpoint

```bash
curl http://localhost:3000/api/v1/client-monthly-data/gte-2025
```

**Expected Output**:
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PROF001",
      "clientNameEn": "ABC Corporation",
      "unifiedCode": "UC12345",
      "analysisPeriodFrom": 202501,
      "analysisPeriodTo": 202512,
      "analysisMonth": 1,
      "inactivityFromYear": 2024,
      "inactivityToYear": 2025
    },
    // ... more records
  ]
}
```

**Verify**:
- ✅ `data` array is NOT empty
- ✅ Records have `inactivityToYear >= 2025`
- ✅ Multiple records returned

### Step 3: Enable Sequelize Query Logging

#### File: `.env.development`

```env
NODE_ENV=development
```

#### Restart server and check logs

```bash
npm run start:dev
```

**Look for**:
```
[sequelize] Executing (default): SELECT ... FROM "BACK_OFFICE"."CMP_DORMAN_TBL_MONTHLY_DATA" ...
```

**Verify**:
- ✅ Query includes schema prefix: `"BACK_OFFICE".`
- ✅ OR query resolves via synonym correctly

### Step 4: Direct Database Verification

**Connect as EDATA_PL and run**:
```sql
-- Test synonym resolution
SELECT COUNT(*) FROM CMP_DORMAN_TBL_MONTHLY_DATA;
-- Should return: 1234 (same as BACK_OFFICE count)

-- Test >= 2025 filter
SELECT COUNT(*) FROM CMP_DORMAN_TBL_MONTHLY_DATA 
WHERE INACTIVITY_TO_YEAR >= 2025;
-- Should return: 567 (matching API response count)

-- Verify no tables in EDATA_PL
SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME LIKE 'CMP%';
-- Should return: 0 rows

-- Verify synonym exists
SELECT SYNONYM_NAME, TABLE_OWNER, TABLE_NAME 
FROM USER_SYNONYMS 
WHERE SYNONYM_NAME = 'CMP_DORMAN_TBL_MONTHLY_DATA';
-- Should return: 1 row pointing to BACK_OFFICE
```

---

## Rollout Plan

### Phase 1: Immediate Fix (Database-Level) - **30 minutes**

1. **Drop duplicate tables** in EDATA_PL schema
2. **Create public synonyms** pointing to BACK_OFFICE
3. **Verify** with diagnostic endpoint
4. **Test** all read endpoints

**Risk**: Low  
**Impact**: Immediate resolution

### Phase 2: Code Safeguards (Code Changes) - **1 hour**

1. **Update `.env` files** with DB_SYNC=false and warnings
2. **Add sync prevention** logic in `models/index.js`
3. **Deploy** to dev/test environments
4. **Test** server startup and verify logs

**Risk**: Low  
**Impact**: Prevents future occurrences

### Phase 3: Repository Refactor (Optional) - **4-8 hours**

1. **Refactor repositories** to use raw SQL with schema qualification
2. **Unit test** all repository methods
3. **Integration test** all endpoints
4. **Deploy** incrementally

**Risk**: Medium  
**Impact**: Long-term solution, eliminates dependency on Sequelize schema support

---

## Prevention Measures

### 1. Code Review Checklist

Add to PR template:
```markdown
## Database Changes
- [ ] No new `model.sync()` calls added
- [ ] DB_SYNC remains false in all environments
- [ ] Schema qualification verified in queries
- [ ] Migrations use explicit schema names
```

### 2. Environment Variable Validation

#### File: `src/config/db.config.js`

**Add validation after line 29**:
```javascript
// Validate DB_SYNC is not enabled in production
if (process.env.DB_SYNC === "true" && process.env.NODE_ENV === "production") {
  const errorMsg = "DB_SYNC=true is not allowed in production environment";
  logger.error(errorMsg, { service: "sequelize-oracle" });
  throw new Error(errorMsg);
}

// Warn if DB_SYNC is enabled in development
if (process.env.DB_SYNC === "true") {
  logger.warn("⚠️  DB_SYNC=true detected - this may create tables in wrong schema", {
    service: "sequelize-oracle",
    dbUser: process.env.DB_USER,
  });
}
```

### 3. Documentation Updates

#### File: `README.md`

**Add section**:
```markdown
## ⚠️ Oracle Schema Configuration

This application connects to Oracle as `EDATA_PL` user but queries tables in `BACK_OFFICE` schema.

**CRITICAL**: Never set `DB_SYNC=true`. Tables should be created manually in BACK_OFFICE schema by DBA.

**Required Database Setup**:
1. Tables exist in BACK_OFFICE schema
2. Public synonyms created (or explicit schema grants)
3. EDATA_PL user has SELECT, INSERT, UPDATE, DELETE privileges

**Troubleshooting Empty Data**:
If endpoints return empty arrays:
1. Run diagnostic: `GET /api/v1/diagnostics/schema-data`
2. Check for duplicate tables in EDATA_PL schema
3. Verify synonyms: `SELECT * FROM ALL_SYNONYMS WHERE SYNONYM_NAME LIKE 'CMP%'`
```

### 4. Startup Health Check

#### File: `src/app.js`

**Add after testConnection() call (line 90)**:
```javascript
// Verify table accessibility with a simple count query
try {
  const [countResult] = await sequelize.query(
    'SELECT COUNT(*) AS CNT FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA'
  );
  const recordCount = countResult[0].CNT;
  
  if (recordCount === 0) {
    logger.warn("⚠️  Table BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA is empty", {
      service: "startup-check",
    });
  } else {
    logger.info(`✅ Table verification: ${recordCount} records found in BACK_OFFICE schema`, {
      service: "startup-check",
    });
  }
} catch (tableCheckError) {
  logger.error("❌ Unable to query BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA", {
    service: "startup-check",
    error: tableCheckError.message,
    hint: "Check schema access, synonyms, or duplicate tables in EDATA_PL",
  });
  
  if (process.env.NODE_ENV === "production") {
    throw new Error("Critical: Unable to access data tables");
  }
}
```

---

## Summary

### Immediate Actions (Deploy Today)

1. ✅ Drop duplicate tables in EDATA_PL schema (Database)
2. ✅ Create public synonyms (Database)
3. ✅ Set `DB_SYNC=false` in all environments (Config)
4. ✅ Add diagnostic endpoint (Code - already done)
5. ✅ Test and verify all endpoints return data

### Short-term (This Week)

1. ✅ Add sync prevention safeguards in `models/index.js`
2. ✅ Add environment variable validation
3. ✅ Add startup health check
4. ✅ Update documentation

### Long-term (Next Sprint)

1. 🔄 Consider refactoring to raw SQL queries (optional)
2. 🔄 Add unit tests for repositories
3. 🔄 Create database migration scripts

---

## Testing Checklist

After applying fixes:

### Functional Tests
- [ ] GET `/api/v1/client-monthly-data` returns data
- [ ] GET `/api/v1/client-monthly-data/gte-2025` returns filtered data
- [ ] GET `/api/v1/client-monthly-data/year/2025` works
- [ ] GET `/api/v1/client-monthly-data/search?q=test` works
- [ ] GET `/api/v1/client-control` returns data
- [ ] GET `/api/v1/summary` returns data

### Diagnostic Tests
- [ ] GET `/api/v1/diagnostics/schema-data` shows BACK_OFFICE has data
- [ ] Diagnostic endpoint shows EDATA_PL table doesn't exist
- [ ] Sequelize logs show correct schema prefix (or synonym resolution)

### Database Tests
```sql
-- Run these queries as EDATA_PL
SELECT COUNT(*) FROM CMP_DORMAN_TBL_MONTHLY_DATA;  -- Should be > 0
SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME LIKE 'CMP%';  -- Should be 0
SELECT COUNT(*) FROM USER_SYNONYMS WHERE SYNONYM_NAME LIKE 'CMP%';  -- Should be > 0
```

### Environment Tests
- [ ] Server starts without DB_SYNC errors
- [ ] Logs show "DB sync is disabled"
- [ ] Startup health check passes
- [ ] No warnings about wrong schema

---

## Success Criteria

✅ **All endpoints return data** (not empty arrays)  
✅ **No duplicate tables** in EDATA_PL schema  
✅ **Public synonyms** resolve correctly  
✅ **DB_SYNC** disabled permanently  
✅ **Safeguards** prevent future sync issues  
✅ **Documentation** updated  
✅ **Diagnostic tools** available for troubleshooting

---

## Contacts for Help

- **DBA Support**: For creating synonyms and dropping tables
- **Dev Team**: For code changes and testing
- **DevOps**: For environment variable configuration

---

## Related Documentation

- [architecture.md](./architecture.md) - System architecture
- [data-flow-client-monthly-data.md](./data-flow-client-monthly-data.md) - Request flow
- [root-cause-analysis.md](./root-cause-analysis.md) - Problem analysis
