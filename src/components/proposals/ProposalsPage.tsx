import * as React from "react";
import type { ApiError, MeetingConflict, MeetingProposal, MeetingCategoryEntity } from "../../types";
import { acceptProposal } from "../../lib/services/meetingProposals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProposalCard from "./ProposalCard";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import { OpenAIService } from "@/lib/services/ai/openai.service";
import { getSupabaseClient } from "@/db/supabase.client";

interface ProposalsPageProps {
  initialNote?: string;
}

export default function ProposalsPage({ initialNote = "" }: ProposalsPageProps) {
  // Stan formularza
  const [note, setNote] = React.useState<string>("");

  React.useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
    }
  }, [initialNote]);

  // Stan komponentu
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [proposals, setProposals] = React.useState<MeetingProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = React.useState<MeetingProposal | null>(null);
  const [conflicts, setConflicts] = React.useState<MeetingConflict[] | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [categories, setCategories] = React.useState<MeetingCategoryEntity[]>([]);
  const [userPreferences, setUserPreferences] = React.useState<{
    preferred_distribution: string | null;
    preferred_times_of_day: string[] | null;
    unavailable_weekdays: number[] | null;
  } | null>(null);

  // Referencja do sekcji z propozycjami (do scrollowania)
  const proposalsRef = React.useRef<HTMLDivElement>(null);

  // Pobieranie preferencji użytkownika i kategorii spotkań
  React.useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn("Supabase client not available yet");
        return;
      }

      // Pobieranie kategorii
      const { data: categoriesData, error: categoriesError } = await supabase.from("meeting_categories").select("*");

      if (!categoriesError && categoriesData) {
        setCategories(categoriesData);
      }

      // Pobieranie preferencji użytkownika
      const { data: preferencesData, error: preferencesError } = await supabase
        .from("meeting_preferences")
        .select("preferred_distribution, preferred_times_of_day, unavailable_weekdays")
        .single();

      if (!preferencesError && preferencesData) {
        setUserPreferences(preferencesData);
      } else {
        console.warn("Could not fetch user preferences:", preferencesError);
      }
    }

    fetchData();
  }, []);

  // Handler zmiany notatki
  const handleNoteChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNote(newValue);
  }, []);

  // Walidacja formularza - przycisk jest aktywny gdy jest niepusta notatka
  const isFormValid = note.length > 0;

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Inicjalizacja serwisu OpenAI
      const openai = new OpenAIService();
      openai.setModel("gpt-4o-mini");

      // Ustawienie systemu i formatu odpowiedzi
      openai.setSystemMessage(`Jesteś asystentem do analizy spotkań i generowania propozycji terminów. Na podstawie notatki użytkownika wygeneruj od 2 do 4 propozycji spotkań.

      WAŻNE - Kategorie spotkań:
      Musisz użyć DOKŁADNIE jednej z poniższych nazw kategorii - nie możesz użyć żadnej innej:
      ${categories.map((cat) => `"${cat.name}"`).join(", ")}

      Preferencje użytkownika:
      - Preferowany rozkład spotkań: ${userPreferences?.preferred_distribution || "brak preferencji"}
      - Preferowane pory dnia: ${userPreferences?.preferred_times_of_day?.join(", ") || "brak preferencji"}
      - Niedostępne dni tygodnia: ${
        userPreferences?.unavailable_weekdays
          ?.map((day) => {
            const days = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
            return days[day];
          })
          .join(", ") || "brak"
      }

      Przeanalizuj notatkę pod kątem:
      1. Kategorii spotkania - MUSISZ wybrać jedną z powyższych, dokładnie tak jak jest napisana
      2. Preferowanej daty i godziny
      3. Szacowanego czasu trwania
      4. Tytułu i opisu spotkania
      5. WAŻNE - Lokalizacji/miejsca spotkania - zawsze zaproponuj konkretne miejsce

      Następnie wygeneruj 2-4 różne propozycje terminów, biorąc pod uwagę:
      - Preferencje użytkownika dotyczące pór dnia i rozkładu spotkań
      - NIGDY nie proponuj terminów w niedostępnych dniach tygodnia
      - Jeśli użytkownik podał konkretną datę/godzinę w notatce, priorytetyzuj te preferencje
      - Jeśli nie podano konkretnego czasu, użyj preferowanych pór dnia użytkownika
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
            "locationName": "dokładna nazwa/adres miejsca spotkania"
          }
        ]
      }`);

      // Dodanie notatki użytkownika
      openai.addUserMessage(
        `Przeanalizuj notatkę i wygeneruj 2-4 propozycje spotkania. PAMIĘTAJ, że musisz użyć dokładnie jednej z podanych kategorii - nie możesz wymyślić własnej. Notatka: "${note}"`
      );

      // Wysłanie zapytania do OpenAI
      const payload = openai.buildRequestPayload();
      console.log("OpenAI Request Payload:", JSON.stringify(payload, null, 2));
      const completion = await openai.createChatCompletion();
      console.log("OpenAI Response:", JSON.stringify(completion, null, 2));
      const result = openai.parseResponse<{
        proposals: {
          category: string;
          startTime: string;
          endTime: string;
          title: string;
          description: string;
          locationName: string;
        }[];
      }>(completion);

      // Mapowanie propozycji i dodanie wszystkich wymaganych pól
      const mappedProposals = result.proposals.map((proposal) => {
        const category = categories.find((cat) => cat.name === proposal.category);

        // Jeśli kategoria nie istnieje, użyj pierwszej dostępnej kategorii
        const finalCategory = category || categories[0];
        if (!category) {
          console.warn(`Nieprawidłowa kategoria "${proposal.category}", używam domyślnej: ${finalCategory.name}`);
        }

        return {
          ...proposal,
          category: finalCategory.name, // Nadpisz nieprawidłową kategorię
          categoryId: finalCategory.id,
          categoryName: finalCategory.name,
          suggestedAttire: finalCategory.suggested_attire || "",
          locationName: proposal.locationName || "",
          originalNote: note,
          aiGeneratedNotes: `Propozycja wygenerowana przez AI na podstawie notatki: ${note}`,
        } as MeetingProposal;
      });

      setProposals(mappedProposals);

      // Scroll do sekcji z propozycjami po ich załadowaniu
      setTimeout(() => {
        proposalsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd podczas generowania propozycji.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obsługa akceptacji propozycji
  const handleAcceptProposal = async (proposal: MeetingProposal) => {
    try {
      setSelectedProposal(proposal);
      setIsLoading(true);
      setError(null);

      const acceptRequest = {
        startTime: proposal.startTime,
        endTime: proposal.endTime,
        title: proposal.title,
        description: proposal.description,
        categoryId: proposal.categoryId,
        locationName: proposal.locationName,
        aiGeneratedNotes: proposal.aiGeneratedNotes,
        originalNote: proposal.originalNote,
      };

      const response = await acceptProposal(acceptRequest);

      // Sprawdzenie czy są konflikty
      if (response.conflicts && response.conflicts.length > 0) {
        setConflicts(response.conflicts);
        setShowConfirmDialog(true);
        setIsLoading(false);
        return;
      }

      // Przekierowanie do szczegółów spotkania
      window.location.href = `/meetings/${response.id}`;
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd podczas akceptacji propozycji.",
      });
      setIsLoading(false);
    }
  };

  // Funkcja do ponowienia próby (przy błędzie)
  const handleRetry = () => {
    setError(null);
    if (note) {
      const event = {
        preventDefault: () => {
          return;
        },
      } as React.FormEvent<HTMLFormElement>;
      handleSubmit(event);
    }
  };

  // Nawigacja do dashboardu
  const navigateToDashboard = () => {
    window.location.href = "/dashboard";
  };

  // Funkcja do zamknięcia dialogu potwierdzenia
  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
    setConflicts(null);
  };

  // Funkcja potwierdzenia akceptacji z konfliktami
  const handleConfirmWithConflicts = () => {
    if (selectedProposal) {
      window.location.href = "/dashboard?accepted=true";
    }
  };

  // Automatyczne generowanie propozycji, jeśli początkowe dane są dostępne

  // useEffect(() => {
  //   if (initialNote && !isLoading && proposals.length === 0) {
  //     handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  //   }
  // }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Propozycje terminów spotkań</h1>

      {/* Formularz */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Utwórz propozycje spotkania</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="note" className="block text-sm font-medium">
                Notatka o spotkaniu*
              </label>
              <textarea
                id="note"
                placeholder="Opisz czego dotyczy spotkanie, z kim, kiedy preferujesz się spotkać, gdzie i jak długo potrwa..."
                value={note}
                onChange={handleNoteChange}
                className="w-full rounded-md border border-gray-300 p-3 min-h-[120px]"
                disabled={isLoading}
                required
              />
              <p className="text-sm text-gray-500">
                Opisz wszystkie szczegóły spotkania, w tym: temat, uczestników, preferowaną datę i godzinę, lokalizację
                oraz przewidywany czas trwania.
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={!isFormValid || isLoading} className="w-full">
              {isLoading ? "Generowanie propozycji..." : "Zaproponuj termin"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Sekcja błędu */}
      {error && <ErrorState error={error} onRetry={handleRetry} onBack={navigateToDashboard} />}

      {/* Sekcja ładowania */}
      {isLoading && <LoadingState />}

      {/* Sekcja propozycji */}
      {proposals.length > 0 && !isLoading && (
        <div ref={proposalsRef} className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">Propozycje terminów</h2>

          <div className="flex flex-nowrap gap-6 overflow-x-auto pb-4">
            {proposals.map((proposal, index) => (
              <ProposalCard
                key={index}
                proposal={proposal}
                onAccept={handleAcceptProposal}
                isSelected={selectedProposal?.startTime === proposal.startTime}
                isLoading={isLoading && selectedProposal?.startTime === proposal.startTime}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialog potwierdzenia (konflikt) */}
      {showConfirmDialog && conflicts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Potwierdzenie spotkania z konfliktami</h2>
            <p className="mb-4">To spotkanie koliduje z innymi spotkaniami w twoim kalendarzu:</p>

            <ul className="mb-6 space-y-2">
              {conflicts.map((conflict) => (
                <li key={conflict.id} className="border-l-2 border-amber-500 pl-3">
                  <div className="font-medium">{conflict.title}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(conflict.startTime).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })} -
                    {new Date(conflict.endTime).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleCloseConfirmDialog}>
                Anuluj
              </Button>
              <Button onClick={handleConfirmWithConflicts}>Potwierdź mimo konfliktów</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
