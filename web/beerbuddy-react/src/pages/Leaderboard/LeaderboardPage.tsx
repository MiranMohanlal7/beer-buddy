import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { useApi } from "../../api/ApiProvider";
import type { LeaderboardEntry } from "../../domain/types";
import { getCurrentMonthRange } from "../../services/dateRanges";

const REFRESH_INTERVAL_MS = 30_000;

function getTopDrinkName(entry: LeaderboardEntry): string | undefined {
  if (!entry.drinks || entry.drinks.length === 0) {
    return undefined;
  }
  return entry.drinks[0]?.drinkName || undefined;
}

const TOP_RANK_MESSAGES: string[] = [
  "The fridge has very strong opinions about their love for {drink}.",
  "Top spot, same order every time: {drink}.",
  "Everyone else drinks {drink}. This one submits a thesis on it.",
  "First place and probably on a first-name basis with {drink}.",
  "If {drink} had a frequent flyer program, they’d be platinum.",
  "The fridge light turns on and just assumes it’s time for {drink}.",
  "Top of the board, bottom of the {drink} crate.",
  "{drink} is less a drink and more a personality trait here.",
  "House champion. Also house {drink} problem.",
  "At this point the fridge should auto-reserve {drink} for them.",
  "The kind of {drink} history you only see in screenshots.",
  "Everyone else “likes” {drink}. This one “is” {drink}.",
  "First place and barely pretending it’s not because of {drink}.",
  "The sensors roll their eyes when more {drink} goes missing.",
  "Peak performance, powered entirely by {drink}.",
];

const HIGH_RANK_MESSAGES: string[] = [
  "Comfortably on the podium, fuelled mostly by {drink}.",
  "Strong {drink} form — just shy of the spotlight.",
  "The fridge definitely recognises this {drink} order.",
  "Close enough to first that the {drink} jokes have started.",
  "One or two fridge raids away from the crown, all thanks to {drink}.",
  "Sneaky contender, quietly stacking {drink} sessions.",
  "Top-three energy with a clear bias toward {drink}.",
  "Podium spot, absolutely loyal to {drink}.",
  "Very serious about {drink}, slightly less serious about slowing down.",
  "Reliable {drink} presence whenever the door opens.",
];

const MID_RANK_MESSAGES: string[] = [
  "Middle of the board, emotionally attached to {drink}.",
  "Balanced fridge life with a soft spot for {drink}.",
  "Shows up often enough that {drink} needs restocking now and then.",
  "{drink} isn’t a problem yet, but the trendline has opinions.",
  "A calm, steady {drink} presence in the stats.",
  "Middle-lane cruising, always making time for {drink}.",
  "Not first, not last, firmly committed to {drink}.",
  "The kind of {drink} history that says “I live here”.",
  "Fridge usage: moderate. Feelings about {drink}: not moderate.",
  "Spotted regularly at the fridge, usually near the {drink}.",
];

const LOW_RANK_MESSAGES: string[] = [
  "Light {drink} usage detected — the fridge approves.",
  "Technically a {drink} fan, just not a loud one.",
  "Just enough {drink} to show up on the radar.",
  "Low volume, good taste: {drink} in careful doses.",
  "Knows where the {drink} lives, chooses restraint.",
  "Very relaxed relationship with {drink}.",
  "Fridge tourist with a clear {drink} preference.",
  "Blink and you’ll miss their {drink} logs.",
  "Just warming up — {drink} is clearly the warm-up act.",
  "Staying humble on {drink} this month.",
];

const GENERIC_MESSAGES: string[] = [
  "No clear signature drink yet. Fridge is still guessing.",
  "Bit of everything, master of none (so far).",
  "Data shows variety, not a favourite — yet.",
  "Sampling the menu instead of marrying one drink.",
  "Trying things out. The fridge approves of the curiosity.",
  "A generalist: every shelf gets a little attention.",
  "Quiet month on the units, loud month elsewhere.",
  "Hard to pin down — the fridge can’t predict the next choice.",
  "Light usage with no strong allegiance so far.",
  "Taking it slow. The board will remember this pacing later.",
];

