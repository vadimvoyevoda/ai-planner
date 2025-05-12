import { useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import type { Meeting } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MeetingCardProps {
  meeting: Meeting;
  onDelete?: (id: string) => Promise<void>;
}

export function MeetingCard({ meeting, onDelete }: MeetingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setIsLoading(true);
      await onDelete(meeting.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-l-4 border-indigo-500 pl-4 py-2">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{meeting.title}</h3>
          <p className="text-sm text-gray-600">
            {format(new Date(meeting.startTime), "dd.MM")}, {format(new Date(meeting.startTime), "HH:mm")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/meetings/${meeting.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
            Szczegóły →
          </a>
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Usuń spotkanie"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usuń spotkanie</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz usunąć to spotkanie? Tej operacji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
                    Usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
