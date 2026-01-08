# Oracle Schema Configuration - CRITICAL SETUP GUIDE

## Overview

This application connects to Oracle Database as user `EDATA_PL` but queries tables in the `BACK_OFFICE` schema. Proper configuration is **CRITICAL** to avoid empty data responses.

---

## Required Database Setup

### 1. Tables Must Exist in BACK_OFFICE Schema

All application tables should be created in the `BACK_OFFICE` schema by DBA:

```sql
-- Tables (created by DBA in BACK_OFFICE schema)
BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA
BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL
BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY
BACK_OFFICE.CMP_EMP_TBL_DAILY_ORDERS

-- Views
EDATA_PL.CMP_DORMAN_VIEW_SUMMARY
```

### 2. Grant Privileges to EDATA_PL User

```sql
-- Run as DBA or BACK_OFFICE user
GRANT SELECT, INSERT, UPDATE, DELETE ON BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA TO EDATA_PL;
GRANT SELECT, INSERT, UPDATE, DELETE ON BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL TO EDATA_PL;
GRANT SELECT, INSERT, UPDATE, DELETE ON BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY TO EDATA_PL;
GRANT SELECT, INSERT, UPDATE, DELETE ON BACK_OFFICE.CMP_EMP_TBL_DAILY_ORDERS TO EDATA_PL;
```

### 3. Create Public Synonyms (RECOMMENDED)

This allows unqualified table names to resolve correctly:

```sql
-- Run as DBA
CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_MONTHLY_DATA 
FOR BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA;

CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_CLIENT_CONTROL 
FOR BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL;

CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_SUMMARY 
FOR BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY;

CREATE PUBLIC SYNONYM CMP_EMP_TBL_DAILY_ORDERS 
FOR BACK_OFFICE.CMP_EMP_TBL_DAILY_ORDERS;
```

---

## Environment Configuration

### Required Variables

```env
# Never enable this with Oracle!
DB_SYNC=false

# Connection user (who logs in)
DB_USER=EDATA_PL
DB_PASSWORD=***

# Connection details
DB_HOST=10.1.20.10
DB_PORT=1521
DB_NAME=PDB1              # Service name, not SID

# Oracle Client (optional)
ORACLE_CLIENT_PATH=C:\\oracle\\instantclient_21_3
```

---

## ⚠️ Common Issue: Empty Data Responses

### Symptoms

- API returns HTTP 200 ✅
- Database connection succeeds ✅
- Response body: `{ "success": true, "data": [] }` ❌

### Root Cause

**Sequelize is querying an empty table in EDATA_PL schema instead of the data-populated table in BACK_OFFICE schema.**

This happens when:
1. `DB_SYNC=true` was enabled (even once)
2. Sequelize created duplicate tables in `EDATA_PL` schema
3. Queries resolve to these empty tables instead of `BACK_OFFICE` tables

### Diagnosis

Run the diagnostic endpoint:

```bash
curl http://localhost:3000/api/v1/diagnostics/schema-data
```

**Look for**:
- ✅ `schemas.BACK_OFFICE.rowCount` > 0 (has data)
- ❌ `schemas.EDATA_PL.rowCount` = 0 (empty duplicate)

### Fix

#### Step 1: Drop Duplicate Tables

Connect as `EDATA_PL` user and run:

```sql
-- Check for duplicate tables
SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME LIKE 'CMP%';

-- Drop duplicate tables if they exist
DROP TABLE EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA;
DROP TABLE EDATA_PL.CMP_DORMAN_TBL_CLIENT_CONTROL;
DROP TABLE EDATA_PL.CMP_DORMAN_TBL_SUMMARY;
DROP TABLE EDATA_PL.CMP_EMP_TBL_DAILY_ORDERS;
```

#### Step 2: Create Synonyms (if not exist)

See "Create Public Synonyms" section above.

#### Step 3: Verify Configuration

```env
DB_SYNC=false
```

#### Step 4: Restart Application

```bash
npm run start:dev
```

**Check logs for**:
```
✅ Table verification: 1234 records found in BACK_OFFICE schema
```

