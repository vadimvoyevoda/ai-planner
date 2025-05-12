import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Meeting, MeetingFilters } from "@/types";
import { transformSupabaseMeeting } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import * as React from "react";

interface MeetingFormData {
  title: string;
  description?: string;
  date: string;
  time: string;
}

interface DashboardContextType {
  meetings: Meeting[];
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  filters: MeetingFilters;
  createMeeting: (data: MeetingFormData) => Promise<void>;
  fetchMeetings: (page: number) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  setFilters: (filters: MeetingFilters) => void;
}

interface DashboardProviderProps {
  children: ReactNode;
  initialMeetings?: Meeting[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

const ITEMS_PER_PAGE = 10;

export function DashboardProvider({ children, initialMeetings = [] }: DashboardProviderProps) {
  const { supabase, user } = useSupabase();
  const { toast } = useToast();

  console.log("DashboardProvider init:", {
    hasSupabase: !!supabase,
    user,
    initialMeetingsCount: initialMeetings.length,
    initialMeetings,
  });

  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MeetingFilters>({
    searchTerm: "",
    category: "",
    dateRange: undefined,
  });

  const fetchMeetings = async (page: number) => {
    console.log("fetchMeetings called:", { page, user, hasSupabase: !!supabase });

    try {
      if (!supabase || !user) {
        throw new Error("Not authenticated");
      }

      setIsLoading(true);
      setError(null);

      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      // Build the query
      let query = supabase
        .from("meetings")
        .select("*, meeting_categories(id, name, suggested_attire)")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("start_time", { ascending: true })
        .range(start, end);

      console.log("Building query with filters:", { filters });

      // Apply filters if they exist
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters.category) {
        query = query.eq("category_id", filters.category);
      }

      if (filters.dateRange?.start) {
        query = query.gte("start_time", filters.dateRange.start.toISOString());
      }

      if (filters.dateRange?.end) {
        query = query.lte("end_time", filters.dateRange.end.toISOString());
      }

      // Execute the query
      const { data: meetingsData, error: meetingsError } = await query;

      if (meetingsError) {
        throw meetingsError;
      }

      // Transform the data to match the Meeting type
      const transformedMeetings = (meetingsData || []).map(transformSupabaseMeeting);

      // Get the total count with the same filters
      let countQuery = supabase
        .from("meetings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("deleted_at", null);

      // Apply the same filters to the count query
      if (filters.searchTerm) {
        countQuery = countQuery.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters.category) {
        countQuery = countQuery.eq("category_id", filters.category);
      }

      if (filters.dateRange?.start) {
        countQuery = countQuery.gte("start_time", filters.dateRange.start.toISOString());
      }

      if (filters.dateRange?.end) {
        countQuery = countQuery.lte("end_time", filters.dateRange.end.toISOString());
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw countError;
      }

      setMeetings(transformedMeetings);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      });
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch meetings");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch meetings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMeeting = async (data: MeetingFormData) => {
    try {
      if (!supabase || !user) {
        throw new Error("Not authenticated");
      }

      setIsLoading(true);
      setError(null);

      const startTime = new Date(`${data.date}T${data.time}`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour duration

      const { data: newMeeting, error: createError } = await supabase
        .from("meetings")
        .insert({
          title: data.title,
          description: data.description || null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          user_id: user.id,
          category_id: "default", // You might want to make this configurable
          ai_generated: false,
        })
        .select("*, meeting_categories(id, name, suggested_attire)")
        .single();

      if (createError) throw createError;

      // Transform the data to match the Meeting type
      const transformedMeeting = transformSupabaseMeeting(newMeeting);

      setMeetings((prev) => [transformedMeeting, ...prev]);
      toast({
        title: "Success",
        description: "Meeting created successfully",
      });
    } catch (err) {
      console.error("Error creating meeting:", err);
      setError(err instanceof Error ? err.message : "Failed to create meeting");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create meeting",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      if (!supabase) {
        throw new Error("Not authenticated");
      }

      setError(null);

      const { error: deleteError } = await supabase
        .from("meetings")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      // Remove the meeting from the local state
      setMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
      toast({
        title: "Sukces",
        description: "Spotkanie zostało usunięte",
      });
    } catch (err) {
      setError("Nie udało się usunąć spotkania");
      console.error("Error deleting meeting:", err);
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się usunąć spotkania",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (supabase && user) {
      fetchMeetings(1);
    }
  }, [supabase, user]);

  const value: DashboardContextType = {
    meetings,
    pagination,
    isLoading,
    error,
    filters,
    createMeeting,
    fetchMeetings,
    deleteMeeting,
    setFilters,
  };

  if (error) {
    throw error; // ErrorBoundary will catch this
  }

  if (isLoading && meetings.length === 0) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="space-y-6">
          <Skeleton className="h-[100px] w-full rounded-lg" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const childrenWithProps = {
    MeetingNoteForm: () => ({
      onSubmit: createMeeting,
    }),
    MeetingFilters: () => ({
      filters,
      onFiltersChange: setFilters,
    }),
    MeetingsList: () => ({
      meetings,
      pagination,
      onPageChange: fetchMeetings,
      onDelete: deleteMeeting,
    }),
  };

  // Clone and inject props to children based on their displayName
  return (
    <DashboardContext.Provider value={value}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const childType = child.type as { displayName?: string };
        const componentName = childType.displayName;
        const getProps = componentName ? childrenWithProps[componentName as keyof typeof childrenWithProps] : undefined;

        if (!getProps) return child;

        return React.cloneElement(child, {
          ...child.props,
          ...getProps(),
        });
      })}
    </DashboardContext.Provider>
  );
}
