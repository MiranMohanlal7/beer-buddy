# History Data Flow

This document captures the current path data takes before it becomes the History page UI. It reflects the latest implementation in `HistoryPage.tsx`, including the removal of artificial baseline, restock, and sensor-adjustment transactions.

## Overview
- `HistoryPage` mounts and kicks off concurrent requests for the dashboard summary and consumption events (limited to the current month) through `useApi`.
- The summary response supplies compartment-level snapshots (`currentUnits`, `targetUnits`, metadata). Consumption events are raw logs for individual drinks pulled from `GET /api/consumption`.
- `buildCompartmentHistories` groups events by compartment ID, formats them into `CompartmentTransaction` entries (currently only real “removed” events), and attaches them to each compartment’s snapshot.
- `buildStockSeries` works from those transactions plus the compartment’s latest `currentUnits` to backfill a stock curve that flows from “now” backwards in time and then presents it chronologically.
- The component renders:
  - An alert if any inferred restocks would have been necessary (should now stay hidden because we no longer synthesize such events).
  - A per-compartment card that lists transactions in reverse chronological order.
  - The aggregate stock chart that consumes the derived series for whichever compartment is selected.

## Flowchart

```mermaid
flowchart TD
    A[HistoryPage mount/useEffect] -->|fetch| B[/GET /api/dashboard/summary/]
    A -->|fetch| C[/GET /api/consumption?from=&to=/]
    B --> D[Summary data (compartment snapshots)]
    C --> E[Consumption events (raw logs)]
    D --> F[buildCompartmentHistories<br/>per compartment metadata]
    E --> F
    F --> G[Transactions per compartment]
    G --> H[List UI (HistoryRow)]
    G --> I[buildStockSeries]
    I --> J[Stock area chart]
```

## Notes
- All computations happen in-memory on the client; the backend currently exposes only the snapshot summary and the raw consumption feed.
- Because we no longer infer restocks or sensor adjustments, every timeline entry corresponds directly to a database record.
- The chart derives “previous stock levels” by walking the transaction list backwards from the live `currentUnits`. If new backend data (e.g., explicit restock logs) becomes available, `buildCompartmentHistories` can be extended to incorporate them before they flow through the same pipeline.
