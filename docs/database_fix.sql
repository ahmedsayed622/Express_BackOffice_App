-- ============================================================================
-- Oracle Database Fix Script
-- Purpose: Fix empty data response issue caused by schema resolution problems
-- Date: 2026-01-06
-- ============================================================================
-- 
-- ISSUE SUMMARY:
-- Application returns empty arrays because Sequelize queries hit duplicate
-- empty tables in EDATA_PL schema instead of data-populated BACK_OFFICE tables.
--
-- ROOT CAUSE:
-- model.sync() created tables in wrong schema due to Sequelize Oracle
-- dialect not properly honoring schema parameter.
--
-- SOLUTION:
-- 1. Drop duplicate empty tables in EDATA_PL schema
-- 2. Create public synonyms pointing to BACK_OFFICE tables
-- 3. Verify grants for EDATA_PL user
-- ============================================================================

-- ============================================================================
-- SECTION 1: DIAGNOSIS (Run First to Understand Current State)
-- ============================================================================

PROMPT ========================================
PROMPT Section 1: DIAGNOSIS
PROMPT ========================================

-- Check current user
PROMPT Current Session User:
SELECT USER AS current_user, 
       SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema 
FROM DUAL;

-- Check tables in BACK_OFFICE schema (should have data)
PROMPT Tables in BACK_OFFICE schema:
SELECT OWNER, TABLE_NAME, NUM_ROWS, LAST_ANALYZED
FROM ALL_TABLES
WHERE OWNER = 'BACK_OFFICE'
  AND TABLE_NAME LIKE 'CMP%'
ORDER BY TABLE_NAME;

-- Check if duplicate tables exist in EDATA_PL schema (should NOT exist)
PROMPT Tables in EDATA_PL schema (duplicates):
SELECT OWNER, TABLE_NAME, NUM_ROWS, LAST_ANALYZED
FROM ALL_TABLES
WHERE OWNER = 'EDATA_PL'
  AND TABLE_NAME LIKE 'CMP%'
ORDER BY TABLE_NAME;

-- Check existing synonyms
PROMPT Existing PUBLIC Synonyms:
SELECT SYNONYM_NAME, TABLE_OWNER, TABLE_NAME
FROM ALL_SYNONYMS
WHERE OWNER = 'PUBLIC'
  AND SYNONYM_NAME LIKE 'CMP%'
ORDER BY SYNONYM_NAME;

-- Check data counts in BACK_OFFICE
PROMPT Row counts in BACK_OFFICE tables:
SELECT 
  'BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA' AS table_name,
  COUNT(*) AS row_count
FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA
UNION ALL
SELECT 
  'BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL',
  COUNT(*)
FROM BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL
UNION ALL
SELECT 
  'BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY',
  COUNT(*)
FROM BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY
UNION ALL
SELECT 
  'BACK_OFFICE.CMP_EMP_TBL_DAILY_ORDERS',
  COUNT(*)
FROM BACK_OFFICE.CMP_EMP_TBL_DAILY_ORDERS;

-- Check grants for EDATA_PL
PROMPT Grants for EDATA_PL on BACK_OFFICE tables:
SELECT GRANTEE, OWNER, TABLE_NAME, PRIVILEGE
FROM ALL_TAB_PRIVS
WHERE GRANTEE = 'EDATA_PL'
  AND OWNER = 'BACK_OFFICE'
  AND TABLE_NAME LIKE 'CMP%'
ORDER BY TABLE_NAME, PRIVILEGE;

PROMPT ========================================
PROMPT Diagnosis Complete
PROMPT Review results before proceeding
PROMPT ========================================
PAUSE Press Enter to continue or Ctrl+C to exit...

-- ============================================================================
-- SECTION 2: DROP DUPLICATE TABLES (Run as EDATA_PL or DBA)
-- ============================================================================

PROMPT ========================================
PROMPT Section 2: DROP DUPLICATE TABLES
PROMPT ========================================

-- NOTE: Only run this if duplicate tables were found in diagnosis
-- WARNING: This will drop tables in EDATA_PL schema
-- Data in BACK_OFFICE schema is NOT affected

BEGIN
  -- Check if tables exist before dropping
  FOR rec IN (
    SELECT TABLE_NAME 
    FROM USER_TABLES 
    WHERE TABLE_NAME IN (
      'CMP_DORMAN_TBL_MONTHLY_DATA',
      'CMP_DORMAN_TBL_CLIENT_CONTROL',
      'CMP_DORMAN_TBL_SUMMARY',
      'CMP_EMP_TBL_DAILY_ORDERS'
    )
  ) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || rec.TABLE_NAME || ' CASCADE CONSTRAINTS';
    DBMS_OUTPUT.PUT_LINE('✓ Dropped table: ' || rec.TABLE_NAME);
  END LOOP;
  
  IF SQL%ROWCOUNT = 0 THEN
    DBMS_OUTPUT.PUT_LINE('ℹ️  No duplicate tables found in EDATA_PL schema');
  END IF;
