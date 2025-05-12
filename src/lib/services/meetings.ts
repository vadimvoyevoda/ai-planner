import { z } from "zod";
import type { Meeting, MeetingFilters } from "@/types";

const API_BASE = "/api/meetings";

const meetingResponseSchema = z.object({
  meetings: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      category: z.object({
        id: z.string(),
        name: z.string(),
        suggested_attire: z.string().nullable(),
      }),
      startTime: z.string(),
      endTime: z.string(),
      locationName: z.string().nullable(),
      coordinates: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional()
        .nullable(),
      aiGenerated: z.boolean(),
      originalNote: z.string().nullable(),
      aiGeneratedNotes: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
      userId: z.string(),
    })
  ),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
});

interface GetMeetingsOptions {
  upcoming?: boolean;
  page?: number;
  limit?: number;
}

interface GetMeetingsResponse {
  meetings: Meeting[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export async function getMeetings(options: GetMeetingsOptions = {}): Promise<GetMeetingsResponse> {
  const searchParams = new URLSearchParams();

  if (options.upcoming) {
    searchParams.append("upcoming", "true");
  }

  if (options.page) {
    searchParams.append("page", options.page.toString());
  }

  if (options.limit) {
    searchParams.append("limit", options.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }

  return response.json();
}

export async function getUpcomingMeetings(limit = 5): Promise<Meeting[]> {
  const { meetings } = await getMeetings({ upcoming: true, limit });
  return meetings;
}

export async function deleteMeeting(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete meeting");
  }
}

export async function exportMeeting(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}/export`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to export meeting");
  }
}

export async function generateMeetingSuggestions(note: string): Promise<{ meetings: Meeting[] }> {
  const response = await fetch(`${API_BASE}/suggestions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ note }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate meeting suggestions");
  }

  return response.json();
}
