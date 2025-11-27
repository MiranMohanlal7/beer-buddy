import type { BrewBuddyApi } from "./client";
import type {
  DashboardSummary,
  FridgeNote,
  CreateNotePayload,
} from "../domain/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5151/api";

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

export const placeholderApiClient: BrewBuddyApi = {
  async getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
    return request<DashboardSummary>("/dashboard/summary", { signal });
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
};
