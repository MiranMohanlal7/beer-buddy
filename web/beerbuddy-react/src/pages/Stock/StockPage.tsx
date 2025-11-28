import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { UiIcon } from "../../components/ui/Icon";
import { useApi } from "../../api/ApiProvider";
import type { DashboardSummary } from "../../domain/types";

/**
 * Detailed stock view that reuses the live dashboard data
 * and surfaces drink descriptions stored in the database.
 */
export function StockPage() {
  const api = useApi();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    api
      .getDashboardSummary(controller.signal)
      .then((result) => {
        setSummary(result);
        setError(null);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setError(err.message ?? "Unable to load live stock data.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [api]);

  const compartments = summary?.compartments ?? [];
  const overallStock = summary?.overallStockPercentage ?? 0;
  const nextTopUp = summary?.nextTopUpCompartment ?? "Awaiting data";
  const heroSummary =
    summary?.heroSummary ??
    (isLoading ? "Syncing live stock…" : "We couldn’t load the latest fridge health yet.");

  const lowStockCount = useMemo(
    () => compartments.filter((slot) => slot.percentage <= 35).length,
    [compartments],
  );

  return (
    <div className="page stock-page">
      {error ? (
        <AlertBanner
          severity="critical"
          title="Live stock unavailable"
          description={error}
        />
      ) : null}

      <Card className="stock-hero">
        <div className="stock-hero__top">
          <div className="stock-hero__intro">
            <div className="stock-hero__title-row">
              <h2>Stock health overview</h2>
              <span className="pill">{summary ? "Live" : isLoading ? "Syncing" : "Offline"}</span>
            </div>
            <p className="stock-hero__subtitle">A closer look at every compartment with live data.</p>
            <p className="stock-page__muted">{heroSummary}</p>
          </div>

          <div className="stock-hero__reading">
            <p className="stock-hero__reading-label">Overall stock</p>
            <p className="stock-hero__reading-value">
              {summary ? `${overallStock}%` : isLoading ? "…" : "--"}
            </p>
            <ProgressBar value={overallStock} aria-label="Overall fridge stock percentage" />
            <p className="stock-hero__reading-note">
              Auto-sync from fridge sensors. Values refresh in real time.
            </p>
          </div>
        </div>

        <div className="stock-hero__stats">
          <div className="stock-hero__stat">
            <span className="stock-hero__stat-icon" aria-hidden="true">
              <UiIcon name="stock" variant="active" size={18} />
            </span>
            <div>
              <p className="stock-page__muted">Next top-up focus</p>
              <strong>{nextTopUp}</strong>
            </div>
          </div>
          <div className="stock-hero__stat">
            <span className="stock-hero__stat-icon" aria-hidden="true">
              <UiIcon name="alert" variant={lowStockCount > 0 ? "active" : "subtle"} size={18} />
            </span>
            <div>
              <p className="stock-page__muted">Low compartments</p>
              <strong>{summary ? lowStockCount : isLoading ? "…" : 0}</strong>
            </div>
          </div>
        </div>
      </Card>

      <div className="stock-grid">
        {isLoading && compartments.length === 0 ? (
          <Card className="stock-detail stock-detail--placeholder">
            <p className="stock-page__muted">Loading live stock levels…</p>
          </Card>
        ) : null}

        {!isLoading && compartments.length === 0 ? (
          <Card className="stock-detail stock-detail--placeholder">
            <p className="stock-page__muted">
              No compartments available yet. Connect the fridge sensors to see live stock.
            </p>
          </Card>
        ) : null}

        {compartments.map((slot) => {
          const safePercentage = Math.max(0, Math.min(slot.percentage, 100));
          const unitsNeeded = Math.max(0, slot.targetUnits - slot.currentUnits);
          const costToRefill = Math.max(0, unitsNeeded * slot.pricePerUnit);
          const description = (slot.description ?? "").trim();

          return (
            <Card key={slot.id} className="stock-detail">
              <div className="stock-detail__header">
                <div>
                  <h3>{slot.title}</h3>
                </div>
                <div className="stock-detail__badges">
                  <span className="pill">{`${safePercentage}% stocked`}</span>
                  <span className="stock-detail__price-tag">
                    €{slot.pricePerUnit.toFixed(2)} / unit
                  </span>
                </div>
              </div>

              <div className="stock-detail__body">
                <div
                  className="stock-detail__meter"
                  role="img"
                  aria-label={`${slot.title} ${safePercentage}% stocked`}
                >
                  <div className="stock-detail__visual">
                    <div className="stock-column__bar stock-detail__bar">
                      <div className="stock-column__fill" style={{ height: `${safePercentage}%` }} />
                    </div>
                  </div>
                </div>

                <div className="stock-detail__content">
                  <div className="stock-detail__metrics">
                    <div className="stock-detail__metric">
                      <span className="stock-detail__metric-label">Current</span>
                      <strong>{slot.currentUnits.toFixed(1)} units</strong>
                    </div>
                    <div className="stock-detail__metric">
                      <span className="stock-detail__metric-label">Target</span>
                      <strong>{slot.targetUnits.toFixed(1)} units</strong>
                    </div>
                    <div className="stock-detail__metric">
                      <span className="stock-detail__metric-label">Cost to refill</span>
                      <strong>€{costToRefill.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <p className="stock-detail__description">
                  {description && description.length > 0
                    ? description
                    : "Description not available yet for this drink."}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
