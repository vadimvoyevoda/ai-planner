import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ApiError, MeetingProposal, MeetingConflict } from "@/types";
import { acceptProposal } from "@/lib/services/meetings.service";
import ProposalCard from "./ProposalCard";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";

interface ProposalsPageProps {
  initialNote?: string;
  initialLocation?: string;
  initialDuration?: number;
}

export default function ProposalsPage({ initialNote = "", initialLocation = "", initialDuration }: ProposalsPageProps) {
  const [note, setNote] = React.useState<string>(initialNote);
  const noteRef = React.useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [proposals, setProposals] = React.useState<MeetingProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = React.useState<MeetingProposal | null>(null);
  const [conflicts, setConflicts] = React.useState<MeetingConflict[] | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const proposalsRef = React.useRef<HTMLDivElement>(null);

  const handleNoteChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProposals([]);

    try {
      const noteText = noteRef.current?.value?.trim();
      if (!noteText) {
        throw new Error("Proszę wprowadzić notatkę.");
      }

      const response = await fetch("/api/meeting-proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: noteText,
          locationName: initialLocation,
          estimatedDuration: initialDuration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas generowania propozycji.");
      }

      const data = await response.json();
      setProposals(data.proposals);
      setTimeout(() => proposalsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd podczas generowania propozycji.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptProposal = async (proposal: MeetingProposal) => {
    try {
      setSelectedProposal(proposal);
      setIsLoading(true);
      setError(null);

      const response = await acceptProposal({
        startTime: proposal.startTime,
        endTime: proposal.endTime,
        title: proposal.title,
        description: proposal.description,
        categoryId: proposal.categoryId,
        locationName: proposal.locationName,
        aiGeneratedNotes: proposal.aiGeneratedNotes,
        originalNote: proposal.originalNote,
      });

      if (response.conflicts && response.conflicts.length > 0) {
        setConflicts(response.conflicts);
        setShowConfirmDialog(true);
        return;
      }

      window.location.href = "/";
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd podczas akceptacji propozycji.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (note) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
    setConflicts(null);
  };

  const handleConfirmWithConflicts = () => {
    if (selectedProposal) {
      window.location.href = "/";
    }
  };

  // Jeśli jest initialNote, automatycznie generuj propozycje
  React.useEffect(() => {
    if (initialNote) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
    }
  }, [initialNote]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Propozycje terminów spotkań</h1>

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
                ref={noteRef}
                data-test-id="meeting-note-input"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={!note.trim() || isLoading}
              className="w-full"
              data-test-id="propose-meeting-button"
            >
              {isLoading ? "Generowanie propozycji..." : "Zaproponuj termin"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && <ErrorState error={error} onRetry={handleRetry} />}
      {isLoading && <LoadingState data-test-id="loading-proposals" />}

      {proposals.length > 0 && !isLoading && (
        <div ref={proposalsRef} className="mt-8" data-test-id="proposals-container">
          <h2 className="text-2xl font-semibold mb-6">Propozycje terminów</h2>
          <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-6 sm:overflow-x-auto sm:pb-4">
            {proposals.map((proposal, index) => (
              <div className="mb-6 sm:mb-0 w-full sm:w-auto" key={index}>
                <ProposalCard
                  key={`proposal-${index}`}
                  proposal={proposal}
                  onAccept={handleAcceptProposal}
                  isSelected={selectedProposal?.startTime === proposal.startTime}
                  isLoading={isLoading && selectedProposal?.startTime === proposal.startTime}
                  data-test-id={`proposal-card-${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showConfirmDialog && conflicts && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          data-test-id="confirm-dialog"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Wykryto konflikty</h3>
            <p className="mb-4">W wybranym terminie masz już zaplanowane inne spotkania:</p>
            <ul className="list-disc pl-5 mb-4" data-test-id="conflicts-list">
              {conflicts.map((conflict) => (
                <li key={conflict.id} className="mb-2">
                  {conflict.title} ({new Date(conflict.startTime).toLocaleString()})
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleCloseConfirmDialog} data-test-id="cancel-conflicts-button">
                Anuluj
              </Button>
              <Button onClick={handleConfirmWithConflicts} data-test-id="accept-with-conflicts-button">
                Zaakceptuj mimo konfliktów
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
