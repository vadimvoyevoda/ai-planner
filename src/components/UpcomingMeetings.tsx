import { useState, useEffect } from "react";
import { UpcomingMeetingCard } from "./UpcomingMeetingCard";
import { useDashboard } from "./DashboardProvider";
import type { Meeting } from "@/types";

export function UpcomingMeetings() {
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const { meetings, isLoading, deleteMeeting } = useDashboard();

  console.log("UpcomingMeetings render:", { meetings, isLoading, upcomingMeetings });

  useEffect(() => {
    // Filter meetings to show only upcoming ones
    const now = new Date();
    console.log("Filtering with date:", now.toISOString());

    const filtered = meetings
      .filter((meeting) => {
        const meetingDate = new Date(meeting.startTime);
        const isUpcoming = meetingDate >= now;
        console.log("Meeting date comparison:", {
          meetingTitle: meeting.title,
          meetingDate: meetingDate.toISOString(),
          isUpcoming,
        });
        return isUpcoming;
      })
      .slice(0, 5); // Limit to 5 meetings

    console.log("Filtering meetings:", {
      now: now.toISOString(),
      totalMeetings: meetings.length,
      filteredMeetings: filtered.length,
      filtered,
    });

    setUpcomingMeetings(filtered);
  }, [meetings]);

  if (isLoading && upcomingMeetings.length === 0) {
    return (
      <>
        <h2 className="text-xl font-semibold mb-4">Nadchodzące spotkania</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-l-4 border-indigo-500 pl-4 py-2 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Nadchodzące spotkania</h2>
      {upcomingMeetings.length === 0 ? (
        <>
          <p className="text-gray-500 text-center py-4">Brak nadchodzących spotkań</p>
          <div className="mt-4 text-center">
            <a
              href="/proposals"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Zaplanuj nowe spotkanie
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <UpcomingMeetingCard
                key={meeting.id}
                id={meeting.id}
                title={meeting.title}
                startTime={meeting.startTime}
                meeting={meeting}
                onDelete={async () => {
                  await deleteMeeting(meeting.id);
                }}
              />
            ))}
          </div>
          <div className="mt-4 text-center">
            <a
              href="/proposals"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Zaplanuj nowe spotkanie
            </a>
          </div>
        </>
      )}
    </>
  );
}
