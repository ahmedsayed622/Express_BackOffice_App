# Express BackOffice API

Express API for dormant client reporting, summary views, and employee daily orders with Oracle-backed data access and procedure execution.

## Tech stack
- Node.js + Express
- Sequelize (Oracle ORM)
- node-oracledb (procedures)
- dotenv-flow (env loading)
- express-validator (request validation)
- Winston + Morgan (logging)

## Quick start
```bash
npm install

# Development
npm run start:dev

# Production
npm run start:prod
```

## Security / Authentication
All `/api/v1` endpoints require an API key except `GET /api/v1/health/integrations`.

Quick steps:
```bash
npm install
npm run gen:api-key
npm run start:dev
```

Example request:
```bash
curl -H "X-API-Key: <your-key>" http://localhost:3000/api/v1/client-monthly-data
```

## Environment variables
Copy `.env.example` to the target environment file (for example, `.env.development`) and fill in values.

Key settings:
- `NODE_ENV`
- `APP_PORT`
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`
- `ORACLE_CLIENT_PATH`, `ORACLE_CLIENT_LIB_DIR`
- `ALLOWED_ORIGINS`

## API documentation
- OpenAPI spec: `openapi.yaml`
- Postman collection: `postman/collection.json`
- Postman environment: `postman/environment.json`

## Core endpoints
Base path: `/api/v1`

- Health
  - `GET /health`
  - `GET /api/health`
  - `GET /api/v1/health/integrations`
- Client monthly data
  - `GET /api/v1/client-monthly-data`
  - `GET /api/v1/client-monthly-data/year/:year`
  - `GET /api/v1/client-monthly-data/profile/:profileId`
- Client control
  - `GET /api/v1/client-control`
- Summary
  - `GET /api/v1/summary`
  - `GET /api/v1/summary/latest/:year`
- Summary view
  - `GET /api/v1/summary-view`
- Employee daily orders
  - `GET /api/v1/client-emp-daily-orders`
  - `GET /api/v1/client-emp-daily-orders/profile/:profileId`
- Procedures
  - `POST /api/v1/procedures/dormant-orchestrator?timeout=0`

Note: `GET /api/v1/diagnostics/schema-data` is for non-production diagnostics.

## Project structure
```
src/
  app.js
  server.js
  config/
  controllers/
  middlewares/
  models/
  repositories/
  routes/
  services/
  utils/
  validators/
```

## Testing
```bash
npm test
```

## Utilities
- DB verification: `npm run verify:db`
