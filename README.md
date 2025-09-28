# Express BackOffice API - Compliance Module

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Oracle](https://img.shields.io/badge/Database-Oracle-red.svg)](https://www.oracle.com/database/)
[![Express.js](https://img.shields.io/badge/Framework-Express.js-black.svg)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/ORM-Sequelize-blue.svg)](https://sequelize.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Compliance API (CmpDorman\*) service** for managing dormant client data, orchestrating batch procedures, and providing comprehensive reporting endpoints.

## 🏗️ Architecture Overview

### **Hybrid Database Connectivity**

- **🔗 Sequelize ORM**: Standard CRUD operations on tables and views
- **⚡ node-oracledb**: Dedicated procedure execution with optional `DBMS_LOCK` support
- **🛡️ Unified Error Handling**: `ErrorFactory` pattern with centralized error middleware
- **✅ Input Validation**: `express-validator` with custom validation chains

### **Environment Management**

- **📋 Configuration**: `dotenv-flow` for environment-specific settings
- **🌍 Multi-Environment Support**: Development, Test, Production

## 🚀 Quick Start

### **Environment Setup**

```bash
# Copy example environment file
cp .env.example .env.development

# Windows PowerShell
Copy-Item .env.example .env.development

# Edit .env.development with your database settings
```

### **Available Environments**

| Environment | NODE_ENV      | Base URL                   | Server            |
| ----------- | ------------- | -------------------------- | ----------------- |
| Development | `development` | `http://localhost:3000`    | Local machine     |
| Test        | `test`        | `http://YOUR_TEST_SERVER:3000` | Test server       |
| Production  | `production`  | `http://YOUR_PROD_SERVER:3000`  | Production server |

### **Run Commands**

```bash
# Development (reads .env.development)
npm run start:dev

# Test environment (reads .env.test)
npm run start:test

# Production (reads .env.production)
npm run start:prod
```

## 📨 Postman Integration

### **Import Collection**

1. Import `postman/ComplianceAPI.postman_collection.json`
2. Set environment variable `baseUrl`:
   - **Development**: `http://localhost:3000`
   - **Test**: `http://YOUR_TEST_SERVER:3000`
   - **Production**: `http://YOUR_PROD_SERVER:3000`

## 🔧 Environment Configuration

For security reasons, the actual server IPs are not exposed in this documentation. To configure your deployment:

1. Create appropriate `.env.{environment}` files (e.g., `.env.test`, `.env.production`)
2. Replace `YOUR_TEST_SERVER` and `YOUR_PROD_SERVER` with your actual server addresses
3. Example configuration:
   ```bash
   # .env.production
   NODE_ENV=production
   PORT=3000
   DB_HOST=your-db-host
   DB_PORT=1521
   DB_SID=your-db-sid
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   ```

## 🌐 API Endpoints

### **Health Check**

```http
GET /api/v1/health/integrations
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sequelize": { "status": "connected", "pool": { "min": 10, "max": 50 } },
    "oracledb": { "status": "connected", "pool": { "min": 10, "max": 50 } }
  }
}
```

### **Client Monthly Data (CMP_DORMAN_TBL_CLIENT_MONTHLY_DATA)**

#### **List All Data**

```http
GET /api/v1/client-monthly-data
```

#### **Data >= 2025**

```http
GET /api/v1/client-monthly-data/gte-2025
```

**Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "ID": 12345,
      "CLIENT_ID": "C001",
      "DATA_YEAR": 2025,
      "DATA_MONTH": 9,
      "INACTIVITY_TO_YEAR": 2024,
      "INACTIVITY_TO_MONTH": 12
    }
  ]
}
```

#### **Filter by Year**

```http
GET /api/v1/client-monthly-data/year/:year
```

**Example:** `GET /api/v1/client-monthly-data/year/2025`

#### **Filter by Year and Month**

```http
GET /api/v1/client-monthly-data/year/:year/month/:month
```

**Example:** `GET /api/v1/client-monthly-data/year/2025/month/9`

#### **Inactivity Filter**

```http
GET /api/v1/client-monthly-data/inactivity-to-year/:year
GET /api/v1/client-monthly-data/inactivity-to-year/:year/month/:month
```

**Examples:**

- `GET /api/v1/client-monthly-data/inactivity-to-year/2024`
- `GET /api/v1/client-monthly-data/inactivity-to-year/2024/month/12`

#### **Search**

```http
GET /api/v1/client-monthly-data/search?q=term
```

**Example:** `GET /api/v1/client-monthly-data/search?q=C001`

#### **Get by ID**

```http
GET /api/v1/client-monthly-data/:id
```

**Example:** `GET /api/v1/client-monthly-data/12345`

### **Client Control (CMP_DORMAN_TBL_CLIENT_CONTROL)**

```http
GET /api/v1/client-control
```

### **Summary (CMP_DORMAN_TBL_SUMMARY)**

```http
GET /api/v1/summary
GET /api/v1/summary/latest/:year
```

**Example:** `GET /api/v1/summary/latest/2025`

### **Summary View (CMP_DORMAN_VIEW_SUMMARY)**

```http
GET /api/v1/summary-view
```

### **Employee Daily Orders (CMP_EMP_TBL_DAILY_ORDERS)**

#### **List All Orders**

```http
GET /api/v1/client-emp-daily-orders
```

**Query Parameters:** `execId`, `invoiceNo`, `profileId`, `stockId`, `from` (YYYYMMDD), `to` (YYYYMMDD)

#### **Filter by Invoice Number**

```http
GET /api/v1/client-emp-daily-orders/invoice/:invoiceNo
```

**Example:** `GET /api/v1/client-emp-daily-orders/invoice/123456`

#### **Filter by Execution ID**

```http
GET /api/v1/client-emp-daily-orders/exec/:execId
```

**Example:** `GET /api/v1/client-emp-daily-orders/exec/EMP001`

#### **Filter by Exact Date**

```http
GET /api/v1/client-emp-daily-orders/date/:date
```

**Example:** `GET /api/v1/client-emp-daily-orders/date/20250925`

#### **Filter from Date Onwards**

```http
GET /api/v1/client-emp-daily-orders/from/:from
```

**Example:** `GET /api/v1/client-emp-daily-orders/from/20250101`

#### **Filter by Date Range**

```http
GET /api/v1/client-emp-daily-orders/range?from=YYYYMMDD&to=YYYYMMDD
```

**Example:** `GET /api/v1/client-emp-daily-orders/range?from=20250101&to=20251231`

#### **Search Orders**

```http
GET /api/v1/client-emp-daily-orders/search?q=term
```

**Example:** `GET /api/v1/client-emp-daily-orders/search?q=EMP001`

**Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "profileId": 12345,
      "customerNameEn": "ACME Corporation",
      "invoiceDate": 20250925,
      "invoiceNo": 789012,
      "execId": "EMP001",
      "stockId": 67890,
      "qty": 100,
      "secondProfile": 54321
    }
  ]
}
```

