import type { MeetingProposal, MeetingConflict } from "../../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime, calculateDurationMinutes } from "../../lib/utils";
import ConflictBadge from "./ConflictBadge";

interface ProposalCardProps {
  proposal: MeetingProposal;
  onAccept: (proposal: MeetingProposal) => void;
  hasConflicts?: boolean;
  conflicts?: MeetingConflict[];
  isSelected?: boolean;
  isLoading?: boolean;
}

export default function ProposalCard({
  proposal,
  onAccept,
  hasConflicts = false,
  conflicts = [],
  isSelected = false,
  isLoading = false,
}: ProposalCardProps) {
  // Formatowanie daty i czasu
  const formattedDate = formatDateTime(proposal.startTime, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const formattedTime = formatDateTime(proposal.startTime, {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Obliczanie czasu trwania
  const durationMinutes = calculateDurationMinutes(proposal.startTime, proposal.endTime);

  return (
    <Card className={`min-w-[300px] max-w-sm flex-shrink-0 relative ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
      {/* Badge konfliktu, jeśli istnieje */}
      {hasConflicts && <ConflictBadge conflicts={conflicts} />}

      <CardHeader>
        <CardTitle className="text-lg">{proposal.title}</CardTitle>
        <div className="text-sm text-gray-500">
          {formattedDate}, {formattedTime}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Kategoria:</span> {proposal.categoryName}
          </div>
          <div>
            <span className="font-medium">Miejsce:</span> {proposal.locationName}
          </div>
          <div>
            <span className="font-medium">Czas trwania:</span> {durationMinutes} min
          </div>
          <div>
            <span className="font-medium">Sugerowany strój:</span> {proposal.suggestedAttire}
          </div>
          {proposal.description && (
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">{proposal.description}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={() => onAccept(proposal)} className="w-full" disabled={isLoading}>
          Zaakceptuj
        </Button>
      </CardFooter>
    </Card>
  );
}
