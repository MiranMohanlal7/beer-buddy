# Brew Buddy – Codex Project Brief (Frontend Dashboard)

This document tells you everything you need to know to build the Brew Buddy dashboard in React + TypeScript with minimal rework. Treat this as the single source of truth unless the user explicitly overrides something.

---

## 1. Your role (Codex)

You are the coding assistant for the **Brew Buddy Dashboard**.

Your tasks:

1. Implement a **React + TypeScript** frontend according to this brief.
2. Build the app **page by page**, always preserving existing behaviour.
3. Design everything to minimise rework when new features are added.
4. Keep the codebase **clean, documented, and approachable** for junior CS students.

When the user asks a task (for example: “Implement the Stock page UI”, “Add History filters”, “Connect the Home page to the API”):

1. Re-read this brief.
2. State briefly what you will change (files, components, data flow).
3. Provide concrete code (new files + edits) consistent with previous steps.
4. Do not introduce new technologies or patterns unless explicitly requested.

---

## 2. Product overview

Brew Buddy is the dashboard for a **smart beer fridge** in student/shared houses.

High-level behaviour:

* The fridge contains **fixed compartments** for drink categories (e.g. Bavaria, Desperados, Corona).
* Sensors measure **stock by weight** and NFC identifies **who opened the door**.
* The backend exposes:

  * Current **stock per compartment**.
  * **Consumption history** (who took what, when, and how much).
  * **Finance info** (per-user costs, how much each person owes).
  * **Restock fairness info** (who restocked last / who is up next).
  * **Leaderboard** data for gamification.
* The dashboard visualises this data in a **warm, friendly, premium** style.

The project is a **prototype** but must have a realistic and extensible architecture.

---

## 3. Tech stack

Frontend:

* **React 18** with **TypeScript**.
* **Vite + React + TS** scaffold (assume standard Vite layout).
* Styling:

  * CSS Modules (`.module.css`) or page/component `.css` files.
  * A global **theme file** with CSS custom properties for colours and spacing.
* Routing:

  * **React Router v6+**.

Backend context (for integration later):

* **ASP.NET Core** REST API.
* **MySQL** database.

Frontend must be built so that **all dynamic data comes from the backend or injectable variables**, not from hard-coded mock domain data.

---

## 4. Domain model

Create `src/domain/types.ts` with typed interfaces reused everywhere.

```ts
export type DrinkCategoryId = string;
export type UserId = string;

export interface User {
  id: UserId;
  name: string;
  avatarUrl?: string;
}

export interface DrinkCategory {
  id: DrinkCategoryId;
  name: string;             // e.g. "Bavaria"
  brand?: string;
  pricePerUnit: number;     // in EUR
  compartmentIndex: number;
  targetStockUnits: number; // desired full stock in units
}

export interface CompartmentStatus {
  categoryId: DrinkCategoryId;
  currentUnits: number;     // calculated from weight
  percentageFull: number;   // 0–100
}

export interface ConsumptionEvent {
  id: string;
  userId: UserId;
  categoryId: DrinkCategoryId;
  quantity: number;         // units
  timestamp: string;        // ISO string
  source?: "fridge" | "manual";
}

export interface MonthlyFinanceSummary {
  month: string; // "2025-03"
  perUser: {
    userId: UserId;
    totalUnits: number;
    totalCost: number;
  }[];
  totalCost: number;
}

export interface RestockDutyInfo {
  currentDutyUserId: UserId;
  lastRestockedUserId: UserId;
  ruleDescription: string;
}

export interface LeaderboardEntry {
  userId: UserId;
  rank: number;
  totalUnits: number;
}

export interface WarningMessage {
  id: string;
  type: "stock" | "behaviour" | "ownership";
  text: string;
  severity: "info" | "warning" | "critical";
}
```

Do not bake assumptions like “there are always three categories” into the code. Always iterate over arrays.

---

## 5. API contract and database integration

