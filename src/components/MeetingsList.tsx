import { useMemo } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import type { Meeting } from "@/types";
import { Button } from "@/components/ui/button";
import { MeetingCard } from "@/components/MeetingCard";
import { useDashboard } from "./DashboardProvider";

export function MeetingsList() {
  const { meetings = [], pagination, fetchMeetings: onPageChange, deleteMeeting: onDelete } = useDashboard();

  const groupedMeetings = useMemo(() => {
    const groups: Record<string, Meeting[]> = {};
    meetings.forEach((meeting) => {
      const date = format(new Date(meeting.startTime), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(meeting);
    });
    return groups;
  }, [meetings]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedMeetings).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [groupedMeetings]);

  if (meetings.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Nie masz żadnych nadchodzących spotkań.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-4">
          <h4 className="font-medium">{format(new Date(date), "EEEE, d MMMM yyyy")}</h4>
          <div className="grid gap-4">
            {groupedMeetings[date].map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}

      {pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <Button
                    variant={page === pagination.currentPage ? "default" : "outline"}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </Button>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

MeetingsList.displayName = "MeetingsList";
