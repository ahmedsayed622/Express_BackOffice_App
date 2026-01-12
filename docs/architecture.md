# Architecture

## System overview
This service exposes a versioned REST API backed by Oracle. It uses a layered architecture with explicit module boundaries:

```
HTTP -> Routes -> Controllers -> Services -> Repositories -> Models/DB
```

## Layers and responsibilities
- Routes: HTTP wiring, validation order, asyncWrapper usage.
- Controllers: request shaping and response formatting.
- Services: orchestration and business logic.
- Repositories: data access with Sequelize or procedure runners.
- Models: Sequelize table/view mappings.

## Config strategy
- Environment is loaded once via `dotenv-flow` in `src/config/bootstrap.js`.
- `ENV` is the single source of truth for config values.
- Access config through `src/config/index.js`.

## Database access strategy
- Sequelize: tables and views (read/query-heavy paths).
- node-oracledb: stored procedures (orchestrator and long-running ops).
- Use Sequelize for standard reads; use oracledb when a procedure is required or must run inside Oracle packages.

## Validation and error handling
- Validation uses `express-validator`.
- Order: validators -> `validateRequest` -> controller.
- Errors are normalized by `errorMiddleware` with shape:
  `{ success: false, code, message, timestamp, requestId? }`

## Logging
- `winston` logger via `src/utils/index.js`.
- `morgan` for HTTP access logs.
- Never log secrets.

## Authentication
- API key required for all `/api/v1` endpoints except `GET /api/v1/health/integrations`.
- Provide the key in `X-API-Key` header (or `Authorization: Bearer <key>`).
- Configure via `ENV.API_KEY` (set in `.env`).
- Rotate by running `npm run gen:api-key` and updating clients.
- Do not commit `.env` and do not log secrets.
- For APEX integrations, set `X-API-Key` on outgoing requests.

## Routing conventions
- `/api/v1` is the primary API base path.
- Path parameters for single keys (for example, `year/:year` or `profile/:profileId`).
- Query parameters for filters, search, and pagination.
- asyncWrapper is used only in routes and exactly once per handler.

## Pagination and Query Parameter Policy

### Pagination rules
CmpDormanClientMonthlyData:
- `/client-monthly-data`
  -> Pagination ALWAYS (limit and offset applied; defaults used when missing)
- `/client-monthly-data/year/:year`
  -> Pagination OPTIONAL
- `/client-monthly-data/profile/:profileId`
  -> Not paginated (single record)

CmpEmpDailyOrders:
- `/client-emp-daily-orders`
  -> Pagination OPTIONAL
- `/client-emp-daily-orders/profile/:profileId`
  -> Pagination OPTIONAL

### Default behavior
- If `limit`/`offset` are not provided, the endpoint returns all rows and omits the `pagination` block.
- `/client-monthly-data` always returns a `pagination` block (defaults apply).

### Response shape
- With pagination: `{ success, data, pagination }`
- Without pagination: `{ success, data }`

### Date filters
- `date=YYYYMMDD` (exact)
- `from=YYYYMMDD&to=YYYYMMDD` (range)
- Provide either `date` or `from/to`. If both are sent, `date` takes precedence.

### Examples
- `GET /api/v1/client-monthly-data?year=2024&month=1&limit=50&offset=0`
- `GET /api/v1/client-monthly-data/year/2024`
- `GET /api/v1/client-monthly-data/profile/123`
- `GET /api/v1/client-emp-daily-orders?date=20260111`
- `GET /api/v1/client-emp-daily-orders/profile/123?from=20260101&to=20260111&q=ahmed`