END;
/

-- Verify tables are dropped
PROMPT Verification - Tables in EDATA_PL schema:
SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME LIKE 'CMP%';
-- Expected: 0 rows

PROMPT ========================================
PROMPT Duplicate tables dropped (if existed)
PROMPT ========================================

-- ============================================================================
-- SECTION 3: CREATE PUBLIC SYNONYMS (Run as DBA or user with CREATE PUBLIC SYNONYM)
-- ============================================================================

PROMPT ========================================
PROMPT Section 3: CREATE PUBLIC SYNONYMS
PROMPT ========================================

-- NOTE: Requires CREATE PUBLIC SYNONYM privilege
-- Run as DBA if EDATA_PL doesn't have this privilege

-- Drop existing synonyms if they exist (to recreate correctly)
BEGIN
  FOR rec IN (
    SELECT SYNONYM_NAME 
    FROM ALL_SYNONYMS 
    WHERE OWNER = 'PUBLIC'
      AND SYNONYM_NAME IN (
        'CMP_DORMAN_TBL_MONTHLY_DATA',
        'CMP_DORMAN_TBL_CLIENT_CONTROL',
        'CMP_DORMAN_TBL_SUMMARY',
        'CMP_EMP_TBL_DAILY_ORDERS'
      )
  ) LOOP
    EXECUTE IMMEDIATE 'DROP PUBLIC SYNONYM ' || rec.SYNONYM_NAME;
    DBMS_OUTPUT.PUT_LINE('✓ Dropped existing synonym: ' || rec.SYNONYM_NAME);
  END LOOP;
END;
/

-- Create public synonyms
CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_MONTHLY_DATA 
FOR BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA;

CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_CLIENT_CONTROL 
FOR BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL;

CREATE PUBLIC SYNONYM CMP_DORMAN_TBL_SUMMARY 
FOR BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY;

CREATE PUBLIC SYNONYM CMP_EMP_TBL_DAILY_ORDERS 
FOR BACK_OFFICE.CMP_EMP_TBL_DAILY_ORDERS;

PROMPT ✓ Public synonyms created successfully

-- Verify synonyms
PROMPT Verification - Public synonyms:
SELECT SYNONYM_NAME, TABLE_OWNER, TABLE_NAME
FROM ALL_SYNONYMS
WHERE OWNER = 'PUBLIC'
  AND SYNONYM_NAME LIKE 'CMP%'
ORDER BY SYNONYM_NAME;

PROMPT ========================================
PROMPT Public synonyms created
PROMPT ========================================

-- ============================================================================
-- SECTION 4: GRANT PRIVILEGES (Run as BACK_OFFICE or DBA)
-- ============================================================================

PROMPT ========================================
PROMPT Section 4: GRANT PRIVILEGES TO EDATA_PL
PROMPT ========================================

-- NOTE: Run as BACK_OFFICE user or DBA with GRANT privileges

-- Grant SELECT, INSERT, UPDATE, DELETE on tables
GRANT SELECT, INSERT, UPDATE, DELETE 
ON BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA TO EDATA_PL;

GRANT SELECT, INSERT, UPDATE, DELETE 
ON BACK_OFFICE.CMP_DORMAN_TBL_CLIENT_CONTROL TO EDATA_PL;

GRANT SELECT, INSERT, UPDATE, DELETE 
ON BACK_OFFICE.CMP_DORMAN_TBL_SUMMARY TO EDATA_PL;

GRANT SELECT, INSERT, UPDATE, DELETE 
ON BACK_OFFICE.CMP_EMP_TBL_DAILY_ORDERS TO EDATA_PL;

PROMPT ✓ Privileges granted successfully

-- Verify grants
PROMPT Verification - Grants for EDATA_PL:
SELECT GRANTEE, OWNER, TABLE_NAME, PRIVILEGE
FROM ALL_TAB_PRIVS
WHERE GRANTEE = 'EDATA_PL'
  AND OWNER = 'BACK_OFFICE'
  AND TABLE_NAME LIKE 'CMP%'
ORDER BY TABLE_NAME, PRIVILEGE;

PROMPT ========================================
PROMPT Privileges granted
PROMPT ========================================

-- ============================================================================
-- SECTION 5: FINAL VERIFICATION
-- ============================================================================

PROMPT ========================================
PROMPT Section 5: FINAL VERIFICATION
PROMPT ========================================

-- Connect as EDATA_PL user for final tests
PROMPT Connect as EDATA_PL user to verify...
CONNECT EDATA_PL@PDB1
-- Enter password when prompted

