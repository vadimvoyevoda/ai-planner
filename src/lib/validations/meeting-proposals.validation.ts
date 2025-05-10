import { z } from "zod";

export const meeting_proposals_schema = z.object({
  note: z.string().min(1, "Notatka jest wymagana"),
  location_name: z.string().min(1, "Lokalizacja jest wymagana"),
  estimated_duration: z.number().positive().optional(),
});
