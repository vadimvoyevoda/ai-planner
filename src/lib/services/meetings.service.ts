import type { MeetingAcceptRequest, MeetingAcceptResponse } from "@/types";

export async function acceptProposal(data: MeetingAcceptRequest): Promise<MeetingAcceptResponse> {
  try {
    // Ensure all required fields have fallback values
    const requestData = {
      ...data,
      aiGeneratedNotes: data.aiGeneratedNotes || "",
      originalNote: data.originalNote || "",
    };
    
    // Log the request for debugging
    console.log("Sending meeting proposal acceptance:", {
      url: "/api/meeting-proposals/accept",
      method: "POST",
      contentType: "application/json",
      dataFields: Object.keys(requestData),
    });
    
    const response = await fetch("/api/meeting-proposals/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("Received response status:", response.status);
    
    // Handle different error status codes
    if (!response.ok) {
      let errorMessage = "Error accepting meeting proposal";
      
      try {
        const responseData = await response.json();
        console.log("Error response data:", responseData);
        
        // Specific error for disabled auth
        if (response.status === 403 && responseData.authDisabled) {
          errorMessage = "Akceptacja propozycji wymaga włączonego uwierzytelniania. Funkcja jest obecnie niedostępna.";
        } else if (responseData.error) {
          errorMessage = responseData.error;
          
          // Add details if available
          if (responseData.details) {
            console.error("Error details:", responseData.details);
            if (typeof responseData.details === 'string') {
              errorMessage += `: ${responseData.details}`;
            }
          }
        }
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        // Try to get text content if JSON parsing fails
        try {
          const textContent = await response.text();
          if (textContent) {
            errorMessage = textContent;
          }
        } catch (textError) {
          console.error("Failed to get error text:", textError);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse successful response
    try {
      const responseData = await response.json();
      console.log("Successful response data:", responseData);
      return responseData;
    } catch (parseError) {
      console.error("Failed to parse success response:", parseError);
      throw new Error("Failed to parse server response");
    }
  } catch (error) {
    console.error("Meeting proposal acceptance error:", error);
    throw error;
  }
}