### **Procedures (node-oracledb)**

#### **Dormant Orchestrator**

```http
POST /api/v1/procedures/dormant-orchestrator?timeout=0
```

**Success Response:**

```json
{
  "success": true,
  "status": "COMPLETED",
  "code": "OK",
  "message": "Orchestrator completed successfully",
  "driver": "node-oracledb"
}
```

## 🚨 Error Responses

### **Process Already Running (409)**

```json
{
  "success": false,
  "code": "ALREADY_RUNNING",
  "message": "A run is already in progress"
}
```

### **Lock Timeout (423)**

```json
{
  "success": false,
  "code": "TIMEOUT",
  "message": "Could not obtain lock within timeout"
}
```

### **Validation Error (400)**

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed"
}
```

### **Not Found (404)**

```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Resource not found"
}
```

### **Server Error (500)**

```json
{
  "success": false,
  "code": "INTERNAL_ERROR",
  "message": "Internal server error"
}
```

## 📏 Validation Rules

- **year**: 4-digit integer [1900..2100]
- **month**: Integer [1..12]
- **q** (search): String length [1..200]
- **inactivityToYear**: Integer [1900..2100]
- **timeout**: Integer [0..3600] (seconds)

## 🧪 Quick Testing

### **cURL Examples**

```bash
# Health check
curl -X GET "http://localhost:3000/api/v1/health/integrations"

# Get data >= 2025
curl -X GET "http://localhost:3000/api/v1/client-monthly-data/gte-2025"

# Year filter
curl -X GET "http://localhost:3000/api/v1/client-monthly-data/year/2025"

# Search
curl -X GET "http://localhost:3000/api/v1/client-monthly-data/search?q=test"

# Employee daily orders - from date
curl -X GET "http://localhost:3000/api/v1/client-emp-daily-orders/from/20250101"

# Employee daily orders - date range
curl -X GET "http://localhost:3000/api/v1/client-emp-daily-orders/range?from=20250101&to=20251231"

# Employee daily orders - by execution ID
curl -X GET "http://localhost:3000/api/v1/client-emp-daily-orders/exec/EMP123"

# Employee daily orders - search
curl -X GET "http://localhost:3000/api/v1/client-emp-daily-orders/search?q=ACME"

# Run procedure
curl -X POST "http://localhost:3000/api/v1/procedures/dormant-orchestrator?timeout=0"
```

### **Automated Testing Scripts**

#### **Linux/macOS**

```bash
chmod +x scripts/hit_apis_linux.sh
./scripts/hit_apis_linux.sh http://localhost:3000
```

#### **Windows PowerShell**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/hit_apis_windows.ps1 -BaseUrl "http://localhost:3000"
```

## 🏗️ Project Structure

```
src/
├── controllers/           # Request handlers
├── models/               # Sequelize models
├── repositories/         # Data access layer
│   └── procedures/       # Oracle procedure runners
├── services/            # Business logic
├── routes/              # API routing
├── middleware/          # Express middleware
├── utils/              # Shared utilities
│   └── exceptions/     # Custom error classes
├── config/             # Configuration files
└── validators/         # Input validation schemas
```

## 📚 Additional Resources

- **[OpenAPI Specification](docs/openapi.yaml)** - Full API schema
- **[Postman Collection](postman/ComplianceAPI.postman_collection.json)** - Import for testing
- **[Linux Test Script](scripts/hit_apis_linux.sh)** - Bash automation
- **[Windows Test Script](scripts/hit_apis_windows.ps1)** - PowerShell automation

## 🔧 Development

### **Prerequisites**

- Node.js 18+
- Oracle Database access
- npm or yarn

### **Installation**

```bash
git clone <repository>
cd Express_BackOffice_App
npm install
```

### **Environment Configuration**

Create environment-specific files:

- `.env.development` - Local development
- `.env.test` - Testing environment
- `.env.production` - Production deployment

### **Testing**

```bash
# Run all API endpoints
npm test                    # if test script exists
bash scripts/hit_apis_linux.sh
```

## 📝 Contributing

1. Follow existing code patterns
2. Add validation for new endpoints
3. Update API documentation
4. Test with both Sequelize and node-oracledb connections
5. Maintain error handling consistency

## 📄 License

[MIT](LICENSE) - Replace with actual license

---

**🚀 Ready to use!** Import the Postman collection and start testing the API endpoints.
