import type { MeetingAcceptRequest, MeetingAcceptResponse } from "@/types";

export async function acceptProposal(data: MeetingAcceptRequest): Promise<MeetingAcceptResponse> {
  const response = await fetch("/api/meeting-proposals/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    // Specific error for disabled auth
    if (response.status === 403 && responseData.authDisabled) {
      throw new Error("Akceptacja propozycji wymaga włączonego uwierzytelniania. Funkcja jest obecnie niedostępna.");
    }
    
    // Other errors
    throw new Error(responseData.error || "Error accepting meeting proposal");
  }

  return responseData;
}