const ZERO_USAGE_MESSAGES: string[] = [
  "Did not touch the fridge. Legendary self-control or forgot the PIN.",
  "Possibly surviving on vibes and tap water alone.",
  "No fridge logs. Maybe they live on takeout.",
  "The only person not bullying the sensors this month.",
  "Either very healthy or very suspicious. No in-between.",
  "No visits recorded. Might be secretly running a second fridge.",
  "The fridge door never opened for this one.",
  "Ambitious plan: let everyone else pay for the restock.",
  "Statistically invisible. Emotionally important.",
  "Untouched by caffeine and sugar (according to the data).",
  "Seems to know the fridge exists, chooses not to prove it.",
  "No evidence of any favourites. Or any drinks, really.",
  "Managed a full month without triggering a single sensor.",
  "True spectator mode: watching the leaderboard from the sidelines.",
  "Fridge freeloader in theory only — zero actual logs.",
  "Perfect score in “not it” for dish duty.",
  "Possibly the designated driver of the household.",
  "The calm at the bottom of the stats page.",
  "Saved the most money by doing absolutely nothing here.",
  "Untouched stats. The fridge is still waiting for a first move.",
];

function pickMessage(
  templates: string[],
  seed: number,
  fallback: string,
  drinkName?: string,
  totalUnits?: number,
): string {
  if (templates.length === 0) {
    return fallback;
  }
  const index = Math.abs(seed) % templates.length;
  const template = templates[index];
  const drink = drinkName ?? "their favourite drink";
  const total = totalUnits ?? 0;
  return template.replace("{drink}", drink).replace("{total}", String(total));
}

function getPlacementMessage(entry: LeaderboardEntry): string {
  const drinkName = getTopDrinkName(entry);
  const totalUnits = entry.totalUnits;
  const baseSeed = entry.rank * 31 + (entry.userId ?? 0) * 17 + (drinkName?.length ?? 0);

  if (totalUnits <= 0) {
    return pickMessage(
      ZERO_USAGE_MESSAGES,
      baseSeed,
      "No drinks recorded yet this month.",
      drinkName,
      totalUnits,
    );
  }

  if (!drinkName) {
    return pickMessage(
      GENERIC_MESSAGES,
      baseSeed,
      "No clear favourite yet — the fridge is still guessing.",
      undefined,
      totalUnits,
    );
  }

  if (entry.rank === 1) {
    return pickMessage(
      TOP_RANK_MESSAGES,
      baseSeed,
      "Top spot secured with a serious taste for their favourite drink.",
      drinkName,
      totalUnits,
    );
  }

  if (entry.rank === 2 || entry.rank === 3) {
    return pickMessage(
      HIGH_RANK_MESSAGES,
      baseSeed,
      "Solid podium position powered by their favourite drink.",
      drinkName,
      totalUnits,
    );
  }

  if (entry.rank >= 4 && entry.rank <= 7) {
    return pickMessage(
      MID_RANK_MESSAGES,
      baseSeed,
      "Holding a steady middle spot with a balanced fridge relationship.",
      drinkName,
      totalUnits,
    );
  }

  return pickMessage(
    LOW_RANK_MESSAGES,
    baseSeed,
    "Hanging out near the bottom of the board with a minimalist approach.",
    drinkName,
    totalUnits,
  );
}

