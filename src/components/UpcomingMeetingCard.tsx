import { useState } from "react";
import { Trash2, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { deleteMeeting } from "@/lib/services/meetings";
import { useDashboard } from "./DashboardProvider";
import { MeetingDetailsDialog } from "./MeetingDetailsDialog";
import { Button } from "@/components/ui/button";
import type { Meeting } from "@/types";
import { formatDate } from "@/lib/utils";
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

interface UpcomingMeetingCardProps {
  id: string;
  title: string;
  startTime: string;
  onDelete?: () => void;
  meeting: Meeting;
}

export function UpcomingMeetingCard({ id, title, startTime, onDelete, meeting }: UpcomingMeetingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const { fetchMeetings, pagination } = useDashboard();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteMeeting(id);

      // Refresh meetings list with current page
      await fetchMeetings(pagination.currentPage);

      toast({
        title: "Sukces",
        description: "Spotkanie zostało usunięte",
      });

      onDelete?.();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się usunąć spotkania",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="border-l-4 border-indigo-500 pl-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-600">{formatDate(startTime)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50"
              onClick={() => setShowDetails(true)}
            >
              <Info className="h-4 w-4" />
              <span className="ml-2">Szczegóły</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="text-red-600 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Czy na pewno chcesz usunąć to spotkanie?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ta akcja jest nieodwracalna. Spotkanie zostanie trwale usunięte.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? "Usuwanie..." : "Usuń"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      <MeetingDetailsDialog meeting={meeting} isOpen={showDetails} onOpenChange={setShowDetails} />
    </>
  );
}
