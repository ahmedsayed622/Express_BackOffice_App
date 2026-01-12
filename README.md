# Express BackOffice API

Express API for dormant client reporting, summary views, employee daily orders, and Oracle procedure execution.

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
npm run start:dev
```

## Authentication
All `/api/v1` endpoints require an API key except `GET /api/v1/health/integrations`.
Provide the key with the `X-API-Key` header:
```bash
curl -H "X-API-Key: <your-key>" http://localhost:3000/api/v1/client-monthly-data
```
Set `API_KEY` in your environment or generate one (see `docs/SECURITY.md`).

## Environment
This project uses `dotenv-flow`. The runtime reads `.env` plus the environment file:
- `start:dev` -> `.env` + `.env.development`
- `start:prod` -> `.env` + `.env.production`

See `.env.example` for the template.

## Docs
- OpenAPI spec: `openapi.yaml`
- Postman collection: `postman/collection.json`
- Postman environment: `postman/environment.json`
- Architecture: `docs/architecture.md`
- Security: `docs/SECURITY.md`

## Endpoint groups
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
