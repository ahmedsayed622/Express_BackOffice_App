# Express BackOffice API - Docs

## Quick Start
```bash
npm install
npm run start:dev
```

Production:
```bash
npm run start:prod
```

## Required Environment Variables
Minimum required to boot:
```env
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=        # or DB_SERVICE_NAME / DB_SERVICE
```

Recommended:
```env
APP_PORT=3000
SERVER_HOST=0.0.0.0
ALLOWED_ORIGINS=http://localhost:3000
DB_SYNC=false
```

## Oracle Client Notes
- Thick mode uses `ORACLE_CLIENT_PATH` (if unset, the app attempts default client initialization).
- `ORACLE_CLIENT_LIB_DIR` is logged in startup diagnostics and may be set by ops scripts.

## Scripts
```bash
npm run start
npm run start:dev
npm run start:prod
npm run start:test
npm run verify:db
```

## Postman
Import:
- `postman/BackOffice-API.postman_collection.json`
- `postman/BackOffice-API.postman_environment.json`

Set `baseUrl` to your server (default: `http://localhost:3000`).

## Health & Verification
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/integrations
```

## Stage 1 Endpoints (GET)
```bash
curl http://localhost:3000/api/v1/client-monthly-data
curl http://localhost:3000/api/v1/client-monthly-data/year/2025
curl http://localhost:3000/api/v1/client-control
curl http://localhost:3000/api/v1/summary
curl http://localhost:3000/api/v1/summary-view
curl http://localhost:3000/api/v1/client-emp-daily-orders
```
