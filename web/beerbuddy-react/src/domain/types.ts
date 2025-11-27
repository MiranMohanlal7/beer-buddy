/**
 * Shared domain types for Brew Buddy dashboard.
 */
export type DrinkCategoryId = string;
export type UserId = string;

export interface User {
  id: UserId;
  name: string;
}

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
