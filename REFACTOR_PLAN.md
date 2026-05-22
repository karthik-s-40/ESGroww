Refactor Plan — Centralize Calculations & Unit Handling

Goal: Replace scattered formulas with centralized utilities from `src/lib/calculations`.

Priority list (A -> B -> C):

A — Repo-wide inventory and prioritized replacements
- `src/lib/calculation-engine/index.ts` — migrated to central utilities (done)
- `src/lib/emissions-engine/index.ts` — migrated to central utilities and supports DB-driven factors (done)
- `src/lib/benchmark-engine/index.ts` — target: use unit helpers and ensure benchmark units match KPI units
- `src/lib/kpiUtils.ts` — target: delegate intensities and per-bed calculations to benchmark engine
- `src/lib/esgCalculations.ts` — re-exports; ensure consumers use centralized engines
- `src/actions/assessment.actions.ts` — replace inline sums/annualization with central `annualizeValue` and unit conversions
- `src/actions/summary.actions.ts` — ensure emissions/metrics read `getESGConfiguration()` and call central calculators
- `src/actions/dashboard.actions.ts` — ensure display values are formatted with `formatWithUnit`
- `src/lib/upload/processCategoryExcelUpload.ts` — use `validateUnitConsistency()` and convert units at ingest
- `src/lib/pdf/*` and `src/components/pdf/*` (if exist) — use `formatWithUnit()` and include units everywhere
- `src/components/*` (cards, charts, tables) — consume calculated values and display units via `formatWithUnit`
- `src/lib/benchmark-engine/*` and `src/lib/calculation-engine/*` tests — expand to cover BRD cases

B — Refactor: `benchmark-engine` & `kpiUtils`
- Ensure benchmark units stored in DB match KPI units
- Normalize incoming KPI units using `normalizeUnit` and `convertToStandardUnit`
- Use `formatWithUnit` for outputs

C — Update PDFs/charts/exports
- Replace raw numeric outputs with `formatWithUnit(value, unit)` and ensure units from `UNIT` are used

Notes on DB-driven configuration
- `getESGConfiguration()` provides `emissionFactors`, `benchmarks`, `scoringWeights`, `kpiRanges`, `defaultFactors`.
- Calculators should accept an optional `config` param and call `getEmissionFactor(sourceType, config)` where relevant.

Next immediate steps performed in codebase:
- Added centralized calculators and units in `src/lib/calculations`.
- Emissions and calculation engines partially refactored.

Planned next code actions (to complete A,B,C):
1. Replace remaining inline formulas in `src/actions/assessment.actions.ts` and `src/actions/summary.actions.ts` with central calculators.
2. Update `src/lib/upload/processCategoryExcelUpload.ts` to normalize and validate units on ingest.
3. Update UI and PDF exports to use `formatWithUnit`.
4. Add tests covering all BRD sample cases and end-to-end unit display checks.
