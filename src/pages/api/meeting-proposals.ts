import type { APIRoute } from "astro";
import type { MeetingProposalRequest, MeetingProposalsResponse } from "../../types";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as MeetingProposalRequest;

    // Walidacja danych wejściowych
    if (!body.note || body.note.trim() === "") {
      return new Response(JSON.stringify({ message: "Notatka jest wymagana" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Analiza notatki w celu wykrycia kategorii i preferencji czasowych
    const { category, preferredTime, isDinner, isAnniversary, hasPersonalContent } = analyzeNote(body.note);

    // Get current date and time
    const now = new Date();

    // Utwórz bazową godzinę na podstawie preferencji
    const baseHour = preferredTime ? preferredTime : isDinner ? 18 : 12;

    // Przygotuj propozycje na różne dni z uwzględnieniem preferencji czasowych
    const proposals = [];

    // Pierwsza propozycja - uwzględniająca preferencje czasowe
    const firstProposalDate = new Date(now);
    firstProposalDate.setDate(firstProposalDate.getDate() + 1); // jutro
    firstProposalDate.setHours(baseHour, 0, 0, 0);

    let title = "";
    let categoryId = "";
    let categoryName = "";
    let suggestedAttire = "";
    let description = "";
    let locationName = body.locationName || "";

    // Określenie kategorii i szczegółów na podstawie analizy
    if (isAnniversary) {
      title = "Rocznica ślubu";
      categoryId = "4";
      categoryName = "Prywatne";
      suggestedAttire = "Elegancki";
      description = "Specjalna okazja - rocznica ślubu";
      locationName = locationName || "Restauracja";
    } else if (hasPersonalContent) {
      title = "Spotkanie prywatne";
      categoryId = "4";
      categoryName = "Prywatne";
      suggestedAttire = "Casual";
      description = "Spotkanie prywatne z bliskimi";
      locationName = locationName || "Do ustalenia";
    } else if (isDinner) {
      title = "Kolacja biznesowa";
      categoryId = "2";
      categoryName = "Networking";
      suggestedAttire = "Smart casual";
      description = "Spotkanie przy kolacji w celach biznesowych";
      locationName = locationName || "Restauracja";
    } else if (category === "konsultacja") {
      title = "Konsultacja";
      categoryId = "3";
      categoryName = "Konsultacja";
      suggestedAttire = "Casual";
      description = "Krótkie spotkanie konsultacyjne";
      locationName = locationName || "Biuro";
    } else {
      title = "Spotkanie biznesowe";
      categoryId = "1";
      categoryName = "Biznes";
      suggestedAttire = "Formalny";
      description = "Regularne spotkanie biznesowe";
      locationName = locationName || "Biuro";
    }

    // Dodanie pierwszej propozycji z preferowaną godziną
    proposals.push({
      startTime: firstProposalDate.toISOString(),
      endTime: new Date(firstProposalDate.getTime() + 90 * 60 * 1000).toISOString(), // +1.5h
      title,
      description,
      categoryId,
      categoryName,
      suggestedAttire,
      locationName,
      aiGeneratedNotes: `Na podstawie Twojej notatki proponuję ${title.toLowerCase()} na ${formatPolishDate(firstProposalDate)} o godzinie ${firstProposalDate.getHours()}:00.`,
      originalNote: body.note,
    });

    // Druga propozycja - inny dzień, ta sama godzina
    const secondProposalDate = new Date(firstProposalDate);
    secondProposalDate.setDate(secondProposalDate.getDate() + 1); // pojutrze

    proposals.push({
      startTime: secondProposalDate.toISOString(),
      endTime: new Date(secondProposalDate.getTime() + 90 * 60 * 1000).toISOString(), // +1.5h
      title,
      description,
      categoryId,
      categoryName,
      suggestedAttire,
      locationName,
      aiGeneratedNotes: `Alternatywnie, proponuję ${title.toLowerCase()} na ${formatPolishDate(secondProposalDate)} o godzinie ${secondProposalDate.getHours()}:00.`,
      originalNote: body.note,
    });

    // Trzecia propozycja - inna godzina (30 min później)
    const thirdProposalDate = new Date(firstProposalDate);
    thirdProposalDate.setDate(thirdProposalDate.getDate() + 2); // za 3 dni
    thirdProposalDate.setMinutes(30); // 30 minut po pełnej godzinie

    proposals.push({
      startTime: thirdProposalDate.toISOString(),
      endTime: new Date(thirdProposalDate.getTime() + 90 * 60 * 1000).toISOString(), // +1.5h
      title,
      description,
      categoryId,
      categoryName,
      suggestedAttire,
      locationName,
      aiGeneratedNotes: `Jako trzecią opcję proponuję ${title.toLowerCase()} na ${formatPolishDate(thirdProposalDate)} o godzinie ${thirdProposalDate.getHours()}:${thirdProposalDate.getMinutes() === 0 ? "00" : thirdProposalDate.getMinutes()}.`,
      originalNote: body.note,
    });

    const response: MeetingProposalsResponse = {
      proposals: proposals,
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error generating meeting proposals:", error);
    return new Response(JSON.stringify({ message: "Wystąpił błąd podczas generowania propozycji spotkań" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Funkcja analizująca notatkę w celu wykrycia preferencji
function analyzeNote(note: string): {
  category: string;
  preferredTime: number | null;
  isDinner: boolean;
  isAnniversary: boolean;
  hasPersonalContent: boolean;
} {
  const lowerNote = note.toLowerCase();

  // Analiza kategorii
  let category = "biznes";
  if (lowerNote.includes("konsultacja") || lowerNote.includes("porada") || lowerNote.includes("doradztwo")) {
    category = "konsultacja";
  } else if (
    lowerNote.includes("lunch") ||
    lowerNote.includes("obiad") ||
    lowerNote.includes("kolacja") ||
    lowerNote.includes("restauracja")
  ) {
    category = "networking";
  }

  // Sprawdzenie czy spotkanie dotyczy spraw prywatnych
  const isAnniversary =
    lowerNote.includes("rocznica") ||
    lowerNote.includes("jubileusz") ||
    (lowerNote.includes("ślub") && lowerNote.includes("roczn"));

  const hasPersonalContent =
    lowerNote.includes("żona") ||
    lowerNote.includes("mąż") ||
    lowerNote.includes("rodzina") ||
    lowerNote.includes("dzieci") ||
    lowerNote.includes("przyjaciel") ||
    lowerNote.includes("osobist") ||
    lowerNote.includes("prywat");

  // Sprawdzenie czy to kolacja
  const isDinner =
    lowerNote.includes("kolacja") ||
    lowerNote.includes("wieczór") ||
    lowerNote.includes("wieczorem") ||
    lowerNote.includes("18:") ||
    lowerNote.includes("19:") ||
    lowerNote.includes("20:");

  // Wykrywanie preferowanej godziny
  let preferredTime: number | null = null;

  // Sprawdzanie różnych formatów godzin (np. "18:00", "o 15", "o godzinie 9")
  const timeRegex =
    /\b(\d{1,2})[:.]?(\d{0,2})\b|\bo\s+(\d{1,2})[:.]?(\d{0,2})?\b|\bgodzin[aieę]\s+(\d{1,2})[:.]?(\d{0,2})?\b/g;
  let match;

  while ((match = timeRegex.exec(lowerNote)) !== null) {
    // Wyciąganie godziny z różnych grup dopasowania
    const hour = parseInt(match[1] || match[3] || match[5] || "0", 10);
    if (hour >= 0 && hour <= 23) {
      preferredTime = hour;
      break;
    }
  }

  return { category, preferredTime, isDinner, isAnniversary, hasPersonalContent };
}

// Funkcja formatująca datę w języku polskim
function formatPolishDate(date: Date): string {
  const days = ["niedzielę", "poniedziałek", "wtorek", "środę", "czwartek", "piątek", "sobotę"];
  const dayName = days[date.getDay()];

  const day = date.getDate();

  const months = [
    "stycznia",
    "lutego",
    "marca",
    "kwietnia",
    "maja",
    "czerwca",
    "lipca",
    "sierpnia",
    "września",
    "października",
    "listopada",
    "grudnia",
  ];
  const monthName = months[date.getMonth()];

  return `${dayName}, ${day} ${monthName}`;
}

async function update_proposal_stats(user_id: string) {
  try {
    const { supabaseClient } = await import("../../db/supabase.client");

    // Get current date for period calculations
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-01`;

    // Check if entry exists for current month
    const { data, error } = await supabaseClient
      .from("proposal_stats")
      .select("*")
      .eq("user_id", user_id)
      .eq("period_type", "month")
      .eq("period_start_date", currentMonth)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      // eslint-disable-next-line no-console
      console.error("Error checking proposal stats:", error);
      return;
    }

    if (data) {
      // Update existing record
      await supabaseClient
        .from("proposal_stats")
        .update({
          total_generations: data.total_generations + 1,
          last_updated: new Date().toISOString(),
        })
        .eq("id", data.id);
    } else {
      // Create new record
      await supabaseClient.from("proposal_stats").insert({
        user_id,
        period_type: "month",
        period_start_date: currentMonth,
        total_generations: 1,
        accepted_proposals: 0,
        last_updated: new Date().toISOString(),
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating proposal stats:", error);
    // Non-critical functionality, so we don't throw an error that would affect the main response
  }
}
