import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";
import { OpenAIService } from "@/lib/services/openai.service";
import type { MeetingProposalRequest } from "@/types";
import { update_proposal_stats } from "@/lib/services/meeting-proposals.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const body = (await request.json()) as MeetingProposalRequest;
    if (!body.note?.trim()) {
      return new Response(JSON.stringify({ message: "Note is required" }), { status: 400 });
    }

    // Get user preferences and categories
    const { data: preferences } = await supabase
      .from("meeting_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: categories } = await supabase.from("meeting_categories").select("*");

    if (!categories) {
      return new Response(JSON.stringify({ message: "Failed to fetch meeting categories" }), { status: 500 });
    }

    // Format categories for the prompt
    const categoriesText = categories.map((cat) => `- ${cat.name}`).join("\n");

    // Format user preferences
    const userPrefs = preferences
      ? {
          distribution: preferences.preferred_distribution,
          timesOfDay: preferences.preferred_times_of_day,
          unavailableDays: preferences.unavailable_weekdays,
        }
      : {
          distribution: "rozłożone",
          timesOfDay: ["rano", "dzień", "wieczór"],
          unavailableDays: [],
        };

    // Inicjalizacja OpenAI service
    const openai = new OpenAIService();
    openai.setSystemMessage(`Jesteś asystentem do analizy spotkań i generowania propozycji terminów. Na podstawie notatki użytkownika wygeneruj od 2 do 4 propozycji spotkań.

        WAŻNE - Zasady generowania dat:
        - Jeśli w notatce jest podana konkretna data (np. "17 maja", "3 grudnia"):
          * ZAWSZE interpretuj ją jako datę z aktualnego roku (${new Date().getFullYear()})
          * jeśli ta data już minęła w tym roku, przesuń ją na następny możliwy termin
        - Jeśli w notatce NIE MA konkretnej daty:
          * generuj propozycje zaczynając od DZISIAJ (${new Date().toISOString().split("T")[0]})
          * proponuj tylko terminy z najbliższych 30 dni
        - BEZWZGLĘDNIE nie proponuj terminów w niedostępnych dniach tygodnia
        - Jeśli termin wypada w niedostępny dzień, przesuń go na najbliższy dostępny dzień
        - Dla terminów na dziś upewnij się, że godzina jest późniejsza niż obecna

        Dostępne kategorie spotkań:
${categoriesText}

        Preferencje użytkownika:
        - Preferowany rozkład spotkań: ${userPrefs.distribution}
        - Preferowane pory dnia: ${userPrefs.timesOfDay.join(", ")}
        - Niedostępne dni tygodnia: ${userPrefs.unavailableDays.map((d: number) => ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"][d]).join(", ")}

        Przeanalizuj notatkę pod kątem:
        1. Kategorii spotkania - MUSISZ wybrać jedną z powyższych, dokładnie tak jak jest napisana
        2. Preferowanej daty i godziny - pamiętaj o zasadach generowania dat powyżej!
        3. Szacowanego czasu trwania
        4. Tytułu i opisu spotkania
        5. Sugerowanego stroju - zaproponuj odpowiedni strój bazując na:
           - charakterze i formalności spotkania
           - miejscu spotkania
           - porze dnia i roku
           - kontekście kulturowym
        6. WAŻNE - Lokalizacji/miejsca spotkania - zawsze zaproponuj konkretne miejsce

        Następnie wygeneruj 2-4 różne propozycje terminów, biorąc pod uwagę:
        - Preferencje użytkownika dotyczące pór dnia i rozkładu spotkań
        - NIGDY nie proponuj terminów w niedostępnych dniach tygodnia
        - Jeśli użytkownik podał konkretną datę w notatce:
          * użyj tej daty, interpretując ją jako datę z aktualnego roku
          * jeśli data już minęła, zaproponuj najbliższy możliwy termin
          * jeśli data wypada w niedostępny dzień, przesuń na najbliższy dostępny
        - Jeśli nie podano konkretnej daty:
          * generuj propozycje od dnia dzisiejszego
          * używaj preferowanych pór dnia użytkownika
        - Zaproponuj różne godziny zgodne z preferencjami dla lepszego wyboru
        - ZAWSZE zaproponuj konkretną lokalizację/miejsce spotkania, nawet jeśli nie została podana w notatce
        - Jeśli lokalizacja nie została określona w notatce, zaproponuj odpowiednie miejsce bazując na kategorii i charakterze spotkania

        Odpowiedz w formacie JSON jako tablicę propozycji:
        {
          "proposals": [
            {
              "category": "DOKŁADNA_NAZWA_Z_LISTY_POWYŻEJ",
              "startTime": "YYYY-MM-DDTHH:mm:ss.sssZ",
              "endTime": "YYYY-MM-DDTHH:mm:ss.sssZ",
              "title": "tytuł spotkania",
              "description": "opis spotkania",
              "locationName": "dokładna nazwa/adres miejsca spotkania",
              "suggestedAttire": "szczegółowa sugestia stroju odpowiedniego do okazji"
            }
          ]
        }`);

    openai.addUserMessage(body.note);
    const completion = await openai.createChatCompletion();
    const analysis = openai.parseResponse<{
      proposals: {
        category: string;
        startTime: string;
        endTime: string;
        title: string;
        description: string;
        locationName: string;
        suggestedAttire?: string;
      }[];
    }>(completion);

    // Find matching category from database
    const mappedProposals = await Promise.all(
      analysis.proposals.map(async (proposal) => {
        const matchedCategory = categories.find((c) => c.name === proposal.category);
        if (!matchedCategory) {
          console.warn(`Category not found: ${proposal.category}`);
          return null;
        }

        return {
          startTime: proposal.startTime,
          endTime: proposal.endTime,
          title: proposal.title,
          description: proposal.description,
          categoryId: matchedCategory.id,
          categoryName: matchedCategory.name,
          suggestedAttire: proposal.suggestedAttire || "Strój odpowiedni do okazji",
          locationName: proposal.locationName,
          aiGeneratedNotes: `Proponuję ${matchedCategory.name.toLowerCase()} spotkanie w ${proposal.locationName} w dniu ${new Date(proposal.startTime).toLocaleDateString("pl-PL")} o ${new Date(proposal.startTime).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`,
          originalNote: body.note,
        };
      })
    );

    // Filter out null proposals (where category wasn't found)
    const validProposals = mappedProposals.filter((p): p is NonNullable<typeof p> => p !== null);

    // Aktualizacja statystyk
    await update_proposal_stats(user.id);

    return new Response(JSON.stringify({ proposals: validProposals }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating proposals:", error);
    return new Response(JSON.stringify({ message: "Wystąpił błąd podczas generowania propozycji" }), { status: 500 });
  }
};
