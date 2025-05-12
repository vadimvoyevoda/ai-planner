import type { MeetingAcceptRequest, MeetingAcceptResponse } from "@/types";

export async function acceptProposal(data: MeetingAcceptRequest): Promise<MeetingAcceptResponse> {
  const response = await fetch("/api/meeting-proposals/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error accepting meeting proposal");
  }

  return response.json();
}
