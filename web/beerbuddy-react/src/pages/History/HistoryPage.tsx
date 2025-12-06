import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { Card } from "../../components/ui/Card";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { UiIcon } from "../../components/ui/Icon";
import { useApi } from "../../api/ApiProvider";
import type {
  CompartmentHistory,
  CompartmentTransaction,
  ConsumptionEvent,
  DashboardSummary,
  TransactionType,
} from "../../domain/types";
import { getCurrentMonthRange } from "../../services/dateRanges";
import {
  filterRestockRecords,
  loadSensorRestockRecords,
  syncSensorRestockRecords,
} from "../../services/sensorRestocks";
import type { SensorRestockRecord } from "../../services/sensorRestocks";

const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const CHART_TICK_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

interface StockPoint {
  timestamp: number;
  units: number;
}

/**
 * Complete compartment history using raw consumption logs supplied by the backend.
 */
export function HistoryPage() {
  const api = useApi();
  const [{ fromIso, toIso, label }] = useState(getCurrentMonthRange);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [consumptionEvents, setConsumptionEvents] = useState<ConsumptionEvent[]>([]);
  const [sensorRestocks, setSensorRestocks] = useState<SensorRestockRecord[]>(() =>
    loadSensorRestockRecords(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timezoneLabel = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "local time",
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    Promise.all([
      api.getDashboardSummary(controller.signal),
      api.getConsumptionEvents({ from: fromIso, to: toIso, signal: controller.signal }),
    ])
      .then(([summaryResult, consumptionResult]) => {
        setSummary(summaryResult);
        setConsumptionEvents(consumptionResult);
        setError(null);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        const message = err.message || "Unable to load history yet.";
        setError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [api, fromIso, toIso]);

  useEffect(() => {
    if (!summary || !summary.compartments) {
      return;
    }
    const records = syncSensorRestockRecords(summary.compartments, new Date());
    setSensorRestocks(records);
  }, [summary]);

  const filteredSensorRestocks = useMemo(
    () => filterRestockRecords(sensorRestocks, fromIso, toIso),
    [sensorRestocks, fromIso, toIso],
  );

  const histories = useMemo<CompartmentHistory[]>(
    () =>
      buildCompartmentHistories(
        summary?.compartments ?? [],
        consumptionEvents,
        filteredSensorRestocks,
      ),
    [summary?.compartments, consumptionEvents, filteredSensorRestocks],
  );

  const totalTransactions = histories.reduce(
    (total, history) => total + history.transactions.length,
    0,
  );

  return (
    <div className="page history-page">
      {error ? (
        <AlertBanner severity="critical" title="History unavailable" description={error} />
      ) : null}

      <Card className="history-hero">
        <div className="history-hero__intro">
          <p className="eyebrow">History</p>
          <h2>Consumption history</h2>
          <p>
            Every drink consumed and restocked this {label}, {timezoneLabel}, in a simple list-based overview per compartment.
          </p>
          <div className="history-hero__chips">
            <span className="pill">
              <UiIcon name="history" size={16} />
              {label}
            </span>
            <span className="pill">
              <UiIcon name="stats" size={16} />
              {totalTransactions} entries
            </span>
            <span className="pill">
              <UiIcon name="stock" size={16} />
              {summary?.compartments.length ?? 0} compartments
            </span>
            <span className="pill pill--success">
              <UiIcon name="stats" size={16} />
              {isLoading ? "Syncing" : "Live"}
            </span>
          </div>
        </div>
      </Card>

      <StockHistoryChart histories={histories} isLoading={isLoading} />

      <div className="history-grid">
        {isLoading ? (
          <Card className="history-card history-card--placeholder">
            <p className="history-card__muted">Loading compartment history…</p>
          </Card>
        ) : null}

        {!isLoading && histories.length === 0 ? (
          <Card className="history-card history-card--placeholder">
            <p className="history-card__muted">
              No compartments available yet. Connect the fridge data to see history.
            </p>
          </Card>
        ) : null}

        {histories.map((history) => (
          <Card key={history.compartmentId} className="history-card">
            <div className="history-card__header">
              <div>
                <h3 className="history-card__title">{history.compartmentName}</h3>
              </div>
              <div className="history-card__actions">
                <span className="pill history-card__capacity">
                  <UiIcon name="fridge" size={16} />
                  Capacity {formatUnits(history.targetUnits)} units
                </span>
                <span className="pill history-card__entries">
                  <UiIcon name="stock" size={16} />
                  {history.transactions.length} entries
                </span>
              </div>
            </div>

            <div className="history-card__timeline" role="list">
              {history.transactions.length === 0 ? (
                <p className="history-card__muted history-card__empty">
                  No movements recorded for this compartment in the selected window.
                </p>
              ) : (
                history.transactions.map((tx) => <HistoryRow key={tx.id} transaction={tx} />)
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StockHistoryChart({
  histories,
  isLoading,
}: {
  histories: CompartmentHistory[];
  isLoading: boolean;
}) {
  const [selectedCompartmentId, setSelectedCompartmentId] = useState<number | null>(null);

  useEffect(() => {
    if (histories.length === 0) {
      setSelectedCompartmentId(null);
      return;
    }
    const hasSelected = histories.some((history) => history.compartmentId === selectedCompartmentId);
    if (!hasSelected) {
      setSelectedCompartmentId(histories[0]?.compartmentId ?? null);
    }
  }, [histories, selectedCompartmentId]);

  const selectedHistory = useMemo(
    () => histories.find((history) => history.compartmentId === selectedCompartmentId),
    [histories, selectedCompartmentId],
  );

  const chartData = useMemo(
    () => (selectedHistory ? buildStockSeries(selectedHistory) : []),
    [selectedHistory],
  );
  const [domain, setDomain] = useState<[number, number] | ["auto", "auto"]>(["auto", "auto"]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const dataRange = useMemo(() => {
    if (chartData.length === 0) return null;
    return {
      minTs: chartData[0].timestamp,
      maxTs: chartData[chartData.length - 1].timestamp,
    };
  }, [chartData]);

  const latestUnits =
    chartData.length > 0
      ? chartData[chartData.length - 1]?.units ?? 0
      : selectedHistory?.currentUnits ?? 0;
  const targetUnits = selectedHistory?.targetUnits ?? 0;
  const chartSubtitle = selectedHistory
    ? `Showing ${selectedHistory.compartmentName}. Target ${formatUnits(targetUnits)} units.`
    : "Select a compartment to explore its stock curve.";

  useEffect(() => {
    setDomain(["auto", "auto"]);
  }, [selectedHistory]);

  const onPointClick = (event: any) => {
    const activeTs = Number(
      event?.payload?.timestamp ??
        event?.activeLabel ??
        (Array.isArray(event?.activePayload) ? event.activePayload[0]?.payload?.timestamp : undefined),
    );

    if (!Number.isFinite(activeTs)) {
      setDomain(["auto", "auto"]);
      return;
    }

    const zoomWindow = calculateHoverZoom(chartData, activeTs);
    if (!zoomWindow) {
      setDomain(["auto", "auto"]);
      return;
    }

    setDomain([zoomWindow.windowStart, zoomWindow.windowEnd]);
    setFocusedIndex(findClosestIndex(chartData, activeTs));
  };

  const onChartLeave = () => {
    setDomain(["auto", "auto"]);
  };

  const onWheelPan = (event: any) => {
    if (!dataRange || !isNumericDomain(domain)) return;
    // Prevent page scroll when the user is intentionally panning the chart
    if (typeof event?.preventDefault === "function") {
      event.preventDefault();
    }

    const deltaX = Number(event?.deltaX) || 0;
    const deltaY = Number(event?.deltaY) || 0;
    const dominantDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    if (!Number.isFinite(dominantDelta) || dominantDelta === 0) return;

    const span = domain[1] - domain[0];
    if (span <= 0) return;

    const shift = dominantDelta * span * 0.002;
    let nextStart = domain[0] + shift;
    let nextEnd = domain[1] + shift;

    if (nextStart < dataRange.minTs) {
      const correction = dataRange.minTs - nextStart;
      nextStart += correction;
      nextEnd += correction;
    } else if (nextEnd > dataRange.maxTs) {
      const correction = nextEnd - dataRange.maxTs;
      nextStart -= correction;
      nextEnd -= correction;
    }

    setDomain([nextStart, nextEnd]);
  };

  const jumpToIndex = (direction: "prev" | "next") => {
    if (chartData.length === 0) return;
    const fallbackIndex = focusedIndex ?? 0;
    const nextIndex =
      direction === "prev" ? Math.max(0, fallbackIndex - 1) : Math.min(chartData.length - 1, fallbackIndex + 1);

    const target = chartData[nextIndex];
    if (!target) return;

    const zoomWindow = calculateHoverZoom(chartData, target.timestamp) ?? {
      windowStart: target.timestamp - 60 * 60 * 1000,
      windowEnd: target.timestamp + 60 * 60 * 1000,
    };
    setDomain([zoomWindow.windowStart, zoomWindow.windowEnd]);
    setFocusedIndex(nextIndex);
  };

  return (
    <Card className="history-chart">
      <div className="history-chart__header">
        <div className="history-chart__title">
          <p className="eyebrow">Stock history</p>
          <h3>Stock over time</h3>
          <p className="history-chart__muted">{isLoading ? "Syncing data…" : chartSubtitle}</p>
        </div>

        <div className="history-chart__controls">
          <label className="history-chart__label" htmlFor="history-chart-select">
            Compartment
          </label>
          <select
            id="history-chart-select"
            className="history-chart__select"
            value={selectedCompartmentId ?? ""}
            onChange={(event) => setSelectedCompartmentId(Number(event.target.value))}
            disabled={histories.length === 0}
          >
            {histories.map((history) => (
              <option key={history.compartmentId} value={history.compartmentId}>
                {history.compartmentName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="history-chart__meta">
        <span className="pill history-chart__pill">
          <UiIcon name="stock" size={16} />
          Latest {formatUnits(latestUnits)} units
        </span>
        <span className="pill history-chart__pill">
          <UiIcon name="stats" size={16} />
          Target {formatUnits(targetUnits)} units
        </span>
      </div>

      <div className="history-chart__nav">
        <button
          type="button"
          className="history-chart__nav-button"
          onClick={() => jumpToIndex("prev")}
          disabled={chartData.length === 0 || (focusedIndex ?? 0) <= 0}
        >
          ◀ Prev point
        </button>
        <button
          type="button"
          className="history-chart__nav-button"
          onClick={() => jumpToIndex("next")}
          disabled={chartData.length === 0 || (focusedIndex ?? 0) >= chartData.length - 1}
        >
          Next point ▶
        </button>
      </div>

      <div className="history-chart__canvas">
        {isLoading ? (
          <p className="history-chart__muted">Loading history chart…</p>
        ) : !selectedHistory ? (
          <p className="history-chart__muted">No compartments available yet.</p>
        ) : chartData.length === 0 ? (
          <p className="history-chart__muted">
            No stock movements recorded for this compartment in the selected window.
          </p>
        ) : (
          <div className="history-chart__wheel-wrapper" onWheel={onWheelPan}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                onClick={onPointClick}
                onMouseLeave={onChartLeave}
              >
                <defs>
                  <linearGradient id="historyStockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-amber-ale)" stopOpacity={0.58} />
                    <stop offset="100%" stopColor="var(--color-amber-ale)" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(24, 71, 52, 0.12)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  tickFormatter={(value) => formatAxisTick(value)}
                  domain={domain}
                  allowDataOverflow
                  tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                  axisLine={{ stroke: "rgba(24, 71, 52, 0.18)" }}
                  tickLine={{ stroke: "rgba(24, 71, 52, 0.18)" }}
                />
                <YAxis
                  tickFormatter={(value) => formatUnits(Number(value))}
                  width={60}
                  tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                  axisLine={{ stroke: "rgba(24, 71, 52, 0.18)" }}
                  tickLine={{ stroke: "rgba(24, 71, 52, 0.18)" }}
                  allowDecimals
                />
                <Tooltip
                  content={(props: TooltipContentProps<number, string>) => (
                    <HistoryChartTooltip {...props} />
                  )}
                />
                <Area
                  type="stepAfter"
                  dataKey="units"
                  stroke="var(--color-amber-ale)"
                  strokeWidth={3}
                  fill="url(#historyStockGradient)"
                  dot={{ r: 3, strokeWidth: 1.25, fill: "var(--color-amber-ale)", stroke: "var(--color-bg-card)" }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-bg-card)" }}
                  onClick={onPointClick}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}

function HistoryChartTooltip({
  active,
  payload,
}: TooltipContentProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload as StockPoint | undefined;
  if (!point) return null;

  return (
    <div className="history-chart__tooltip">
      <p className="history-chart__tooltip-title">{formatTimestamp(point.timestamp)}</p>
      <p className="history-chart__tooltip-value">{formatUnits(point.units)} units</p>
    </div>
  );
}

function HistoryRow({ transaction }: { transaction: CompartmentTransaction }) {
  const sign =
    transaction.type === "adjustment"
      ? "±"
      : transaction.type === "removed"
        ? "-"
        : "+";
  const amountClass =
    transaction.type === "removed"
      ? "history-transaction__amount--removed"
      : transaction.type === "added"
        ? "history-transaction__amount--added"
        : "history-transaction__amount--adjustment";
  const iconName =
    transaction.type === "removed"
      ? "beer"
      : transaction.type === "added"
        ? "success"
        : "stats";

  return (
    <div className="history-transaction" role="listitem">
      <div className="history-transaction__body">
        <p className={`history-transaction__amount ${amountClass}`}>
          {sign}
          {formatUnits(transaction.units)} units
        </p>
        <p className="history-transaction__meta">
          {formatTimestamp(transaction.timestamp)}
          {transaction.source ? ` • ${transaction.source}` : ""}
        </p>
        {transaction.note ? (
          <p className="history-transaction__note">{transaction.note}</p>
        ) : null}
      </div>
      <div className="history-transaction__icon" aria-hidden="true">
        <UiIcon name={iconName} variant="subtle" size={18} />
      </div>
    </div>
  );
}

function buildCompartmentHistories(
  compartments: NonNullable<DashboardSummary["compartments"]>,
  events: ConsumptionEvent[],
  sensorRestocks: SensorRestockRecord[] = [],
): CompartmentHistory[] {
  const eventsByCompartment = new Map<number, ConsumptionEvent[]>();
  for (const event of events) {
    if (!eventsByCompartment.has(event.beerId)) {
      eventsByCompartment.set(event.beerId, []);
    }
    eventsByCompartment.get(event.beerId)!.push(event);
  }

  const restocksByCompartment = new Map<number, SensorRestockRecord[]>();
  for (const restock of sensorRestocks) {
    if (!restocksByCompartment.has(restock.compartmentId)) {
      restocksByCompartment.set(restock.compartmentId, []);
    }
    restocksByCompartment.get(restock.compartmentId)!.push(restock);
  }

  return compartments.map((compartment) => {
    const compEvents = [...(eventsByCompartment.get(compartment.id) ?? [])].sort(
      (a, b) => toDate(a.timeTaken).getTime() - toDate(b.timeTaken).getTime(),
    );

    const targetUnits = Math.max(0, compartment.targetUnits);
    const currentUnits = Math.max(0, compartment.currentUnits);

    const transactions: CompartmentTransaction[] = [];
    for (const event of compEvents) {
      const delta = Number(event.unitsTaken);
      if (!Number.isFinite(delta) || delta === 0) continue;

      const isAddition = delta < 0;
      const units = Math.abs(delta);
      const type: TransactionType = isAddition ? "added" : "removed";
      const action = isAddition ? "added" : "taken";
      const actor = event.username ? ` by ${event.username}` : "";

      transactions.push({
        id: `consumption-${event.id}`,
        compartmentId: compartment.id,
        compartmentName: compartment.title,
        type,
        units,
        timestamp: event.timeTaken,
        source: event.username || (isAddition ? "Restock" : "Unknown user"),
        note: `${formatUnits(units)} units ${action}${actor}.`,
      });
    }

    const compRestocks = [...(restocksByCompartment.get(compartment.id) ?? [])]
      .sort((a, b) => toDate(a.timestamp).getTime() - toDate(b.timestamp).getTime())
      .map<CompartmentTransaction>((record) => ({
        id: record.id,
        compartmentId: compartment.id,
        compartmentName: compartment.title,
        type: "added",
        units: record.units,
        timestamp: record.timestamp,
        source: "Sensor sync",
        note: `${formatUnits(record.units)} units added according to the fridge sensors.`,
      }));

    transactions.push(...compRestocks);

    transactions.sort((a, b) => toDate(b.timestamp).getTime() - toDate(a.timestamp).getTime());

    return {
      compartmentId: compartment.id,
      compartmentName: compartment.title,
      currentUnits,
      targetUnits,
      pricePerUnit: compartment.pricePerUnit,
      transactions,
    };
  });
}

function buildStockSeries(history: CompartmentHistory): StockPoint[] {
  const sortedDescending = [...history.transactions].sort(
    (a, b) => toDate(b.timestamp).getTime() - toDate(a.timestamp).getTime(),
  );

  let runningUnits = Math.max(0, history.currentUnits);
  const points: StockPoint[] = [
    {
      timestamp: Date.now(),
      units: Math.round(runningUnits * 100) / 100,
    },
  ];

  for (const tx of sortedDescending) {
    if (tx.type === "removed") {
      runningUnits += tx.units;
    } else if (tx.type === "added") {
      runningUnits = Math.max(0, runningUnits - tx.units);
    } else {
      runningUnits = Math.max(0, runningUnits);
    }

    points.push({
      timestamp: toDate(tx.timestamp).getTime(),
      units: Math.round(runningUnits * 100) / 100,
    });
  }

  return points.sort((a, b) => a.timestamp - b.timestamp);
}

function calculateHoverZoom(data: StockPoint[], targetTs: number) {
  if (data.length < 2) return null;

  const closestIndex = findClosestIndex(data, targetTs);

  const previousGap =
    closestIndex > 0
      ? Math.abs(data[closestIndex].timestamp - data[closestIndex - 1].timestamp)
      : Number.POSITIVE_INFINITY;
  const nextGap =
    closestIndex < data.length - 1
      ? Math.abs(data[closestIndex + 1].timestamp - data[closestIndex].timestamp)
      : Number.POSITIVE_INFINITY;

  const minGap = Math.min(previousGap, nextGap);
  const CLOSE_THRESHOLD_MS = 12 * 60 * 60 * 1000; // 12 hours — allow zoom on tighter clusters
  if (!Number.isFinite(minGap) || minGap === Number.POSITIVE_INFINITY || minGap > CLOSE_THRESHOLD_MS) {
    return null;
  }

  const MIN_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
  const MAX_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours
  const targetRange = Math.min(Math.max(minGap * 3, MIN_WINDOW_MS), MAX_WINDOW_MS);
  const padding = targetRange / 2;
  const rangeStart = targetTs - padding;
  const rangeEnd = targetTs + padding;

  if (rangeEnd <= rangeStart) return null;

  return { windowStart: rangeStart, windowEnd: rangeEnd, minGap };
}

function findClosestIndex(data: StockPoint[], targetTs: number): number {
  let closestIndex = 0;
  let smallestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < data.length; i += 1) {
    const distance = Math.abs(data[i].timestamp - targetTs);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestIndex = i;
    }
  }
  return closestIndex;
}

function isNumericDomain(domain: [number, number] | ["auto", "auto"]): domain is [number, number] {
  return typeof domain[0] === "number" && typeof domain[1] === "number";
}

function toDate(value: string | number): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatTimestamp(timestamp: string | number): string {
  return TIMESTAMP_FORMATTER.format(toDate(timestamp));
}

function formatUnits(units: number): string {
  const rounded = Math.round(units * 10) / 10;
  if (Number.isNaN(rounded)) {
    return "0";
  }
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
}

function formatAxisTick(value: number | string): string {
  return CHART_TICK_FORMATTER.format(toDate(value));
}
