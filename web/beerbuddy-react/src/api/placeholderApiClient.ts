import type { BrewBuddyApi } from "./client";
import type {
  DashboardSummary,
  FridgeNote,
  CreateNotePayload,
  AlertMessage,
  CompartmentStatus,
  AlertSeverity,
  LeaderboardEntry,
  DrinkBreakdown,
} from "../domain/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5151/api";

const ALERT_SEVERITIES: AlertSeverity[] = ["info", "warning", "critical"];

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function normalizeSeverity(value: unknown): AlertSeverity {
  if (typeof value === "string" && ALERT_SEVERITIES.includes(value as AlertSeverity)) {
    return value as AlertSeverity;
  }
  return "info";
}

function normalizeAlert(raw: unknown, index: number): AlertMessage {
  const candidate = (raw ?? {}) as Record<string, unknown>;
  const idValue = candidate.id ?? candidate.Id;
  const titleValue = candidate.title ?? candidate.Title;
  const descriptionValue = candidate.description ?? candidate.Description;
  const severityValue = candidate.severity ?? candidate.Severity;

  return {
    id: toStringValue(idValue, `alert-${index}`),
    title: toStringValue(titleValue, "Fridge update"),
    description: toStringValue(descriptionValue),
    severity: normalizeSeverity(severityValue),
  };
}

function normalizeCompartment(raw: unknown): CompartmentStatus {
  const candidate = (raw ?? {}) as Record<string, unknown>;
  const id = toNumber(candidate.id ?? candidate.Id);
  const titleValue = candidate.title ?? candidate.Title;
  const statusValue = candidate.status ?? candidate.Status;
  const descriptionValue = candidate.description ?? candidate.Description;
  const percentageValue = candidate.percentage ?? candidate.Percentage;
  const currentUnitsValue = candidate.currentUnits ?? candidate.CurrentUnits;
  const targetUnitsValue = candidate.targetUnits ?? candidate.TargetUnits;
  const priceValue = candidate.pricePerUnit ?? candidate.PricePerUnit;
  const finalDescription = toStringValue(descriptionValue).trim();

  return {
    id,
    title: toStringValue(
      titleValue,
      id ? `Compartment ${id}` : "Compartment",
    ),
    status: toStringValue(statusValue, "Status unavailable"),
    description: finalDescription,
    percentage: toNumber(percentageValue),
    currentUnits: toNumber(currentUnitsValue),
    targetUnits: toNumber(targetUnitsValue),
    pricePerUnit: toNumber(priceValue),
  };
}

function normalizeDrinkBreakdown(raw: unknown, index: number): DrinkBreakdown {
  const candidate = (raw ?? {}) as Record<string, unknown>;
  const drinkId = toNumber(candidate.drinkId ?? candidate.DrinkId ?? candidate.id ?? candidate.Id);
  const drinkName = toStringValue(
    candidate.drinkName ?? candidate.DrinkName ?? candidate.name ?? candidate.Name,
    drinkId ? `Drink ${drinkId}` : `Drink ${index + 1}`,
  );

  return {
    drinkId,
    drinkName,
    unitsTaken: toNumber(candidate.unitsTaken ?? candidate.UnitsTaken ?? candidate.units ?? candidate.Units),
  };
}

function normalizeLeaderboardEntry(raw: unknown, index: number): LeaderboardEntry {
  const candidate = (raw ?? {}) as Record<string, unknown>;
  const drinksSource = candidate.drinks ?? candidate.Drinks;
  const userId = toNumber(candidate.userId ?? candidate.UserId);

  const drinks = Array.isArray(drinksSource)
    ? drinksSource.map((drink, drinkIndex) => normalizeDrinkBreakdown(drink, drinkIndex))
    : [];

  return {
    rank: toNumber(candidate.rank ?? candidate.Rank, index + 1),
    userId,
    username: toStringValue(candidate.username ?? candidate.Username, "Unknown drinker"),
    totalUnits: toNumber(candidate.totalUnits ?? candidate.TotalUnits),
    drinks,
  };
}

function normalizeDashboardSummary(payload: unknown): DashboardSummary {
  const raw = (payload ?? {}) as Record<string, unknown>;
  const alertsSource = raw.alerts ?? raw["Alerts"];
  const compartmentsSource = raw.compartments ?? raw["Compartments"];

  const alerts = Array.isArray(alertsSource)
    ? alertsSource.map((alert, index) => normalizeAlert(alert, index))
    : [];
  const compartments = Array.isArray(compartmentsSource)
    ? compartmentsSource.map((slot) => normalizeCompartment(slot))
    : [];

  return {
    currentUserName: toStringValue(raw.currentUserName ?? raw["CurrentUserName"], "Brew buddy"),
    overallStockPercentage: toNumber(
      raw.overallStockPercentage ?? raw["OverallStockPercentage"],
    ),
    heroSummary: toStringValue(raw.heroSummary ?? raw["HeroSummary"]),
    notificationCopy: toStringValue(raw.notificationCopy ?? raw["NotificationCopy"]),
    nextTopUpCompartment: toStringValue(
      raw.nextTopUpCompartment ?? raw["NextTopUpCompartment"],
      "Awaiting data",
    ),
    alerts,
    compartments,
  };
}

function normalizeLeaderboard(payload: unknown): LeaderboardEntry[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((entry, index) => normalizeLeaderboardEntry(entry, index));
}

export const placeholderApiClient: BrewBuddyApi = {
  async getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
    const payload = await request<unknown>("/dashboard/summary", { signal });
    return normalizeDashboardSummary(payload);
  },

  async getNotes(signal?: AbortSignal): Promise<FridgeNote[]> {
    return request<FridgeNote[]>("/notes", { signal });
  },

  async createNote(payload: CreateNotePayload): Promise<FridgeNote> {
    return request<FridgeNote>("/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async deleteNote(noteId: number): Promise<void> {
    await request<void>(`/notes/${noteId}`, { method: "DELETE" });
  },

  async getLeaderboard(params?: { from?: string; to?: string; signal?: AbortSignal }) {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set("from", params.from);
    if (params?.to) searchParams.set("to", params.to);
    const query = searchParams.toString();
    const path = query ? `/leaderboard?${query}` : "/leaderboard";

    const payload = await request<unknown>(path, { signal: params?.signal });
    return normalizeLeaderboard(payload);
  },
};