### 5.1 HTTP contract

Assume the backend exposes a REST API under a configurable base URL.

* Base URL comes from `VITE_API_BASE_URL` in `.env` (for example `/api`).
* All endpoints are relative to that base.

Suggested endpoints (can be adjusted later as long as the `BrewBuddyApi` interface stays compatible):

* `GET /users/me` → `User`
* `GET /users` → `User[]`
* `GET /drink-categories` → `DrinkCategory[]`
* `GET /compartments/status` → `CompartmentStatus[]`
* `GET /consumption?from=&to=&userId=` → `ConsumptionEvent[]`
* `GET /finance/monthly?month=` → `MonthlyFinanceSummary`
* `GET /restock-duty` → `RestockDutyInfo`
* `GET /leaderboard` → `LeaderboardEntry[]`
* `GET /warnings` → `WarningMessage[]`

Error shape:

```json
{
  "message": "Human-readable message",
  "code": "OPTIONAL_ERROR_CODE",
  "details": {}
}
```

Auth:

* For the prototype, assume either no authentication or very simple cookie-based auth handled by the backend.
* Do **not** scaffold token storage/refresh logic unless explicitly requested.

### 5.2 API interface (frontend abstraction)

Create `src/api/client.ts` defining the shape of the frontend API layer:

```ts
import {
  User,
  DrinkCategory,
  CompartmentStatus,
  ConsumptionEvent,
  MonthlyFinanceSummary,
  RestockDutyInfo,
  LeaderboardEntry,
  WarningMessage,
  UserId,
} from "../domain/types";

export interface BrewBuddyApi {
  getCurrentUser(): Promise<User>;
  getUsers(): Promise<User[]>;
  getDrinkCategories(): Promise<DrinkCategory[]>;
  getCompartmentStatus(): Promise<CompartmentStatus[]>;
  getConsumptionHistory(params: {
    from?: string;
    to?: string;
    userId?: UserId;
  }): Promise<ConsumptionEvent[]>;
  getMonthlyFinanceSummary(month: string): Promise<MonthlyFinanceSummary>;
  getRestockDuty(): Promise<RestockDutyInfo>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getWarnings(): Promise<WarningMessage[]>;
}
```

### 5.3 Placeholder implementation (no hard-coded mock data)

Create `src/api/placeholderApiClient.ts`.

Goal: allow the UI to compile and run **without embedding sample names or drinks**. All values must be trivial to replace with real database-backed responses.

