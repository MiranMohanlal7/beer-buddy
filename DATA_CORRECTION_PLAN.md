# Data Correction Plan – Live Dashboard Mapping

This document explains the current data mapping between the Brew Buddy database and the homepage dashboard, and outlines the process for correcting the mappings now that the database schema has changed (new columns were added to support proper data extraction).

## 1. Current Data Mapping (before corrections)

| Dashboard element | Current API source | Notes |
| --- | --- | --- |
| **Current user name** ("Hi, Sam") | `users.username` via `DashboardService.ResolveCurrentUserAsync()` | Uses `Dashboard:DefaultUserId` (currently `1`). |
| **Overall stock %** | Aggregated in `DashboardService.BuildCompartmentStatuses()` using **`beer_inventory.total_weight` as if it were max weight**, then `targetUnits = total_weight / unit_weight - consumption`. | This is incorrect: `total_weight` is now the *current* combined weight, not the max. |
| **Alert list** | Derived from the compartment percentages (if `<35%` or `<15%`). | Computed from the (mis)calculated percentage. |
| **Compartments grid** | `beer_inventory.name`, `price`, and **`total_weight` treated as max**; `status = "Max: {targetUnits} units"`. | Percentage and current units are skewed because capacity is wrong. |
| **Fridge notes board** | `shared_notes.name`, `shared_notes.message`, `shared_notes.created_at`. | Notes are read (and inserted) via `/api/notes`. |
| **Notifications copy** | Text string derived from count of alerts. | Driven by the current (mis)computed alerts. |

## 2. Database change summary (clarified)

- `beer_inventory.total_weight` = **current** combined weight of all units presently in the fridge (live value from sensors/updates).
- New column `beer_inventory.maxweight` = **maximum** weight capacity for that compartment.
- With the new column, correct stock math is:
  - `targetUnits = maxweight / unit_weight`
  - `currentUnits = total_weight / unit_weight`
  - `percentage = currentUnits / targetUnits`
  - `status = "Max: {targetUnits} units"`
  - Alerts should be based on this corrected `percentage`.

## 3. Step-by-step correction plan

1. **Confirm schema**  
   - Verify `beer_inventory.maxweight` exists (type, units). Confirm `total_weight` still holds current live weight.

2. **Update EF Core model & context**  
   - Add `MaxWeight` to `BeerInventory` model and map to `maxweight` in `BrewBuddyContext`.
   - Keep `total_weight` mapping as current weight.

3. **Adjust services & DTOs**  
   - In `DashboardService.BuildCompartmentStatuses`, change calculations to:
     - `targetUnits = maxweight / unit_weight`
     - `currentUnits = total_weight / unit_weight`
     - `percentage = currentUnits / targetUnits`
   - Use `status = "Max: {targetUnits} units"` based on `maxweight`.
   - Keep alerts based on corrected `percentage`.

4. **Frontend verification (no interface change expected)**  
   - Domain types can stay the same; values will now be correct once API fixes land.
   - Verify HomePage renders accurate percentages and statuses after backend change.

5. **Validation**  
   - Hit `/api/dashboard/summary` and confirm `targetUnits` reflects `maxweight`, `currentUnits` reflects `total_weight`, and percentages/alerts match expectations for each category.
   - Add/adjust a backend test to assert percentage math given sample weights.

6. **Documentation & follow-up**  
   - Update this file with final confirmed mapping after the change is deployed.  
   - Note any further schema changes that affect calculations.

## 4. What I need from you

To proceed with the correction work, please fill in this table with the new column details & desired mapping:

| UI field needing correction | New column(s) | Intended behavior |
| --- | --- | --- |
| Compartment capacity / status | `beer_inventory.maxweight` | Use `maxweight / unit_weight` as the “Max: X units” value. |
| Compartment current fill | `beer_inventory.total_weight` | Use `total_weight / unit_weight` as live units remaining. |

Once the mapping requirements are clear, I can follow the steps above to re-map the data consistently across the API and the React app.
