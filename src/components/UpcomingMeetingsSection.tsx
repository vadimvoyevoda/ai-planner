import type { Meeting } from "@/types";
import SupabaseProvider from "./providers/SupabaseProvider";
import { DashboardProvider } from "./DashboardProvider";
import { UpcomingMeetings } from "./UpcomingMeetings";

interface UpcomingMeetingsSectionProps {
  initialMeetings: Meeting[];
}

export function UpcomingMeetingsSection({ initialMeetings }: UpcomingMeetingsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SupabaseProvider>
        <DashboardProvider initialMeetings={initialMeetings}>
          <UpcomingMeetings />
        </DashboardProvider>
      </SupabaseProvider>
    </div>
  );
}
