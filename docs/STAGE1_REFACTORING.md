# Stage 1 API Refactoring - Client Monthly Data Endpoints

## Overview
Stage 1 refactors GET endpoints for the `client-monthly-data` resource with improved:
- Naming consistency (kebab-case business domain names)
- Query parameter validation and whitelisting
- Pagination policies
- Async error handling

## Refactored Endpoints

### 1. Collection Endpoint (Always Paginated)
**Endpoint:** `GET /v1/client-monthly-data`

**Description:** Retrieves a paginated collection of client monthly data records.

**Pagination Policy:** Always applies pagination. Default limit is 100, max limit is 1000.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | - | Filter by year (1900-2100) |
| `month` | integer | No | - | Filter by month (1-12) |
| `q` | string | No | - | Search term (max 200 chars) - searches across profileId, clientNameEn, unifiedCode, and numeric fields |
| `status` | string | No | - | Filter by status (max 50 chars) |
| `orderBy` | string | No | `analysisPeriodFrom:DESC` | Sort field and direction (e.g., `analysisPeriodFrom:DESC`) |
| `limit` | integer | No | 100 | Number of records per page (1-1000) |
| `offset` | integer | No | 0 | Number of records to skip (>=0) |

**Allowed orderBy Fields:**
- `profileId`
- `analysisPeriodFrom`
- `analysisPeriodTo`
- `analysisMonth`
- `inactivityFromYear`
- `inactivityToYear`
- `clientNameEn`

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "count": 100,
    "total": 15234
  }
}
```

**Example Requests:**
```bash
# Get first page with defaults
GET /v1/client-monthly-data

# Get second page
GET /v1/client-monthly-data?limit=100&offset=100

# Filter by year and month with custom sorting
GET /v1/client-monthly-data?year=2024&month=12&orderBy=clientNameEn:ASC&limit=50

# Search with query term
GET /v1/client-monthly-data?q=ABC123&limit=20
```

---

### 2. Year-Specific Endpoint (Optional Pagination)
**Endpoint:** `GET /v1/client-monthly-data/year/:year`

**Description:** Retrieves all records for a specific year. Returns full dataset by default (~300 rows expected per year). Pagination is optional.

**Pagination Policy:** Optional. If limit/offset are provided, pagination is applied. Otherwise, returns all records for the year.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | integer | Yes | Year to filter (1900-2100) |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `month` | integer | No | - | Filter by month (1-12) |
| `q` | string | No | - | Search term (max 200 chars) |
| `status` | string | No | - | Filter by status (max 50 chars) |
| `orderBy` | string | No | `analysisPeriodFrom:DESC` | Sort field and direction |
| `limit` | integer | No | - | Number of records per page (1-1000) - enables pagination |
| `offset` | integer | No | 0 | Number of records to skip (>=0) |

**Response Format (without pagination):**
```json
{
  "success": true,
  "data": [...]
}
```

**Response Format (with pagination):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 50,
    "total": 287
  }
}
```

**Example Requests:**
```bash
# Get all records for 2024 (no pagination)
GET /v1/client-monthly-data/year/2024

# Get all records for 2024 filtered by month
GET /v1/client-monthly-data/year/2024?month=12

# Get paginated records for 2024
GET /v1/client-monthly-data/year/2024?limit=50&offset=0

# Get paginated and filtered records
GET /v1/client-monthly-data/year/2024?month=6&q=ACME&limit=25&offset=0
```

---

### 3. Profile-Specific Endpoint (Single Record)
**Endpoint:** `GET /v1/client-monthly-data/profile/:profileId`

**Description:** Retrieves a single client monthly data record by profile ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `profileId` | string | Yes | Profile identifier |

**Response Format:**
```json
{
  "success": true,
  "data": {
    "profileId": "12345",
    "clientNameEn": "ACME Corp",
    "unifiedCode": "UC001",
    ...
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "message": "Record with profileId 12345 not found",
    "code": "NOT_FOUND"
  }
}
```

**Example Request:**
```bash
GET /v1/client-monthly-data/profile/12345
```

---

## Validation Rules

### Query Parameter Validation
All query parameters are validated using express-validator with the following rules:

- **year**: Integer between 1900 and 2100
- **month**: Integer between 1 and 12
- **limit**: Integer between 1 and 1000
- **offset**: Non-negative integer (>= 0)
- **q**: String with max length 200 characters, trimmed
- **status**: String with max length 50 characters, trimmed
- **orderBy**: Must be a whitelisted field with optional direction (ASC/DESC)

