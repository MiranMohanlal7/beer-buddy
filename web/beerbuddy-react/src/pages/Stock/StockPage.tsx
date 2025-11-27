import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
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
    setIsLoading(true);

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
  const heroSummary = summary?.heroSummary ?? (isLoading ? "Syncing live stock…" : "");

  const lowStockCount = useMemo(
    () => compartments.filter((slot) => slot.percentage <= 35).length,
    [compartments],
  );

  return (
    <div className="page stock-page">
      <PageHeader
        title="Stock"
        subtitle="A closer look at every compartment with live sensor data."
      >
        <span className="pill">{summary ? "Live" : isLoading ? "Syncing" : "Offline"}</span>
      </PageHeader>

      {error ? (
        <AlertBanner
          severity="critical"
          title="Live stock unavailable"
          description={error}
        />
      ) : null}

      <Card className="stock-hero">
        <div className="stock-hero__copy">
          <p className="eyebrow">Fridge pulse</p>
          <h2>
            {summary ? `${overallStock}% stocked` : isLoading ? "Loading stock…" : "No data yet"}
          </h2>
          <p className="stock-page__muted">
            {heroSummary ||
              "We couldn’t pull the latest status. Try again in a moment or check the sensors."}
          </p>

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
        </div>

        <div className="stock-hero__meter">
          <ProgressBar value={overallStock} aria-label="Overall fridge stock percentage" />
          <p className="stock-page__muted">
            Auto-sync from fridge sensors. Values update as soon as new weights arrive.
          </p>
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
          const estimatedValue = Math.max(0, slot.currentUnits * slot.pricePerUnit);

          return (
            <Card key={slot.id} className="stock-detail">
              <div className="stock-detail__header">
                <div>
                  <p className="eyebrow">Compartment</p>
                  <h3>{slot.title}</h3>
                  <p className="stock-detail__status">{slot.status}</p>
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
                  <div className="stock-column__bar stock-detail__bar">
                    <div className="stock-column__fill" style={{ height: `${safePercentage}%` }} />
                  </div>
                  <p className="stock-detail__meter-caption">
                    {slot.currentUnits.toFixed(1)} / {slot.targetUnits.toFixed(1)} units
                  </p>
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
                      <span className="stock-detail__metric-label">Estimated value</span>
                      <strong>€{estimatedValue.toFixed(2)}</strong>
                    </div>
                    <div className="stock-detail__metric">
                      <span className="stock-detail__metric-label">Price</span>
                      <strong>€{slot.pricePerUnit.toFixed(2)}</strong>
                    </div>
                  </div>

                  <p className="stock-detail__description">
                    {slot.description || "Description not available yet for this drink."}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
