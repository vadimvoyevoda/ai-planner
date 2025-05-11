import type {
  MeetingProposalRequest,
  MeetingProposalsResponse,
  MeetingAcceptRequest,
  MeetingAcceptResponse,
} from "../../types";

/**
 * Generates meeting proposals based on a note, optional location and duration
 */
export async function generateProposals(data: MeetingProposalRequest): Promise<MeetingProposalsResponse> {
  const response = await fetch("/api/meeting-proposals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error generating meeting proposals");
  }

  return response.json();
}

/**
 * Accepts a meeting proposal and creates a meeting
 */
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
