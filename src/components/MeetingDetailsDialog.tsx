import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDashboard } from "./DashboardProvider";
import type { Meeting } from "@/types";
import { formatDate } from "@/lib/utils";

interface MeetingDetailsDialogProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MeetingDetailsDialog({ meeting, isOpen, onOpenChange }: MeetingDetailsDialogProps) {
  if (!meeting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{meeting.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Czas</h4>
            <p className="text-sm text-gray-500">
              {formatDate(meeting.startTime)} - {formatDate(meeting.endTime)}
            </p>
          </div>
          {meeting.description && (
            <div>
              <h4 className="text-sm font-medium mb-1">Opis</h4>
              <p className="text-sm text-gray-500">{meeting.description}</p>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium mb-1">Kategoria</h4>
            <p className="text-sm text-gray-500">{meeting.category.name}</p>
          </div>
          {meeting.category.suggested_attire && (
            <div>
              <h4 className="text-sm font-medium mb-1">Sugerowany strój</h4>
              <p className="text-sm text-gray-500">{meeting.category.suggested_attire}</p>
            </div>
          )}
          {meeting.locationName && (
            <div>
              <h4 className="text-sm font-medium mb-1">Lokalizacja</h4>
              <p className="text-sm text-gray-500">{meeting.locationName}</p>
            </div>
          )}
          {meeting.aiGeneratedNotes && (
            <div>
              <h4 className="text-sm font-medium mb-1">Notatki AI</h4>
              <p className="text-sm text-gray-500">{meeting.aiGeneratedNotes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