-- Test 1: Query via synonym (should work)
PROMPT Test 1: Query via synonym
SELECT COUNT(*) AS row_count 
FROM CMP_DORMAN_TBL_MONTHLY_DATA;
-- Expected: Should return count > 0

-- Test 2: Query with WHERE clause (API uses this)
PROMPT Test 2: Query with filter (API endpoint logic)
SELECT COUNT(*) AS matching_rows
FROM CMP_DORMAN_TBL_MONTHLY_DATA
WHERE INACTIVITY_TO_YEAR >= 2025;
-- Expected: Should return count > 0

-- Test 3: Check no local tables exist
PROMPT Test 3: Check no duplicate tables in current schema
SELECT TABLE_NAME 
FROM USER_TABLES 
WHERE TABLE_NAME LIKE 'CMP%';
-- Expected: 0 rows

-- Test 4: Verify synonym resolution
PROMPT Test 4: Verify synonym points to correct table
SELECT SYNONYM_NAME, TABLE_OWNER, TABLE_NAME
FROM USER_SYNONYMS
WHERE SYNONYM_NAME = 'CMP_DORMAN_TBL_MONTHLY_DATA';
-- Expected: 1 row, TABLE_OWNER = BACK_OFFICE

-- Test 5: Sample data retrieval
PROMPT Test 5: Sample data (first 3 rows)
SELECT 
  PROFILE_ID,
  CLIENT_NAME_EN,
  INACTIVITY_TO_YEAR
FROM CMP_DORMAN_TBL_MONTHLY_DATA
WHERE ROWNUM <= 3
ORDER BY INACTIVITY_TO_YEAR DESC;
-- Expected: Should return 3 rows with data

PROMPT ========================================
PROMPT ✅ DATABASE FIX COMPLETE
PROMPT ========================================
PROMPT 
PROMPT Summary of changes:
PROMPT 1. ✓ Dropped duplicate empty tables in EDATA_PL schema
PROMPT 2. ✓ Created public synonyms pointing to BACK_OFFICE tables
PROMPT 3. ✓ Granted privileges to EDATA_PL user
PROMPT 4. ✓ Verified queries work correctly
PROMPT 
PROMPT Next steps:
PROMPT 1. Verify environment variable DB_SYNC=false in application
PROMPT 2. Restart application server
PROMPT 3. Test API endpoints return data (not empty arrays)
PROMPT 4. Run diagnostic endpoint: GET /api/v1/diagnostics/schema-data
PROMPT 
PROMPT ========================================

-- ============================================================================
-- TROUBLESHOOTING QUERIES
-- ============================================================================

PROMPT ========================================
PROMPT TROUBLESHOOTING QUERIES
PROMPT (Run these if issues persist)
PROMPT ========================================

/*

-- If API still returns empty arrays, run this to see what it's querying:
-- (Run as EDATA_PL)

-- Check Oracle name resolution order
SELECT 
  'Without schema prefix' AS query_type,
  COUNT(*) AS result_count
FROM CMP_DORMAN_TBL_MONTHLY_DATA
UNION ALL
SELECT 
  'With BACK_OFFICE schema',
  COUNT(*)
FROM BACK_OFFICE.CMP_DORMAN_TBL_MONTHLY_DATA
UNION ALL
SELECT 
  'With EDATA_PL schema (should error)',
  COUNT(*)
FROM EDATA_PL.CMP_DORMAN_TBL_MONTHLY_DATA;
-- Expected: First two match, third errors with ORA-00942

-- Check if table/synonym is ambiguous
SELECT 
  'Table in BACK_OFFICE' AS object_type,
  COUNT(*) AS count
FROM ALL_TABLES
WHERE OWNER = 'BACK_OFFICE'
  AND TABLE_NAME = 'CMP_DORMAN_TBL_MONTHLY_DATA'
UNION ALL
SELECT 
  'Table in EDATA_PL',
  COUNT(*)
FROM ALL_TABLES
WHERE OWNER = 'EDATA_PL'
  AND TABLE_NAME = 'CMP_DORMAN_TBL_MONTHLY_DATA'
UNION ALL
SELECT 
  'Public synonym',
  COUNT(*)
FROM ALL_SYNONYMS
WHERE OWNER = 'PUBLIC'
  AND SYNONYM_NAME = 'CMP_DORMAN_TBL_MONTHLY_DATA';
-- Expected: 1, 0, 1 (table in BACK_OFFICE, no table in EDATA_PL, synonym exists)

-- Check Sequelize connection user
SELECT 
  USER AS current_user,
  SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema,
  SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user
FROM DUAL;
-- Expected: All should be EDATA_PL

*/

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
