import type {
  CreateNotePayload,
  DashboardSummary,
  FridgeNote,
  LeaderboardEntry,
} from "../domain/types";

export interface BrewBuddyApi {
  getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary>;
  getNotes(signal?: AbortSignal): Promise<FridgeNote[]>;
  createNote(payload: CreateNotePayload): Promise<FridgeNote>;
  deleteNote(noteId: number): Promise<void>;
  getLeaderboard(
    params?: { from?: string; to?: string; signal?: AbortSignal },
  ): Promise<LeaderboardEntry[]>;
}