#### Step 5: Test Endpoint

```bash
curl http://localhost:3000/api/v1/client-monthly-data/gte-2025
```

Should return data, not empty array.

---

## Verification Queries

### Check Table Locations

```sql
-- As EDATA_PL user

-- Check BACK_OFFICE tables (should have data)
SELECT COUNT(*) FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA;

-- Check if duplicate tables exist in EDATA_PL (should NOT exist)
SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME LIKE 'CMP%';
-- Expected: 0 rows

-- Check synonyms
SELECT SYNONYM_NAME, TABLE_OWNER, TABLE_NAME 
FROM ALL_SYNONYMS 
WHERE SYNONYM_NAME LIKE 'CMP%';
-- Expected: Multiple rows pointing to BACK_OFFICE
```

### Test Query Resolution

```sql
-- This query should resolve via synonym to BACK_OFFICE
SELECT COUNT(*) FROM CMP_DORMAN_TBL_MONTHLY_DATA;
-- Should match count in BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA

-- Test specific query from API
SELECT COUNT(*) FROM CMP_DORMAN_TBL_MONTHLY_DATA 
WHERE INACTIVITY_TO_YEAR >= 2025;
-- Should match API response count
```

---

## Why DB_SYNC is Dangerous with Oracle

### The Problem

Sequelize's `model.sync()` attempts to create tables based on model definitions:

```javascript
sequelize.define("Model", { columns }, {
  tableName: "CMP_DORMAN_TBL_MONTHLY_DATA",
  schema: "BACK_OFFICE",  // ← Should create in BACK_OFFICE
});
```

**Expected behavior**:
```sql
CREATE TABLE "BACK_OFFICE"."CMP_DORMAN_TBL_MONTHLY_DATA" (...)
```

**Actual behavior with Sequelize Oracle**:
```sql
CREATE TABLE "EDATA_PL"."CMP_DORMAN_TBL_MONTHLY_DATA" (...)
-- Created in logged-in user's schema, not BACK_OFFICE!
```

### The Result

1. Empty table created: `EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA` (0 rows)
2. Data exists in: `BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA` (1000+ rows)
3. Queries without schema prefix resolve to `EDATA_PL` first
4. Application returns empty arrays despite data existing

---

## Prevention

### Code Safeguards (Already Implemented)

✅ `DB_SYNC` validation prevents production sync  
✅ Schema mismatch detection logs warnings  
✅ Startup health check verifies table access  
✅ Diagnostic endpoint for troubleshooting

### Developer Checklist

- [ ] Never set `DB_SYNC=true` in any environment
- [ ] Verify `.env` files have `DB_SYNC=false`
- [ ] Check startup logs for table verification messages
- [ ] Run diagnostic endpoint after deployment
- [ ] Test endpoints return data, not empty arrays

---

## Troubleshooting

### Issue: Endpoints Return Empty Arrays

**Check**:
1. Run diagnostic: `GET /api/v1/diagnostics/schema-data`
2. Look for duplicate tables in EDATA_PL schema
3. Verify synonyms exist and point to BACK_OFFICE
4. Check Sequelize query logs (enable with `NODE_ENV=development`)

**Fix**: Follow "Fix" section above

### Issue: ORA-00942 Table Does Not Exist

**Cause**: No synonym and no explicit schema qualification

**Fix**: Create public synonyms (DBA task)

### Issue: ORA-01031 Insufficient Privileges

**Cause**: EDATA_PL lacks SELECT/INSERT/UPDATE/DELETE on BACK_OFFICE tables

**Fix**: Grant privileges (see setup section)

---

## References

- **[architecture.md](./architecture.md)** - Application structure
- **[data-flow-client-monthly-data.md](./data-flow-client-monthly-data.md)** - Request flow analysis
- **[root-cause-analysis.md](./root-cause-analysis.md)** - Detailed investigation
- **[fix-plan.md](./fix-plan.md)** - Complete fix implementation

---

## Contact

For database setup issues, contact:
- **DBA Team**: For synonym creation, grants, and schema management
- **DevOps Team**: For environment configuration
- **Development Team**: For application-level troubleshooting