### Error Response Format
Validation errors return HTTP 400 with details:
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "limit",
        "message": "limit must be an integer between 1 and 1000"
      }
    ]
  }
}
```

---

## Removed Endpoints (Consolidated)

The following endpoints have been removed in favor of the consolidated collection and year endpoints:

- `GET /client-monthly-data/gte-2025` → Use collection with `?year=2025` filter
- `GET /client-monthly-data/search?q=term` → Use collection with `?q=term`
- `GET /client-monthly-data/year/:year/month/:month` → Use `year/:year?month=:month`
- `GET /client-monthly-data/inact-year/:year` → Use collection with filters
- `GET /client-monthly-data/inact-year/:year/month/:month` → Use year endpoint with filters
- `GET /client-monthly-data/:id` → Renamed to `/profile/:profileId` for clarity

---

## Implementation Details

### Architecture
The refactored endpoints follow a clean layered architecture:

1. **Routes Layer** (`src/routes/v1/cmpDormanClientMonthlyData.routes.js`)
   - Defines endpoints
   - Applies validators
   - Maps to controller methods

2. **Validators Layer** (`src/validators/cmpDormanValidators.js`)
   - Validates and sanitizes input
   - Whitelists allowed query parameters
   - Returns validation errors early

3. **Controller Layer** (`src/controllers/CmpDormanClientMonthlyDataController.js`)
   - Builds sanitized filter objects
   - Constructs unified query objects
   - Handles response formatting
   - Uses asyncWrapper for error handling

4. **Service Layer** (`src/services/CmpDormanClientMonthlyDataService.js`)
   - Contains business logic
   - Maps filters to repository format
   - Handles pagination logic

5. **Repository Layer** (`src/repositories/CmpDormanClientMonthlyDataRepository.js`)
   - Data access only
   - Executes Sequelize queries
   - Returns raw data

### Unified Query Object
Controllers build a standardized query object:
```javascript
{
  filters: {
    year?: number,
    month?: number,
    q?: string,
    status?: string
  },
  pagination: {
    limit?: number,
    offset?: number,
    mode: 'always' | 'optional'
  },
  sort: {
    orderBy?: {
      field: string,
      direction: 'ASC' | 'DESC'
    }
  }
}
```

### Security & Safety
- **Query Whitelisting**: Only approved query parameters are accepted
- **SQL Injection Prevention**: All inputs validated and sanitized
- **Order By Protection**: Only whitelisted fields allowed for sorting
- **Input Validation**: Type checking, range validation, and length limits
- **Async Error Handling**: All routes wrapped with asyncWrapper

---

## Testing

### Manual Testing Commands
```bash
# Test collection pagination
curl "http://localhost:3000/v1/client-monthly-data?limit=10"

# Test year endpoint without pagination
curl "http://localhost:3000/v1/client-monthly-data/year/2024"

# Test year endpoint with pagination
curl "http://localhost:3000/v1/client-monthly-data/year/2024?limit=50&offset=0"

# Test profile lookup
curl "http://localhost:3000/v1/client-monthly-data/profile/12345"

# Test validation errors
curl "http://localhost:3000/v1/client-monthly-data?limit=5000"  # Should fail (max 1000)
curl "http://localhost:3000/v1/client-monthly-data?year=1800"  # Should fail (min 1900)
```

---

## Migration Notes

### Breaking Changes
⚠️ **Warning**: The following endpoints have changed or been removed:

1. **Removed**: `GET /client-monthly-data/gte-2025`
   - **Migration**: Use `GET /client-monthly-data?year=2025` (or higher years as needed)

2. **Removed**: `GET /client-monthly-data/search?q=term`
   - **Migration**: Use `GET /client-monthly-data?q=term`

3. **Changed**: `GET /client-monthly-data/:id` → `GET /client-monthly-data/profile/:profileId`
   - **Migration**: Update path to use `/profile/` prefix

4. **Consolidated**: Year/Month combinations
   - **Old**: `GET /client-monthly-data/year/:year/month/:month`
   - **New**: `GET /client-monthly-data/year/:year?month=:month`

### Backward Compatibility
Consider implementing redirects or deprecation warnings if existing clients depend on removed endpoints.

---

## Next Steps (Stage 2 - Out of Scope)

The following improvements are planned for Stage 2:
- Deep internal refactoring (service/repository consolidation)
- POST/PUT/PATCH/DELETE endpoints
- Stored procedure write operations
- Advanced filtering (date ranges, complex queries)
- Response format standardization across all APIs
- OpenAPI/Swagger documentation generation

---

## Summary of Changes

### Files Modified
1. `src/validators/cmpDormanValidators.js` - Added pagination, orderBy, and collection validators
2. `src/routes/v1/cmpDormanClientMonthlyData.routes.js` - Refactored to 3 clean endpoints
3. `src/controllers/CmpDormanClientMonthlyDataController.js` - Implemented unified query handling
4. `src/services/CmpDormanClientMonthlyDataService.js` - Added collection/year methods with pagination
5. `src/repositories/CmpDormanClientMonthlyDataRepository.js` - Added findAndCountAll method

### Files Created
1. `docs/STAGE1_REFACTORING.md` - This documentation

### API Endpoints After Stage 1
```
GET /v1/client-monthly-data                      # Collection (always paginated)
GET /v1/client-monthly-data/year/:year           # Year-specific (optional pagination)
GET /v1/client-monthly-data/profile/:profileId   # Single record lookup
GET /v1/client-control                           # Existing endpoint (unchanged)
GET /v1/summary                                   # Existing endpoint (unchanged)
GET /v1/summary/latest/:year                      # Existing endpoint (unchanged)
GET /v1/summary-view                              # Existing endpoint (unchanged)
GET /v1/client-emp-daily-orders                  # Existing endpoint (unchanged)
GET /v1/client-emp-daily-orders/invoice/:invoiceNo  # Existing endpoint (unchanged)
GET /v1/client-emp-daily-orders/exec/:execId     # Existing endpoint (unchanged)
GET /v1/client-emp-daily-orders/date/:date       # Existing endpoint (unchanged)
```

---

**Stage 1 Refactoring Completed**: ✅
**Date**: January 8, 2026
**Branch**: `refactor/api-routes-v1`