export function LeaderboardPage() {
  const api = useApi();
  const [{ fromIso, toIso, label }] = useState(getCurrentMonthRange);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timezoneLabel = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "local time",
    [],
  );

  useEffect(() => {
    let controller: AbortController | null = null;

    const fetchLeaderboard = async (withLoadingState = true) => {
      controller?.abort();
      const nextController = new AbortController();
      controller = nextController;

      if (withLoadingState) {
        setIsLoading(true);
      }

      try {
        const result = await api.getLeaderboard({
          from: fromIso,
          to: toIso,
          signal: nextController.signal,
        });
        if (!nextController.signal.aborted) {
          setEntries(result);
          setError(null);
        }
      } catch (err) {
        if (nextController.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn’t load the leaderboard just now.";
        setError(message);
      } finally {
        if (!nextController.signal.aborted && withLoadingState) {
          setIsLoading(false);
        }
      }
    };

    void fetchLeaderboard();
    const intervalId = window.setInterval(() => {
      void fetchLeaderboard(false);
    }, REFRESH_INTERVAL_MS);

    return () => {
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, [api, fromIso, toIso]);

  return (
    <div className="page leaderboard-page">
      <Card className="leaderboard-card">
        <div className="leaderboard-card__header">
          <div>
            <p className="eyebrow">Consumption tracker</p>
            <h2 className="leaderboard-card__title">Leaderboard</h2>
            <p className="leaderboard__muted">
              Ranked by total units taken between {label} ({timezoneLabel}).
              Hover the totals to see the drink mix per person.
            </p>
          </div>
          <div className="leaderboard-card__meta">
            <span className="pill">Live data</span>
          </div>
        </div>

        {error ? (
          <AlertBanner
            severity="critical"
            title="Leaderboard unavailable"
            description={error}
          />
        ) : null}

        {isLoading ? (
          <p className="leaderboard__muted">Loading leaderboard…</p>
        ) : entries.length === 0 ? (
          <p className="leaderboard__empty">
            No drinks have been logged this month yet. The board will populate automatically
            as soon as someone opens the fridge.
          </p>
        ) : (
          <div className="leaderboard-table" role="table" aria-label="Monthly drink leaderboard">
            <div className="leaderboard-row leaderboard-row--head" role="row">
              <div className="leaderboard__cell leaderboard__cell--label" role="columnheader">
                Rank
              </div>
              <div className="leaderboard__cell leaderboard__cell--label" role="columnheader">
                User
              </div>
              <div className="leaderboard__cell leaderboard__cell--label leaderboard__cell--align-right" role="columnheader">
                Total units
              </div>
            </div>

            {entries.map((entry) => (
              <div
                key={entry.userId}
                className={`leaderboard-row ${entry.rank === 1 ? "leaderboard-row--first" : ""}`.trim()}
                role="row"
              >
                <div className="leaderboard__cell leaderboard__rank" role="cell" aria-label={`Rank ${entry.rank}`}>
                  #{entry.rank}
                </div>
              <div className="leaderboard__cell leaderboard__user" role="cell">
                <strong>{entry.username}</strong>
                  <p className="leaderboard__breakdown-hint">{getPlacementMessage(entry)}</p>
              </div>
                <div className="leaderboard__cell leaderboard__cell--align-right" role="cell">
                  <div className="leaderboard__total-wrapper">
                    <span
                      className="leaderboard__total"
                      tabIndex={entry.drinks.length > 0 ? 0 : -1}
                      aria-describedby={
                        entry.drinks.length > 0 ? `breakdown-${entry.userId}` : undefined
                      }
                    >
                      {entry.totalUnits}
                      <span className="leaderboard__total-unit">units</span>
                    </span>

                    {entry.drinks.length > 0 ? (
                      <div
                        className="leaderboard__breakdown"
                        role="tooltip"
                        id={`breakdown-${entry.userId}`}
                      >
                        <p className="leaderboard__breakdown-title">This month&apos;s mix</p>
                        <ul className="leaderboard__breakdown-list">
                          {entry.drinks.map((drink) => (
                            <li key={`${entry.userId}-${drink.drinkId}`} className="leaderboard__breakdown-item">
                              <span>{drink.drinkName}</span>
                              <span className="leaderboard__breakdown-units">
                                {drink.unitsTaken} units
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
