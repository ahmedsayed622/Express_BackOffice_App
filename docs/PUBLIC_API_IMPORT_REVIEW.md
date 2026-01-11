# Public API Import Review

## A) Rules (Target Convention)
- Cross-layer imports must go through the target layer’s `index.js`:
  - routes -> controllers: `../../controllers/index.js`
  - controllers -> services: `../services/index.js`
  - services -> repositories: `../repositories/index.js`
  - any layer -> utils: `../utils/index.js` (or `./utils/index.js` at root)
  - any layer -> config: `../config/index.js`
  - validators cross-layer via `../validators/index.js`
  - models are optional public API; if not formalized, repositories may deep-import models (allowed exception)
- Same-layer internal imports may remain direct.

## B) Summary Counts
- Total imports scanned: 108
- Total violations: 4
- Violations by layer:
  - config: 4
  - controllers/services/repositories/utils/validators/middlewares: 0

## C) Violations List (Grouped by Layer)

### config layer
1) `src/config/sequelize.js`
   - Current: `import { ENV } from "./bootstrap.js";`
   - Recommended: `import { ENV } from "./index.js";`
   - Action: add export in `src/config/index.js` (already present) + change import

2) `src/config/sequelize.js`
   - Current: `import { initOracleClientOnce } from "./oracleClient.js";`
   - Recommended: `import { initOracleClientOnce } from "./index.js";`
   - Action: use config index

3) `src/config/oraclePool.js`
   - Current: `import { ENV } from "./bootstrap.js";`
   - Recommended: `import { ENV } from "./index.js";`
   - Action: use config index

4) `src/config/oracleClient.js`
   - Current: `import { ENV } from "./bootstrap.js";`
   - Recommended: `import { ENV } from "./index.js";`
   - Action: use config index

## D) Allowed Exceptions (With Reasons)
- repositories -> models: direct imports are allowed by policy because models index is not defined as a stable public API yet.
- utils submodules (within utils layer): internal imports are allowed (e.g., `src/utils/logging/logger.js` -> `../paths/paths.js`).
- config internal imports (bootstrap/oracle/sequelize within config): technically cross-layer, but these are internal module links inside the config layer; should remain direct to avoid self-referential index usage.

## E) Minimal Safe Plan (Review-Only)
1) Decide whether config layer must also use its own index.js for intra-layer imports.
2) If yes:
   - Update `src/config/sequelize.js`, `src/config/oraclePool.js`, `src/config/oracleClient.js` to import from `./index.js`.
3) If no:
   - Document config self-imports as allowed internal exceptions.
4) Verify:
   - `npm run start`
   - `curl http://localhost:3000/api/v1/client-monthly-data`
   - `node -e "import('./src/app.js').then(()=>console.log('app import ok'))"`
