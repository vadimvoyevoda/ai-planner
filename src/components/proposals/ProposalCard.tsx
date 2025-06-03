import type { MeetingProposal, MeetingConflict } from "../../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateDurationMinutes } from "../../lib/utils";
import ConflictBadge from "./ConflictBadge";
import { useEffect, useState } from "react";
import { isFeatureEnabled } from "@/features/featureFlags";

interface ProposalCardProps {
  proposal: MeetingProposal;
  onAccept: (proposal: MeetingProposal) => void;
  hasConflicts?: boolean;
  conflicts?: MeetingConflict[];
  isSelected?: boolean;
  isLoading?: boolean;
  disableAccept?: boolean;
  "data-test-id"?: string;
}

export default function ProposalCard({
  proposal,
  onAccept,
  hasConflicts = false,
  conflicts = [],
  isSelected = false,
  isLoading = false,
  disableAccept = false,
  "data-test-id": dataTestId,
}: ProposalCardProps) {
  const duration = calculateDurationMinutes(proposal.startTime, proposal.endTime);
  const startDate = new Date(proposal.startTime);
  const endDate = new Date(proposal.endTime);
  
  const [isCollectionsEnabled, setIsCollectionsEnabled] = useState(true);

  // Sprawdzanie flag przy montowaniu komponentu
  useEffect(() => {
    setIsCollectionsEnabled(isFeatureEnabled("collections"));
  }, []);

  // Jeśli funkcja jest wyłączona, zwracamy null lub inny komponent zastępczy
  if (!isCollectionsEnabled) {
    return null;
  }

  return (
    <Card className={`w-full sm:w-96 ${isSelected ? "ring-2 ring-primary" : ""}`} data-test-id={dataTestId}>
      <CardHeader>
        <CardTitle className="text-lg">{proposal.title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          <p>{proposal.description}</p>
          <p className="mt-2">
            <strong>Strój:</strong> {proposal.suggestedAttire}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <strong>Data i czas:</strong>{" "}
            {startDate.toLocaleDateString("pl-PL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            {", "}
            {startDate.toLocaleTimeString("pl-PL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" - "}
            {endDate.toLocaleTimeString("pl-PL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div>
            <strong>Czas trwania:</strong> {duration} minut
          </div>
          <div>
            <strong>Miejsce:</strong> {proposal.locationName}
          </div>
          {hasConflicts && conflicts && conflicts.length > 0 && (
            <div className="mt-4">
              <ConflictBadge conflicts={conflicts} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full py-3 sm:py-2"
          onClick={() => onAccept(proposal)}
          disabled={isLoading || disableAccept}
          data-test-id="accept-proposal-button"
        >
          {isLoading ? "Akceptowanie..." : disableAccept ? "Akceptacja niedostępna" : "Zaakceptuj termin"}
        </Button>
      </CardFooter>
    </Card>
  );
}
