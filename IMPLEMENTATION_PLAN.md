# Beer Buddy Full Data Integration Plan

This document captures the full roadmap for turning every UI value into live database-backed data. Treat it as the source of truth while implementing and keep it updated as milestones land.

## Key Facts & Priorities
- ZERO hardcoded data may remain anywhere in the stack; every displayed value must come from the database or backend logic derived from it.
- Reliability is non-negotiable: introducing live data must not break existing flows, so every change needs fallbacks, logging, and tests. don't overcomplicate though. 
- No user login system will be implemented for the prototype, but the “current user” value shown in the UI still needs to originate from the backend (e.g., a default user record or config).
- The homepage and future pages must become fully interactive, meaning data refreshes reflect live DB changes without redeploys.
- Consistency between backend/front-end contracts is critical; DTOs must be versioned or documented to avoid regressions.
- Build with future sensor integration in mind: weight data, alerts, and notes will eventually stream from real hardware, so the API surface should already accommodate that.

## HomePage Live Data Checklist
| UI Value / Section | Current Placeholder | Real Source & Calculation Plan |
| --- | --- | --- |
| Welcome greeting (`currentUserName`) | `"User X"` constant | Backend resolves a preferred user from the `users` table (configurable `Dashboard:DefaultUserId`, with fallback to the first user) and returns the live name. |
| Hero stat (`fridgeStockPercentage`) | `72%` constant | Compute from `beer_inventory` + `consumption`: `targetUnits = total_weight / unit_weight`, `consumedUnits = SUM(consumption.units_taken)`, `currentUnits = max(targetUnits - consumedUnits, 0)`, `overallStock = SUM(currentUnits)/SUM(targetUnits)`. |
| Highlight cards (readiness, active alerts, next top-up) | Derived from placeholders | Reuse live aggregates above: readiness = `overallStock`, active alerts = count of generated alerts, next top-up = compartment with lowest `percentageFull`. |
| Alerts section | Hardcoded array with lorem | Generate alert DTOs whenever a compartment drops below thresholds (e.g., `<35%` warning, `<15%` critical). Additional alerts hook into future sensor events. |
| Compartment columns | Static Bav/Desp/Specials objects | Map each `beer_inventory` row to a `StockColumn`: `title = name`, `status = "Max: {targetUnits} units"`, `percentage = currentUnits/targetUnits`, `meta = "{currentUnits} of {targetUnits} left · €{price} each"`. |
| Fridge notes board | Local placeholder notes stored in `localStorage` | CRUD backed by `shared_notes`: `GET /api/notes` (ordered by `created_at`), `POST /api/notes` (validate & persist), `DELETE /api/notes/{id}` (optional). Frontend keeps optimistic state but data source is the database. |
| Notification copy (“Notification Centre”) | Generic explanatory paragraph | Copy references real alert counts (e.g., “{n} compartments below 35%”) or falls back to a calm message when there are none. |
| Stock meta footer (“Live updates...”) | Static sentence | Replace with live meta such as `{percentage}% stocked · {currentUnits} units left`; no mention of placeholders. |

## 1. Current State Audit
- [ ] Review every backend controller/service for literals or demo data (e.g., `DrinksController`).
- [ ] Review every React page/component/service (`src/pages`, `src/components`, `src/services`) for TODO placeholders or hardcoded values.
- [ ] Map each placeholder to the database source (table/column or derived metric) so replacements are explicit.

## 2. Database & Schema
- [ ] Confirm the MariaDB/MySQL instance (host, credentials, schema version) matches `brew_buddy.sql`.
- [ ] Model tables in EF Core:
  - `beer_inventory` (with weight metadata),
  - `consumption` (FKs to users + inventory),
  - `shared_notes`,
  - `users`.
- [ ] Add `DbContext` + migrations that recreate indexes, constraints, and FK rules from the SQL dump.
- [ ] Provide seeding/import instructions for development so dev DB mirrors production sample data.