```ts
import { BrewBuddyApi } from "./client";
import {
  User,
  DrinkCategory,
  CompartmentStatus,
  ConsumptionEvent,
  MonthlyFinanceSummary,
  RestockDutyInfo,
  LeaderboardEntry,
  WarningMessage,
} from "../domain/types";

/**
 * Placeholder implementation for early development.
 *
 * IMPORTANT:
 * - Do NOT put real mock domain data here (no "Sam", "Jules", etc.).
 * - All methods should be easy to replace with real fetch/axios calls.
 * - Use empty collections or minimal structural defaults only.
 *
 * How to replace with database data:
 * 1) Replace each method body with an HTTP call to the ASP.NET Core API.
 * 2) Map the JSON response to the domain types from `../domain/types`.
 * 3) Remove or adjust any fallback values.
 */
export const placeholderApiClient: BrewBuddyApi = {
  async getCurrentUser(): Promise<User> {
    // TODO: replace with real API call, for example:
    // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`);
    // if (!res.ok) throw await res.json();
    // return (await res.json()) as User;
    return {
      id: "",
      name: "",
    };
  },

  async getUsers(): Promise<User[]> {
    // TODO: real API call
    return [];
  },

  async getDrinkCategories(): Promise<DrinkCategory[]> {
    // TODO: real API call
    return [];
  },

  async getCompartmentStatus(): Promise<CompartmentStatus[]> {
    // TODO: real API call
    return [];
  },

  async getConsumptionHistory(): Promise<ConsumptionEvent[]> {
    // TODO: real API call
    return [];
  },

  async getMonthlyFinanceSummary(): Promise<MonthlyFinanceSummary> {
    // TODO: real API call
    return {
      month: "",
      perUser: [],
      totalCost: 0,
    };
  },

  async getRestockDuty(): Promise<RestockDutyInfo> {
    // TODO: real API call
    return {
      currentDutyUserId: "",
      lastRestockedUserId: "",
      ruleDescription: "",
    };
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // TODO: real API call
    return [];
  },

  async getWarnings(): Promise<WarningMessage[]> {
    // TODO: real API call
    return [];
  },
};
```

### 5.4 API provider / dependency injection

Use React context to provide the API implementation to the component tree.

* Create `src/api/ApiProvider.tsx` that exposes a `BrewBuddyApi` via context.
* Initially, this uses `placeholderApiClient`.
* When the real backend is ready, you can swap it for a `httpApiClient` without changing page components.

---

## 6. Domain semantics and rules

To avoid inconsistent business logic, use these rules:

* **Units for stock and consumption**: `quantity` and `currentUnits` represent **whole drink units** (bottles/cans). If fractional units ever appear (e.g. tap beer), the backend should convert them to equivalent units before sending.
* **percentageFull**: calculated on the backend from sensor data. Frontend should treat it as already computed and never re-calculate from weight.
* **Finance rounding**: all monetary values are in EUR, rounded to two decimals on the backend. Frontend displays amounts with two decimals.
* **Restock duty**: determined by backend using its own fairness logic; frontend only displays the current and last restocker plus a human-readable `ruleDescription`.

If any of these rules change, the backend should adapt and the frontend should keep the same interfaces.

---

## 7. Layout and pages

Use a consistent layout with a persistent left sidebar and a main content area.

### 7.1 Sidebar and layout

Create layout components:

* `src/components/layout/AppLayout.tsx`
* `src/components/layout/Sidebar.tsx`
* Optional: `TopBar.tsx` for breadcrumbs/profile.

Sidebar items (in order):

1. Home
2. Stock
3. History
4. Finance
5. Leaderboard
6. Settings
7. Support

Use `NavLink` from React Router for active states. Layout should be responsive but desktop-first.

### 7.2 Routing

Create `src/router.tsx` (or similar) configuring routes:

* `/`           → `HomePage`
* `/stock`      → `StockPage`
* `/history`    → `HistoryPage`
* `/finance`    → `FinancePage`
* `/leaderboard`→ `LeaderboardPage`
* `/settings`   → `SettingsPage`
* `/support`    → `SupportPage`

All pages render **inside** `AppLayout` so navigation and styling are consistent.

### 7.3 Page responsibilities and behaviours

Each page:

* Fetches required data via the API client.
* Uses presentational components that accept typed props.
* Shows clear **loading**, **empty**, and **error** states:

  * Loading: skeletons or simple spinners.
  * Empty: friendly message explaining that no data is available yet.
  * Error: banner showing “Something went wrong” and a retry button.

#### 7.3.1 HomePage

* Header: “Welcome, [user.name]. Your fridge is [X]% stocked.”

  * X can come from aggregate of `CompartmentStatus` or a dedicated backend field (if later added).
* Warning banners: list of `WarningMessage` from `getWarnings()`.
* Compact overview of compartments:

  * For each `CompartmentStatus`, show a small vertical bar and basic info.

#### 7.3.2 StockPage

* Detailed view of current stock per compartment.
* For each `CompartmentStatus` + its `DrinkCategory`:

  * display name, percentage full, and units.
  * vertical bar visual using a `ProgressBar` component.
* No assumptions on the number of categories; layout should handle 1–8+ categories.

#### 7.3.3 HistoryPage

* Table or list of `ConsumptionEvent`s with columns:

  * Date/time (formatted from `timestamp`).
  * User name.
  * Drink name.
  * Quantity.
* Filters:

  * By user.
  * By drink category.
  * By date range.
* Initially, filters can be **client-side** (filter already-fetched events). Later, they may call
  `getConsumptionHistory` with query params.
* Sorted **newest first** by default.

#### 7.3.4 FinancePage

* Uses `MonthlyFinanceSummary` and `RestockDutyInfo`.
* Show:

  * Overall total cost for the month.
  * Per-user breakdown (cards or rows with name, units, cost).
  * For current user: emphasise “You owe €X this month”.
* Restock section:

  * Show `currentDutyUserId` and `lastRestockedUserId` resolved to names.
  * Optional simple wheel/graphic to visualise duty.

#### 7.3.5 LeaderboardPage

* List of `LeaderboardEntry` sorted by `rank` or `totalUnits` descending.
* Show rank, user name, and total units consumed.
* Highlight the current user row.

#### 7.3.6 SettingsPage

Sections:

1. **Appearance**

   * Background/wallpaper choice (can be simple colour or pattern enum).
2. **General**

   * Language selector.
   * Notification toggles (email/push placeholders).
3. **User**

   * Display name, maybe favourite drink.

For now, settings can be stored locally in React context or `localStorage`, but the code must be structured so it can later call backend endpoints like `updateUserSettings`.

#### 7.3.7 SupportPage

* Static contact info: email, phone, etc.
* Simple contact form:

  * Fields: name, email, subject, message.
  * Basic client-side validation.
  * On submit: show a success message, no real sending needed yet.

---

## 8. Design system, colours, and typography

### 8.1 Colour palette (DO NOT DEVIATE)

Use these exact hex codes from the brand guidelines:

```css
:root {
  /* Brand colours */
  --color-foam-off-white: #F7F2E9; /* main background, light surfaces */
  --color-amber-ale:      #E39A41; /* primary buttons, key highlights, accents */
  --color-honey-top:      #F4C96A; /* secondary accent, hover states */
  --color-bottle-green:   #184734; /* logo, headings, navigation, darker accents */
  --color-toasted-brown:  #8A5A3C; /* icons, dividers, supporting elements */
  --color-dark-roast:     #241A16; /* primary body text, replacement for black */

  /* Semantic aliases */
  --color-bg-main: var(--color-foam-off-white);
  --color-bg-card: #F9F3EC;
  --color-text-main: var(--color-dark-roast);
  --color-text-muted: #5A4A3F;
  --color-accent-primary: var(--color-amber-ale);
  --color-accent-secondary: var(--color-honey-top);
  --color-nav-bg: var(--color-bottle-green);
  --color-border-subtle: #E0D2C3;
  --color-danger: #D9533F; /* warm warning colour */
}
```

Rules:

* Do not introduce new hex colours unless the user explicitly requests them.
* Use the semantic aliases (`--color-bg-main`, `--color-accent-primary`, etc.) inside components.

### 8.2 Typography

In `src/styles/theme.css` or `globals.css`:

```css
:root {
  --font-heading: "Rufina", serif;
  --font-body: "Karla", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  font-family: var(--font-body);
  color: var(--color-text-main);
  background-color: var(--color-bg-main);
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
}
```

### 8.3 Spacing, radius, and shadows

Define a simple spacing scale and shared radii/shadows:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  --shadow-soft: 0 4px 10px rgba(0, 0, 0, 0.06);
}
```

