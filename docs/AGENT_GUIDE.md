# Express_BackOffice_App — Architecture Whitepaper (Agent Reference)
> **Branch baseline:** `refactor/api-routes-v1`  
> **Purpose:** This document is the single source of truth for **project architecture + rules**.  
> Any agent (Codex/Copilot/LLM) must read and follow this before making changes.

---

## 1) Core Goals
1. **Stability first:** No behavior changes unless fixing a confirmed bug.
2. **Predictable structure:** Clear separation of layers (routes → controllers → services → repositories → models).
3. **Safe Oracle usage:** Avoid accidental table creation in wrong schema.
4. **Consistent errors & validation:** Unified error format + centralized validators.
5. **Agent-friendly:** Any new code must follow these rules to prevent architecture drift.

---

## 2) System Overview

### 2.1 Layers (Request Flow)
**HTTP Request**
→ `routes` (mount paths, attach validators)
→ `middlewares` (validation, auth if exists, etc.)
→ `controllers` (parse request, build query object, call service, format response)
→ `services` (business logic, filter/sort/pagination policy, orchestration)
→ `repositories` (DB access, queries, procedures)
→ `models` (Sequelize models for tables/views)
→ **Response** (JSON with `success`, `data`, optional `pagination`)

### 2.2 Dual DB Access Strategy
We use **two** Oracle access paths:
- **Sequelize (ORM)** for tables/views CRUD & queries (convenient + injection-safe patterns).
- **oracledb pool** for **procedures/packages** or performance-critical low-level calls.

---

## 3) Project Structure (High Level)

```
src/
  app.js
  server.js
  config/
    bootstrap.js
    index.js
    sequelize.js
    oracleClient.js
    oraclePool.js
    cors.js (if present)
  routes/
    v1/
      index.js
      *.routes.js
  controllers/
    index.js
    *.js
  services/
    index.js
    *.js
  repositories/
    index.js
    procedures/
      index.js
  models/
    index.js
    *.js
  middlewares/
    index.js
    errorMiddleware.js
    validateRequest.js (if present)
  validators/
    index.js
    common.js
    *.js
  utils/
    index.js
    async/
    errors/
    http/
    logging/
    paths/
docs/
scripts/
openapi.yaml (root)
```

---

## 4) Critical Import Rules (Non‑Negotiable)

### 4.1 Cross-module communication MUST go through each module’s `index.js`
**Allowed (Correct):**
- `import { SomethingController } from "../controllers/index.js"`
- `import { SomeService } from "../services/index.js"`
- `import { ErrorFactory, asyncWrapper, logger } from "../utils/index.js"`
- `import { ENV, initOraclePool } from "../config/index.js"`
- `import { validateRequest } from "../middlewares/index.js"`
- `import { someValidator } from "../validators/index.js"`

**Not allowed (Wrong):**
- Deep imports across modules, e.g.  
  `import logger from "../utils/logging/logger.js"` (WRONG across modules)
- Cross-module direct file import bypassing index.

### 4.2 Exceptions
1. **Models are the only exception:**  
   Any module may import a model directly if needed (but prefer repository/service using models).  
2. **Inside the same module folder** (e.g., `controllers/`):  
   files may import each other directly **without index**.

> If an agent changes imports, it MUST preserve these rules.

---

## 5) API & Routing Rules

### 5.1 Versioning & Mounting
- v1 router lives in `src/routes/v1/index.js`
- Mounted under `/api/v1/...` (as configured in `app.js`)

### 5.2 Endpoint Policy Example (Client Monthly Data)
- **Collection**: `GET /api/v1/client-monthly-data`
  - **Always paginated**
  - Accepts query filters: `year`, `month`, `q`, `status`, `orderBy`, `limit`, `offset`
- **Year path**: `GET /api/v1/client-monthly-data/year/:year`
  - Must keep **year as path param**
  - May accept query: `month`, `q`, `status`, `orderBy`
  - **No pagination by default** (do not introduce pagination unless already implemented and required)
- **Single record**: `GET /api/v1/client-monthly-data/profile/:profileId`

> Agents must not remove/rename routes or change behavior.

---

## 6) Validation Rules (express-validator)

### 6.1 Where validation runs
- Validation is defined in `src/validators/**`
- Routes attach validators first, then `validateRequest` middleware.

### 6.2 Design rules
- Use **whitelisting**:
  - Validate only allowed query params; ignore unknown params (or reject if policy says so).
- Convert types in validators:
  - `toInt()` where needed (year/month/limit/offset).
- Keep validator naming consistent:
  - `yearParam`, `monthQuery`, `paginationQuery`, `searchQuery`, `orderByQuery`, etc.

### 6.3 `orderBy` security
- Must restrict sortable fields to a whitelist (prevents SQL injection via ORM ordering).

---

