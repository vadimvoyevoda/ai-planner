import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Meeting, MeetingFilters } from "@/types";
import * as meetingsService from "@/lib/services/meetings";

interface UseMeetingsResult {
  meetings: Meeting[];
  isLoading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: MeetingFilters;
  setFilters: (filters: MeetingFilters) => void;
  setPage: (page: number) => void;
  deleteMeeting: (id: string) => Promise<void>;
  exportMeeting: (id: string) => Promise<void>;
  generateSuggestions: (note: string) => Promise<void>;
}

const DEFAULT_FILTERS: MeetingFilters = {
  searchTerm: "",
  category: "",
  dateRange: undefined,
};

export function useMeetings(): UseMeetingsResult {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<MeetingFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const { toast } = useToast();

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await meetingsService.getMeetings(filters, pagination.page, pagination.limit);
      setMeetings(response.meetings);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch meetings"));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch meetings",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, toast]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleDeleteMeeting = async (id: string) => {
    try {
      await meetingsService.deleteMeeting(id);
      setMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete meeting",
      });
      throw err;
    }
  };

  const handleExportMeeting = async (id: string) => {
    try {
      await meetingsService.exportMeeting(id);
      toast({
        title: "Success",
        description: "Meeting exported successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export meeting",
      });
      throw err;
    }
  };

  const handleGenerateSuggestions = async (note: string) => {
    try {
      const response = await meetingsService.generateMeetingSuggestions(note);
      setMeetings((prev) => [...response.meetings, ...prev]);
      toast({
        title: "Success",
        description: "Meeting suggestions generated successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate meeting suggestions",
      });
      throw err;
    }
  };

  const handleSetFilters = useCallback((newFilters: MeetingFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleSetPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  return {
    meetings,
    isLoading,
    error,
    pagination,
    filters,
    setFilters: handleSetFilters,
    setPage: handleSetPage,
    deleteMeeting: handleDeleteMeeting,
    exportMeeting: handleExportMeeting,
    generateSuggestions: handleGenerateSuggestions,
  };
}
