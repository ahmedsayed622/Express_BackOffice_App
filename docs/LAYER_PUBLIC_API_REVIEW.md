# Layer Public API Review

## 1) Architecture Rules
- Cross-layer imports must go through the target layer’s `index.js`:
  - routes -> controllers/index.js
  - controllers -> services/index.js
  - services -> repositories/index.js
  - any layer -> utils/index.js
  - any layer -> config/index.js
  - any layer -> middlewares/index.js (if used)
  - any layer -> validators/index.js (if used cross-layer)
- Intra-layer imports must remain direct (no self-index use within the same layer).

## 2) Summary
- Total imports scanned: 108
- Cross-layer violations: 0
- Intra-layer violations: 0

## 3) Cross-Layer Violations
- None found.

## 4) Intra-Layer Violations
- None found.

## 5) Exceptions (Allowed)
- repositories -> models: direct model imports are allowed because models are not defined as a stable public API yet.
- utils internal wiring: direct imports within `src/utils/*` (e.g., `logger.js` -> `paths.js`) are allowed.
- config internal wiring: direct imports within `src/config/*` (e.g., `oraclePool.js` -> `oracleClient.js`) are allowed and preferred.

## 6) Final Verdict
The project follows the intended "Layer Public API via index.js" architecture. No violations detected under the stated rules.