## 3. Backend Services
- [ ] Configure connection strings per environment in `appsettings.{Environment}.json`; store secrets securely.
- [ ] Build a service layer to encapsulate DB access and domain logic:
  - Inventory queries with computed availability (use weight + consumption data).
  - Consumption aggregates per user/drink.
  - Shared note CRUD operations.
  - Dashboard summary metrics (overall stock %, alerts, next top-up compartment, etc.).
- [ ] Replace the static list in `DrinksController` with database queries.
- [ ] Implement new endpoints (versioned DTOs, e.g., `GET /api/dashboard/summary`, `GET/POST /api/notes`, `GET /api/stock`, `GET /api/history`, `GET /api/finance`, plus any future page needs).
- [ ] Add structured logging and error-handling middleware so failures return predictable responses.

## 4. Business Logic & Safety
- [ ] Define algorithms for:
  - Translating weight readings + `consumption.units_taken` into compartment fill percentages.
  - Deriving alert severity/thresholds (low stock, sensor offline, etc.).
  - Computing finance summaries (spend per user, outstanding balance).
- [ ] Write unit tests covering edge cases (empty inventory, high consumption spikes, malformed note input).
- [ ] Write integration tests using a disposable DB (MariaDB container or SQLite) to exercise controllers end-to-end.
- [ ] Introduce graceful fallbacks for missing data (empty states rather than crashes).

## 5. Frontend Integration
- [ ] Centralize API access under `src/api` with a shared Axios instance (base URL, interceptors, retry policy).
- [ ] Define typed domain models/interfaces (dashboard summary, stock compartment, history entry, finance snapshot, note).
- [ ] Replace placeholders on **HomePage**:
  - Fetch current user display name (even if mocked ID is fixed, value must come from API).
  - Fetch fridge stock percentage.
  - Fetch alerts list.
  - Fetch compartment stats (name, capacity, percentage).
  - Fetch notes from backend; remove localStorage seeding once API is live (localStorage can remain for caching if desired).
- [ ] Wire Stock, History, Finance, Leaderboard, Settings, Support pages to their respective endpoints; no static numbers remain.
- [ ] Ensure each data fetch shows loading + error states to keep UI resilient.
- [ ] Keep optimistic UI for note creation but roll back on failure.
- [ ] Remove leftover hardcoded strings that represent data (static copy/headings are fine).

## 6. Deployment & Monitoring
- [ ] Maintain environment configs (dev/staging/prod) for API base URLs and DB connections.
- [ ] CI/CD pipeline should run:
  - Backend unit + integration tests,
  - Frontend lint/tests/build,
  - Smoke tests hitting deployed API endpoints to confirm real data flows.
- [ ] Expose health-check endpoints and monitor logs for DB connectivity, query latency, or mismatched aggregates.
- [ ] Document rollback/restore procedures before go-live.

## 7. Documentation & Governance
- [ ] Document API contracts (routes, payloads, response samples) for frontend consumers.
- [ ] Keep this plan updated; include a checklist for “no hardcoded data” when reviewing PRs.
- [ ] Provide onboarding notes explaining how to add new data-driven pages (endpoints, DTOs, hooks).
- [ ] Record assumptions: no login system (prototype), but current user info must still flow from backend config or default user record.

## 8. Outstanding Questions
- [ ] How will live sensor data (weights, alerts) be ingested—direct DB writes or separate service?
- [ ] How is the “current user” selected without auth (fixed user ID in config? latest consumption user?).
- [ ] Are caching layers or background jobs required for heavy aggregates?

## Guiding Principles
- Never ship hardcoded UI data; every value must originate from the database or backend logic derived from it.
- Add tests for each critical metric so regressions are caught before deployment.
- Prefer defensive coding: handle missing/partial data gracefully instead of crashing.
- Keep backend/ frontend contracts stable; version DTOs if breaking changes are needed.
- Monitor logs/health to ensure issues surface quickly; reliability is as important as features.
