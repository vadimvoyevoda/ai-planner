import type { NoteAnalysisResponseDto } from "../../types";

declare module "./ai.service" {
  export function analyze_note(note: string): Promise<NoteAnalysisResponseDto>;
}
