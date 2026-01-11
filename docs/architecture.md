# Architecture

## Overview
This Express API uses a layered architecture with dual Oracle connectivity:
- Sequelize (ORM) for standard read queries
- node-oracledb for stored procedure execution

Stage 2 review notes: `docs/stage2-review.md`.

## Request Flow (Routes -> DB)
```
HTTP -> Routes -> Controllers -> Services -> Repositories -> Models/DB
```

## Startup Sequence (and Why)
Startup is centralized in `src/server.js` to keep `src/app.js` importable for tests:
1) Load environment once via `src/config/bootstrap.js`
2) Initialize Oracle client (`src/config/oracleClient.js`)
3) Initialize Oracle pool (`src/config/oraclePool.js`)
4) Initialize Sequelize (`src/config/sequelize.js`)
5) Start HTTP server

`src/app.js` only creates and exports the Express app (no listen).

## Database Design (Dual Connectivity)
- Sequelize models map to Oracle tables in the BACK_OFFICE schema.
- Procedures use node-oracledb with the pooled connection for reliability.

## Folder Map
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
```

## Diagnostics
- `GET /api/health`
- `GET /api/health/integrations`
- `GET /health`
- `GET /api/v1/diagnostics/schema-data` (non-production only)
