import type { APIRoute } from "astro";
import type { MeetingAcceptRequest, MeetingAcceptResponse } from "../../../types";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as MeetingAcceptRequest;

    // Walidacja danych wejściowych
    if (!body.startTime || !body.endTime || !body.title || !body.categoryId) {
      return new Response(JSON.stringify({ message: "Brakujące wymagane pola" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Symulacja wykrycia konfliktów w 50% przypadków
    const hasConflicts = Math.random() > 0.5;

    // Mock odpowiedzi
    const response: MeetingAcceptResponse = {
      id: crypto.randomUUID(),
      title: body.title,
      description: body.description,
      category: {
        id: body.categoryId,
        name: getCategoryName(body.categoryId),
        suggestedAttire: getSuggestedAttire(body.categoryId),
      },
      startTime: body.startTime,
      endTime: body.endTime,
      locationName: body.locationName,
      aiGenerated: true,
      originalNote: body.originalNote,
      aiGeneratedNotes: body.aiGeneratedNotes,
      createdAt: new Date().toISOString(),
      // Symulowane konflikty
      conflicts: hasConflicts
        ? [
            {
              id: crypto.randomUUID(),
              title: "Istniejące spotkanie",
              startTime: body.startTime,
              endTime: new Date(new Date(body.startTime).getTime() + 30 * 60000).toISOString(),
            },
          ]
        : undefined,
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error accepting meeting proposal:", error);
    return new Response(JSON.stringify({ message: "Wystąpił błąd podczas akceptacji propozycji spotkania" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Pomocnicze funkcje do generowania danych
function getCategoryName(categoryId: string): string {
  const categories: Record<string, string> = {
    "1": "Biznes",
    "2": "Networking",
    "3": "Konsultacja",
    "4": "Prywatne",
  };

  return categories[categoryId] || "Inne";
}

function getSuggestedAttire(categoryId: string): string {
  const attires: Record<string, string> = {
    "1": "Formalny",
    "2": "Smart casual",
    "3": "Casual",
    "4": "Elegancki",
  };

  return attires[categoryId] || "Casual";
}
