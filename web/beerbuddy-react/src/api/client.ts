import type {
  CreateNotePayload,
  DashboardSummary,
  FridgeNote,
} from "../domain/types";

export interface BrewBuddyApi {
  getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary>;
  getNotes(signal?: AbortSignal): Promise<FridgeNote[]>;
  createNote(payload: CreateNotePayload): Promise<FridgeNote>;
  deleteNote(noteId: number): Promise<void>;
}
