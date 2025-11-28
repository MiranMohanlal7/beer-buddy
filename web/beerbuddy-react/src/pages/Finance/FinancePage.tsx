import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../../components/ui/Card";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { UiIcon } from "../../components/ui/Icon";
import { useApi } from "../../api/ApiProvider";
import type { DashboardSummary, DrinkBreakdown, LeaderboardEntry } from "../../domain/types";
import { getCurrentMonthRange } from "../../services/dateRanges";
import { useActiveProfile } from "../../state/ActiveProfileContext";
import { Wheel } from "react-custom-roulette";
import confetti from "canvas-confetti";
import { useSettings, type RestockMode } from "../../state/SettingsContext";

const WHEEL_COLORS = ["#E39A41", "#F4C96A", "#184734", "#8A5A3C", "#F7F2E9", "#B47130", "#2E5F46"];

const euroFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return euroFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatUnits(value: number) {
  if (Number.isNaN(value)) return "0";
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function getWheelTextColor(color: string) {
  return color === "#184734" || color === "#2E5F46" ? "#F7F2E9" : "#241A16";
}

export function FinancePage() {
  const api = useApi();
  const [{ fromIso, toIso, label }] = useState(getCurrentMonthRange);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { activeProfile, selectProfile } = useActiveProfile();
  const { settings } = useSettings();
  const restockMode = settings.restockMode;
  const [wheelWinner, setWheelWinner] = useState<LeaderboardEntry | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [prizeNumber, setPrizeNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFinance() {
      setIsLoading(true);
      try {
        const [dashboard, leaderboard] = await Promise.all([
          api.getDashboardSummary(controller.signal),
          api.getLeaderboard({ from: fromIso, to: toIso, signal: controller.signal }),
        ]);

        if (controller.signal.aborted) return;
        setSummary(dashboard);
        setEntries(leaderboard);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "We couldn’t load your finance data just now.";
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchFinance();
    return () => controller.abort();
  }, [api, fromIso, toIso]);

  useEffect(() => {
    if (!summary?.currentUserName) {
      return;
    }
    if (activeProfile && activeProfile.source === "manual") {
      return;
    }
    selectProfile({ username: summary.currentUserName }, "api");
  }, [summary?.currentUserName, activeProfile, selectProfile]);

  const resolvedUserName = (activeProfile?.username ?? summary?.currentUserName ?? "").trim();
  const resolvedUserId = activeProfile?.userId ?? null;

  const currentEntry = useMemo(() => {
    if (resolvedUserId !== null) {
      return entries.find((entry) => entry.userId === resolvedUserId) ?? null;
    }
    if (!resolvedUserName) return null;
    const normalized = resolvedUserName.toLowerCase();
    return entries.find((entry) => entry.username.trim().toLowerCase() === normalized) ?? null;
  }, [resolvedUserId, resolvedUserName, entries]);

  const priceLookup = useMemo(() => {
    const byId = new Map<number, number>();
    const byName = new Map<string, number>();
    (summary?.compartments ?? []).forEach((slot) => {
      if (slot.id) {
        byId.set(slot.id, slot.pricePerUnit);
      }
      if (slot.title) {
        byName.set(slot.title.trim().toLowerCase(), slot.pricePerUnit);
      }
    });
    return { byId, byName };
  }, [summary]);

  const resolvePricePerUnit = useCallback(
    (drink: DrinkBreakdown) => {
      if (priceLookup.byId.has(drink.drinkId)) {
        return priceLookup.byId.get(drink.drinkId) ?? 0;
      }
      const normalizedName = drink.drinkName.trim().toLowerCase();
      if (normalizedName && priceLookup.byName.has(normalizedName)) {
        return priceLookup.byName.get(normalizedName) ?? 0;
      }
      return 0;
    },
    [priceLookup],
  );

  const consumption = useMemo(() => {
    if (!currentEntry) return [];
    return currentEntry.drinks.map((drink) => {
      const pricePerUnit = resolvePricePerUnit(drink);
      const totalCost = pricePerUnit * drink.unitsTaken;
      return {
        drinkId: drink.drinkId,
        drinkName: drink.drinkName,
        units: drink.unitsTaken,
        totalCost,
      };
    });
  }, [currentEntry, resolvePricePerUnit]);

  const totalCost = useMemo(
    () => consumption.reduce((sum, item) => sum + item.totalCost, 0),
    [consumption],
  );
  const totalUnits = currentEntry?.totalUnits ?? 0;

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.rank - b.rank),
    [entries],
  );

  const topEntry = sortedEntries[0];
  const runnerUp = sortedEntries[1];

  const scheduleRotation = useMemo(() => {
    const rotation = [...sortedEntries];
    if (rotation.length === 0) return null;
    const now = new Date();
    const index = now.getMonth() % rotation.length;
    const current = rotation[index];
    const previous = rotation[(index - 1 + rotation.length) % rotation.length];
    const next = rotation[(index + 1) % rotation.length];
    const restockDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const dateLabel = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(restockDate);

    return { current, previous, next, dateLabel };
  }, [sortedEntries]);

  const lastMonthAssignee = scheduleRotation?.previous ?? sortedEntries.at(-1) ?? null;
  const wheelParticipants = useMemo(() => {
    if (!sortedEntries.length) return [];
    if (!lastMonthAssignee) return sortedEntries;
    const filtered = sortedEntries.filter((entry) => entry.userId !== lastMonthAssignee.userId);
    return filtered.length > 0 ? filtered : sortedEntries;
  }, [sortedEntries, lastMonthAssignee]);

  const handleSpinWheel = useCallback(() => {
    if (wheelParticipants.length === 0 || isSpinning) return;
    const nextPrize = Math.floor(Math.random() * wheelParticipants.length);
    setPrizeNumber(nextPrize);
    setIsSpinning(true);
  }, [wheelParticipants.length, isSpinning]);

  const launchConfetti = useCallback(() => {
    const defaults = {
      startVelocity: 65,
      spread: 420,
      ticks: 260,
      zIndex: 40,
      colors: ["#E39A41", "#F4C96A", "#184734", "#F7F2E9"],
    };

    const root = wheelRef.current;
    const origin = (() => {
      if (!root) return { x: 0.5, y: 0.35 };
      const rect = root.getBoundingClientRect();
      return {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      };
    })();

    confetti({ ...defaults, particleCount: 180, origin, scalar: 1.15 });
    window.setTimeout(() => {
      confetti({ ...defaults, particleCount: 140, origin, scalar: 1 });
    }, 250);
    window.setTimeout(() => {
      confetti({ ...defaults, particleCount: 120, origin, scalar: 0.85 });
    }, 500);
  }, []);

  const handleSpinComplete = useCallback(() => {
    if (prizeNumber === null) return;
    const winner = wheelParticipants[prizeNumber];
    if (winner) {
      setWheelWinner(winner);
      setSpinCount((count) => count + 1);
      launchConfetti();
    }
    setIsSpinning(false);
  }, [launchConfetti, prizeNumber, wheelParticipants]);

  const modeDescription: Record<RestockMode, string> = {
    consumption: "Assign duty to whoever drank the most this month.",
    schedule: "Follow a fixed monthly rotation that repeats over time.",
    wheel: "Let chance decide with a spin. Winner stays until you spin again.",
  };

  return (
    <div className="page finance-page">
      {error ? (
        <AlertBanner severity="critical" title="Finance data unavailable" description={error} />
      ) : null}

      <div className="finance-grid">
        <Card className="finance-consumption-card">
          <div className="finance-card__header">
            <div>
              <h2 className="finance-consumption__title">Consumption overview</h2>
              <p className="finance__muted">
                Based on fridge logs between {label}. Prices use current stock rates.
              </p>
            </div>
            <span className="pill">Live data</span>
          </div>

          <div className="finance-consumption__summary">
            <div>
              <p className="finance__muted">Units logged</p>
              <p className="finance-consumption__value">
                {isLoading ? "…" : `${formatUnits(totalUnits)} total`}
              </p>
            </div>
            <div>
              <p className="finance__muted">Estimated spend</p>
              <p className="finance-consumption__value">
                {isLoading ? "…" : formatCurrency(totalCost)}
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="finance__muted">Loading your consumption breakdown…</p>
          ) : !currentEntry ? (
            <p className="finance__muted">
              We couldn’t find your name on this month’s leaderboard yet. Log a drink to see the
              breakdown here.
            </p>
          ) : consumption.length === 0 ? (
            <p className="finance__muted">
              No drinks logged this month. Your costs will show up as soon as you start consuming.
            </p>
          ) : (
            <ul className="finance-consumption__list">
              {consumption.map((item) => (
                <li key={`${item.drinkId}-${item.drinkName}`} className="finance-consumption__item">
                  <div>
                    <p className="finance-consumption__drink">{item.drinkName}</p>
                    <p className="finance__muted">
                      × {formatUnits(item.units)} this month
                    </p>
                  </div>
                  <div className="finance-consumption__figures">
                    <span className="finance-consumption__at">@</span>
                    <span className="finance-consumption__price">{formatCurrency(item.totalCost)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="finance-total-card">
          <div className="finance-total-card__icon">
            <UiIcon name="housemates" variant="active" size={28} />
          </div>
          <p className="finance-total-card__label">You&apos;ve had</p>
          <p className="finance-total-card__primary">{isLoading ? "…" : formatUnits(totalUnits)}</p>
          <div className="finance-total-card__divider" aria-hidden="true" />
          <p className="finance-total-card__label">You owe</p>
          <p className="finance-total-card__total">{isLoading ? "…" : formatCurrency(totalCost)}</p>
        </Card>
      </div>

      <Card className="finance-restock-card">
        <div className="finance-card__header finance-restock__header">
          <div>
            <h2 className="finance-restock__title">Restock duty</h2>
            <p className="finance__muted">{modeDescription[restockMode]}</p>
            <p className="finance__muted">
              Switch modes to preview how you want to assign the next fridge run. This toggle will move to
              Settings later.
            </p>
          </div>

          <div className="finance-restock__meta">
            <div className="finance-restock__toggle" aria-label="Restock mode" role="status">
              <span className="finance-restock__current-mode">
                <UiIcon name="settings" variant="active" size={18} />
                Mode from Settings: {restockMode}
              </span>
            </div>
          </div>
        </div>

        {restockMode === "consumption" ? (
          <div className="finance-restock__body finance-restock__grid">
            <div className="finance-restock__panel finance-restock__panel--hero">
              <p className="finance__muted">Top consumer this month</p>
              <h3 className="finance-restock__assignee">
                {topEntry ? `${topEntry.username}!` : isLoading ? "Loading…" : "No data"}
              </h3>
              <p className="finance__muted">
                {topEntry
                  ? `${topEntry.username} is up for the next restock because they drank the most.`
                  : "Waiting for consumption data."}
              </p>
              {topEntry && runnerUp && runnerUp.totalUnits >= topEntry.totalUnits - 3 ? (
                <p className="finance-restock__subtext">
                  But {runnerUp.username} is catching up, only{" "}
                  {formatUnits(topEntry.totalUnits - runnerUp.totalUnits)} behind!
                </p>
              ) : null}
            </div>
            <div className="finance-restock__panel finance-restock__panel--secondary">
              <p className="finance__muted">Last month</p>
              <h3 className="finance-restock__assignee">
                {lastMonthAssignee?.username ?? (isLoading ? "Loading…" : "—")}
              </h3>
              <p className="finance__muted">Use this if you need to swap or skip the rotation.</p>
            </div>
          </div>
        ) : null}

        {restockMode === "schedule" ? (
          <div className="finance-restock__body finance-restock__grid">
            <div className="finance-restock__panel finance-restock__panel--hero">
              <p className="finance__muted">This month</p>
              <h3 className="finance-restock__assignee">
                {scheduleRotation?.current?.username ?? (isLoading ? "Loading…" : "—")}
              </h3>
              <p className="finance__muted">Rotation repeats monthly. Edit order in Settings later.</p>
            </div>
            <div className="finance-restock__panel finance-restock__panel--secondary">
              <p className="finance__muted">Last month</p>
              <h3 className="finance-restock__assignee">
                {scheduleRotation?.previous?.username ?? (isLoading ? "Loading…" : "—")}
              </h3>
            </div>
          </div>
        ) : null}

        {restockMode === "wheel" ? (
          <div className="finance-restock__body finance-restock__wheel-grid">
            <div className="finance-restock__panel finance-restock__panel--hero finance-restock__wheel-panel">
              <p className="finance__muted">Spin to decide the next restock</p>
              {wheelParticipants.length === 0 ? (
                <p className="finance__muted">Add participants to spin the wheel.</p>
              ) : (
                <div className="finance-restock__wheel-visual" ref={wheelRef}>
                  <Wheel
                    mustStartSpinning={isSpinning}
                    prizeNumber={prizeNumber ?? 0}
                    data={wheelParticipants.map((entry, index) => {
                      const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
                      return {
                        option: entry.username,
                        style: {
                          backgroundColor: color,
                          textColor: getWheelTextColor(color),
                          fontFamily: "Karla, sans-serif",
                        },
                      };
                    })}
                    radiusLineWidth={2}
                    radiusLineColor="#F7F2E9"
                    textDistance={60}
                    fontSize={16}
                    outerBorderWidth={6}
                    outerBorderColor="#E0D2C3"
                    innerBorderColor="#F7F2E9"
                    innerBorderWidth={4}
                    spinDuration={0.8}
                    startingOptionIndex={0}
                    onStopSpinning={handleSpinComplete}
                    perpendicularText
                  />
                </div>
              )}
              <div className="finance-restock__wheel-actions">
                <button
                  type="button"
                  className="btn btn--primary finance-restock__spin-btn"
                  onClick={handleSpinWheel}
                  disabled={wheelParticipants.length === 0 || isSpinning}
                >
                  {wheelWinner ? "Re-spin" : "Spin the wheel"}
                </button>
                <p className="finance-restock__assignee finance-restock__assignee--wheel">
                  {wheelWinner ? `${wheelWinner.username} is up next!` : "Who will it be?"}
                </p>
              </div>
            </div>
            <div className="finance-restock__panel finance-restock__panel--secondary finance-restock__history">
              <p className="finance__muted">Last month</p>
              <h3 className="finance-restock__assignee">
                {lastMonthAssignee?.username ?? (isLoading ? "Loading…" : "—")}
              </h3>
              <p className="finance__muted">
                Previous restocker sits out this spin so someone else can take a turn.
              </p>
              <div className="finance-restock__spin-counter">
                <p className="finance__muted">Spins this month</p>
                <strong>{spinCount}</strong>
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
