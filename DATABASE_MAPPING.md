# Database ↔️ Code Mapping Guide

Use this guide to understand exactly how the ASP.NET Core backend maps tables/columns in the `brew_buddy` database to C# entities and how those values flow into the Home page API responses. Update the “Expected column” column if the database schema changes or if I mapped a field incorrectly and I will adjust the code accordingly.

---

## beer_inventory → `BeerInventory`

| C# Property | Expected Column | MySQL Type | Notes / Usage |
| --- | --- | --- | --- |
| `Id` | `id` | `int unsigned` (PK, AUTO_INCREMENT) | Primary key used as `beer_id` FK in `consumption`. |
| `Name` | `name` | `varchar(255)` | Display name of the drink/compartment. |
| `Description` | `description` | `varchar(510)` | Currently unused on the dashboard but preserved for tooltips/future UX. |
| `Price` | `price` | `decimal(6,2)` | Used in Home page stock cards to show unit price. |
| `UnitWeight` | `unit_weight` | `int` | Weight (grams) of a full unit, used to derive target units (`total_weight / unit_weight`). |
| `UnitEmpty` | `unit_empty` | `int` | Tare weight; stored for future sensor logic (not yet consumed). |
| `TotalWeight` | `total_weight` | `int` | Calibrated “full compartment” weight. |

**Where it’s used**
- `DashboardService` combines these values with `consumption` to calculate remaining units and percentages for the Home page cards.

---

## consumption → `ConsumptionRecord`

| C# Property | Expected Column | MySQL Type | Notes / Usage |
| --- | --- | --- | --- |
| `Id` | `id` | `int unsigned` (PK) | Surrogate key for each event. |
| `UserId` | `user_id` | `int unsigned` | FK → `users.id`; indicates who consumed. |
| `BeerId` | `beer_id` | `int unsigned` | FK → `beer_inventory.id`; indicates which compartment. |
| `UnitsTaken` | `units_taken` | `int` | Number of units removed per event. Aggregated to compute remaining stock. |
| `TimeTaken` | `time_taken` | `datetime` | Currently only used for ordering historical consumption (future “History” view). |

**Where it’s used**
- `DashboardService.BuildCompartmentStatuses` subtracts `SUM(units_taken)` per `beer_id` from each compartment’s target units to get live availability.

---

## shared_notes → `SharedNote`

| C# Property | Expected Column | MySQL Type | Notes / Usage |
| --- | --- | --- | --- |
| `Id` | `id` | `int unsigned` (PK) | Primary key. |
| `Name` | `name` | `varchar(100)` | Shown as the “author” in the Fridge Notes board. |
| `Message` | `message` | `text` | Note body. |
| `CreatedAt` | `created_at` | `datetime` | Used for ordering notes and “x minutes ago” copy. |

**Where it’s used**
- `NotesController` (GET/POST/DELETE `/api/notes`) surfaces these directly to the Home page note board.

---

## users → `UserAccount`

| C# Property | Expected Column | MySQL Type | Notes / Usage |
| --- | --- | --- | --- |
| `Id` | `id` | `int unsigned` (PK) | Primary key referenced by `consumption.user_id`. |
| `Username` | `username` | `varchar(255)` (UNIQUE) | Display name. |
| `RfidTagId` | `rfid_tag_id` | `int` | RFID tag reference (future auth, currently unused). |
| `CreatedAt` | `created_at` | `datetime` | Timestamp for account creation. |

**Where it’s used**
- `DashboardService.ResolveCurrentUserAsync` fetches the “current” user based on `Dashboard:DefaultUserId` (falls back to first record). That name populates the Home page hero (“Hi, {user} — …”).

---

## Derived API fields (Home page)

| API Field | Calculation | Inputs |
| --- | --- | --- |
| `overallStockPercentage` | `SUM(currentUnits) / SUM(targetUnits)` (clamped 0–100) | `beer_inventory`, `consumption` |
| `alerts[]` | Generated per compartment (`critical` if ≤15%, `warning` if ≤35%) | `CompartmentStatusDto` list |
| `compartments[]` | Each `beer_inventory` row mapped with computed `currentUnits`, `percentage`, and `pricePerUnit` | `beer_inventory`, `consumption` |
| `nextTopUpCompartment` | Name of compartment with lowest `percentage` | `compartments[]` |
| `notes[]` | Ordered `shared_notes` rows | `shared_notes` |

Use this section when you need to adjust the formulas (e.g., new sensor logic, new alert thresholds) so we can update `DashboardService` accordingly.

---

## How to request changes

1. Identify the incorrect mapping in the table above (e.g., “`SharedNote.Message` should map to column `body` instead of `message`”).
2. Let me know the correction in plain language. I’ll update `BrewBuddyContext` (and any dependent logic) to match.
3. If a column does not exist yet, specify the desired schema so we know whether to create a migration or adjust code to optional fields.

Once you provide the rewritten mapping text, I can implement the changes safely. This document will stay updated as we evolve the schema.***