Use these tokens instead of hard-coded numbers in components.

### 8.4 UI primitives

Create reusable components under `src/components/ui/`:

* `Button` (variants: primary, secondary, ghost).
* `Card`.
* `Badge`.
* `ProgressBar` (for stock levels).
* `AlertBanner` (for warnings and errors).
* `PageHeader` (title + optional subtitle/actions).

Pages should be composed from these primitives to keep styling consistent and minimise future refactors.

---

## 9. Project structure and engineering conventions

### 9.1 Folder structure

```txt
src/
  api/
    client.ts
    placeholderApiClient.ts
    ApiProvider.tsx
  domain/
    types.ts
  components/
    layout/
      AppLayout.tsx
      Sidebar.tsx
      TopBar.tsx
    ui/
      Button.tsx
      Card.tsx
      Badge.tsx
      ProgressBar.tsx
      AlertBanner.tsx
  pages/
    Home/
      HomePage.tsx
    Stock/
      StockPage.tsx
    History/
      HistoryPage.tsx
    Finance/
      FinancePage.tsx
    Leaderboard/
      LeaderboardPage.tsx
    Settings/
      SettingsPage.tsx
    Support/
      SupportPage.tsx
  styles/
    theme.css
    globals.css
  router.tsx
  main.tsx
```