## 7) Exception & Error Handling

### 7.1 Error contract (Response Shape)
All errors should return:
```json
{
  "success": false,
  "code": "SOME_ERROR_CODE",
  "message": "Human readable message",
  "timestamp": "ISO-8601"
}
```

### 7.2 Error creation
Use `ErrorFactory` from `src/utils/errors/errorFactory.js` (exported via `src/utils/index.js`).
Examples:
- `ErrorFactory.notFound("...")`
- `ErrorFactory.badRequest("...")`
- `ErrorFactory.validation("...", data)`

### 7.3 Error middleware
- `src/middlewares/errorMiddleware.js` is the single place for mapping:
  - App errors
  - Sequelize validation/unique errors
  - Oracle errors (`errorNum`, `number`)
- Avoid leaking secrets or stack traces in production.

### 7.4 async error propagation
- Use `asyncWrapper` consistently (either wrap controllers or routes — **never double wrap**).
- Agents must check for “double wrapping” as it can cause confusing stack traces.

---

## 8) Logging Rules (Winston)

### 8.1 Use `logger` for runtime code
- In `src/**`: **NO `console.log`** (except extremely early bootstrap if unavoidable).
- Use:
  - `logger.info(...)`
  - `logger.warn(...)`
  - `logger.error(...)`
  - `logger.debug(...)` (dev only)

### 8.2 Log message encoding
- All log strings must be clean UTF‑8 and ideally ASCII.
- **No mojibake / garbled symbols** (e.g., `ƒ??`, `ñ???`, `Г...`).
- Keep logs short, descriptive, and structured:
  - `logger.error("Oracle pool init failed", { service:"oracle-pool", error: err.message })`

---

## 9) Configuration & Environment

### 9.1 Environment loading
- Environment is loaded via `dotenv-flow` in `src/config/bootstrap.js`.
- `ENV` is exported and treated as read-only (`Object.freeze`).

### 9.2 Required env vars (must be enforced)
- DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
- DB_NAME / DB_SERVICE_NAME / DB_SERVICE (one of them)

### 9.3 Security requirements
- Never log:
  - DB_PASSWORD
  - JWT_SECRET
  - SESSION_SECRET
- `.env.example` must contain placeholders only.

---

## 10) Oracle + Sequelize Connection Rules

### 10.1 Oracle Thick client init
- `initOracleClientOnce()` ensures single init and safe fallback.
- Must not throw if already initialized.

### 10.2 Oracle pool
- `initOraclePool()` creates a single global pool.
- `getOraclePool()` returns the pool.
- `closeOraclePool()` closes gracefully.

### 10.3 Sequelize
- `getSequelize()` returns singleton Sequelize instance.
- `initSequelize()` authenticates and logs connectivity.
- `closeSequelize()` closes connection.

### 10.4 Oracle schema safety (DB_SYNC)
- DB_SYNC is **dangerous** with Oracle schemas.
- If `DB_SYNC=true`:
  - never allow in production
  - avoid creating tables in wrong schema
- Prefer manual table creation in `BACK_OFFICE` schema.

---

## 11) Repositories & Models Rules

### 11.1 Repositories
- Repositories are the only layer that talks directly to DB (Sequelize/oracledb).
- Services call repositories. Controllers call services.

### 11.2 Models
- Models can represent tables or views.
- If a model is a view, ensure:
  - `tableName` is set correctly
  - `timestamps` disabled if view does not support
- Model imports may be direct (exception to index rule).

---

## 12) OpenAPI (Contract Source)
- Root `openapi.yaml` must be present and updated with any API changes.
- Must reflect actual paths, query params, and response shapes.
- Diagnostic endpoints must be marked “disabled in production”.

---

## 13) Agent Checklist Before Any Change
1. Read this document.
2. Confirm no import rule violations introduced.
3. Confirm no behavior change unless explicitly requested or bug fix.
4. Confirm validation + error shapes remain consistent.
5. Confirm no secrets added to repo.
6. Update `openapi.yaml` if endpoints are added/changed.
7. Add/update tests if possible.

---

## 14) Do / Don’t Summary

### DO
- Use index imports across modules.
- Keep controllers thin; push logic to services.
- Use repositories for DB access.
- Use `ErrorFactory` and centralized error middleware.
- Use `logger` for runtime code.

### DON’T
- Don’t add tracked binary files (zip, oneDrive exports).
- Don’t add console.log in `src/**`.
- Don’t bypass module indexes for imports (except models).
- Don’t enable DB_SYNC in production.
- Don’t change year path endpoint pagination default.

---

## 15) If You Must Break a Rule
Only allowed if:
- There is a confirmed bug/security issue
- You document the reason in the PR/commit message
- You update this whitepaper accordingly

---

**Document Owner:** Ahmed  
**Last Updated:** 2026-01-11
