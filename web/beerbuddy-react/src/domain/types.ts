export type UserId = number;

export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertMessage {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
}

export interface CompartmentStatus {
  id: number;
  title: string;
  status: string;
  description: string;
  percentage: number;
  currentUnits: number;
  targetUnits: number;
  pricePerUnit: number;
}

export interface DashboardSummary {
  currentUserName: string;
  overallStockPercentage: number;
  heroSummary: string;
  notificationCopy: string;
  nextTopUpCompartment: string;
  alerts: AlertMessage[];
  compartments: CompartmentStatus[];
}

export interface FridgeNote {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface CreateNotePayload {
  author: string;
  text: string;
}

export interface DrinkBreakdown {
  drinkId: number;
  drinkName: string;
  unitsTaken: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: UserId;
  username: string;
  totalUnits: number;
  drinks: DrinkBreakdown[];
}