### 9.2 Tooling

* Use **Node 20.x** and **npm** (unless the user specifies otherwise).
* Add ESLint + TypeScript and Prettier.
* Scripts in `package.json`:

  * `dev`, `build`, `preview`, `lint`.

### 9.3 Naming and code style

* Components: **PascalCase**.
* Variables/functions: **camelCase**.
* Prefer **named exports** for components and utilities.
* Avoid `any`; if unavoidable, document why with a comment.
* Keep components small and focused:

  * Page components handle data fetching.
  * Presentational components render props only.
* Avoid complex hidden side effects in custom hooks.

### 9.4 Documentation

* Create a root `README.md` explaining:

  * How to install dependencies.
  * How to run dev/build.
  * How to configure `VITE_API_BASE_URL`.
  * Where types, API, and pages live.
* Create a `docs/` folder with:

  * `docs/architecture.md` – overview of layers (API, pages, components).
  * `docs/api-contract.md` – HTTP endpoints and error shapes.
  * `docs/ui-guidelines.md` – how to use Button/Card/etc. and colour tokens.
* Add JSDoc/TSDoc comments to all exported functions and components.

Example:

```ts
/**
 * Displays the current stock level for a single drink category.
 * Expects pre-calculated `percentageFull` from the API layer.
 */
export function StockBar(props: StockBarProps) { ... }
```

---

## 10. Workflow and implementation order

Goal: **smooth workflow** and avoid large refactors later.

Recommended order for implementation:

1. Scaffold Vite React+TS project, add ESLint/Prettier, and create `theme.css` + `globals.css`.
2. Implement `types.ts`, API interface, `placeholderApiClient`, and `ApiProvider`.
3. Implement layout shell: `AppLayout`, `Sidebar`, routing in `router.tsx`.
4. Create UI primitives (Button, Card, ProgressBar, AlertBanner, PageHeader).
5. Implement basic versions of all pages using API methods that currently return empty values (handle loading/empty states).
6. Gradually enrich each page:

   * Home warnings and summary.
   * Stock visuals.
   * History filters.
   * Finance breakdown and restock duty.
   * Leaderboard highlighting.
   * Settings persistence (local).
7. When backend endpoints are ready, replace `placeholderApiClient` methods with real HTTP calls.

Guidelines for each change:

* Prefer small, additive changes over big rewrites.
* Reuse components instead of duplicating markup.
* Keep data flow clear: pages fetch data → pass props to presentational components.

---

## 11. Future features (design constraints)

Keep these potential future features in mind and avoid blocking them:

* Real-time updates (WebSockets or polling).
* Authentication and multiple fridges/houses.
* More visual charts for history/finance.
* Admin panel for configuring drinks/prices.
* On-fridge mini UI based on shared components.

Therefore:

* Keep API interfaces generic (no hard-coded “single house” assumptions).
* Do not embed business rules in components; use helpers or rely on backend.
* Avoid hard-coded texts that may later become dynamic; centralise important labels/strings where reasonable.

---

With this brief you have everything needed to start implementing the Brew Buddy dashboard at high speed while staying flexible for future features.
