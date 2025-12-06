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
  "Top spot, fuelled almost entirely by {drink}.",
  "First place and on a first-name basis with {drink}.",
  "If {drink} had loyalty points, they’d own the program.",
  "Don't touch his {drink}, or deal with the consequences.",
  "House champion with a very firm opinion on {drink}.",
  "Everyone else enjoys {drink}; they built a life around it.",
  "Top of the board, bottom of the {drink} crate.",
  "{drink} is less a drink and more a personality trait here.",
  "At this point the fridge should automatically reserve a {drink} for them.",
  "Peak performance, powered entirely by {drink}.",
  "First place and barely pretending it’s not all {drink}.",
  "Signature move: open fridge, grab {drink}, stay on top.",
  "Lives here, thrives here, usually holding {drink}.",
  "owns a throne made of pure {drink}",
  "Their calendar probably has set {drink} time blocks.",
  "Big energy, bigger stack of finished {drink}.",
  "wishes we had {drink} on tap.",
  "borderline {drink} addict, and proud of it.",
];

const HIGH_RANK_MESSAGES: string[] = [
  "Podium finish with a soft spot for {drink}.",
  "Close to the crown, kept in the race by {drink}.",
  "Strong contender: just a couple of {drink} away from first.",
  "Fridge recognises the {drink} order before the door is open.",
  "Top-three energy with a clear bias toward {drink}.",
  "Near the top thanks to good-'ol {drink}.",
  "One solid {drink} streak away from first place.",
  "Podium vibes: lots of {drink}, lots of consistency.",
  "They’re the reason {drink} is always on the shopping list.",
  "Comfortably ahead, mostly on {drink}.",
  "Second nature: grab {drink}, check the leaderboard.",
  "A gentle reminder to stock extra {drink} for this user.",
  "Chasing gold with every {drink} pull.",
  "Their {drink} count has a fan club.",
  "Middle of the podium, heavy on {drink}.",
  "A couple more {drink} and the crown is in reach.",
  "Half the story this month is {drink}.",
  "Podium seat reserved thanks to {drink}.",
];

const MID_RANK_MESSAGES: string[] = [
  "Balanced fridge life with a reliable {drink} habit.",
  "Middle lane, steady and loyal to {drink}.",
  "Shows up often enough that {drink} needs restocking now and then.",
  "Keeps things moderate: a few {drink}, then back to business.",
  "A calm, steady {drink} presence in the stats.",
  "Regular visits, usually ending with {drink}.",
  "Not first, not last, but still firmly committed to {drink}.",
  "This month reads: life, work, {drink}, repeat.",
  "Middle of the board, comfortable with {drink}.",
  "They grab {drink} when it counts and keep cruising.",
  "Consistent enough that {drink} is never idle.",
  "The fridge knows their footsteps and their {drink} choice.",
  "Some weeks spike, some chill — {drink} is the constant.",
  "could use a few more {drink}, but overall steady performance.",
  "Even pacing: just enough {drink} to be known.",
  "Their shelf? The one with {drink} missing here and there.",
  "Steady hands, steady {drink} count.",
  "A handful of {drink}, a handful of good times.",
];

const LOW_RANK_MESSAGES: string[] = [
  "Light {drink} usage detected — the fridge approves.",
  "Technically a {drink} fan, just not a loud one.",
  "Just enough {drink} to show up on the radar.",
  "Low volume, good taste: {drink} in careful doses.",
  "Knows where the {drink} lives but chooses restraint.",
  "Very relaxed relationship with {drink}.",
  "Fridge tourist with a clear {drink} preference.",
  "Blink and you’ll miss their {drink} logs.",
  "Staying humble on {drink} this month.",
  "One or two {drink} runs, then back to chill mode.",
  "The fridge remembers the occasional {drink} hello.",
  "Not much {drink}, but enough to have a favourite.",
  "Quiet month; {drink} politely knocked and left.",
  "{drink} showed up, but not often enough to make noise.",
  "taking a break, just a few {drink} this month.",
  "Shows up for {drink} when the mood hits.",
  "The {drink} shelf *barely* notices.",
  "finally some self control.",
  "Drifted by, picked up {drink}, went on with the day.",
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
  "Mix and match month: no single drink stole the show.",
  "Exploring flavours, keeping the stats guessing.",
  "Variety pack energy — no stand-out favourite yet.",
  "Plenty of browsing, light on commitment.",
  "Sampler flight approach: one of each, please.",
  "Every shelf gets a turn; no hero drink crowned.",
  "Curious palette, flexible fridge routine.",
  "Enjoys the options, resists picking a favourite.",
  "Rotation mode on; no clear frontrunner.",
  "Keeping the fridge on its toes with variety.",
];

const ZERO_USAGE_MESSAGES: string[] = [
  "Did not touch the fridge. Legendary self-control or just forgot their NFC tag.",
  "somehow surviving on vibes and tap water alone.",
  "No fridge logs. Maybe they live on takeout.",
  "The only person not bullying the sensors this month.",
  "Either very healthy or very suspicious. No in-between.",
  "No visits recorded. Might be secretly running a second fridge.",
  "No drinks taken? Carefull, they might have a personal stash.",
  "The fridge door never opened for this one.",
  "sitting this one out, huh?",
  "Ambitious plan: let everyone else pay for the restock.",
  "Statistically invisible.",
  "Untouched by caffeine and sugar (according to the data).",
  "Seems to know the fridge exists, chooses not to prove it.",
  "No evidence of any favourites. Or any drinks, really.",
  "Managed a full month without triggering a single sensor.",
  "True spectator mode: watching the leaderboard from the sidelines.",
  "Perfect score in “not it” for restock duty.",
  "Possibly the designated driver of the household.",
  "The calm at the bottom of the page.",
  "Saved the most money by doing absolutely nothing here.",
  "Untouched stats. The fridge is still waiting for a first move.",
  "Still loading… or just never opened the door.",
  "Officially the quietest member of the fridge club.",
  "Made eye contact with the fridge and walked away.",
  "Perhaps living off tap water and good intentions.",
  "having a stare-down with the fridge, but not opening it.",
  "Might actually be an AI and not an actual user.",
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

function getPlacementMessage(entry: LeaderboardEntry, offset = 0): string {
  const drinkName = getTopDrinkName(entry);
  const totalUnits = entry.totalUnits;
  const baseSeed =
    entry.rank * 31 + (entry.userId ?? 0) * 17 + (drinkName?.length ?? 0) + offset * 101;

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
  const [messageSeedOffset, setMessageSeedOffset] = useState(0);

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

  const rerollMessages = () => setMessageSeedOffset((value) => (value + 1) % 10_000);

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
              <div
                className="leaderboard__cell leaderboard__cell--label leaderboard__cell--interactive"
                role="columnheader"
                tabIndex={0}
                onClick={rerollMessages}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    rerollMessages();
                  }
                }}
                aria-label="User column (click to shuffle messages)"
              >
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
                  <p className="leaderboard__breakdown-hint">
                    {getPlacementMessage(entry, messageSeedOffset)}
                  </p>
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
