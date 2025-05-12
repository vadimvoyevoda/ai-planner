import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useDashboard } from "./DashboardProvider";
import type { MeetingCategoryEntity } from "@/types";

export function MeetingFilters() {
  const { supabase } = useSupabase();
  const { filters, setFilters } = useDashboard();
  const [date, setDate] = useState<DateRange | undefined>(
    filters.dateRange
      ? {
          from: filters.dateRange.start,
          to: filters.dateRange.end,
        }
      : undefined
  );
  const [categories, setCategories] = useState<MeetingCategoryEntity[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("meeting_categories").select("*");
      if (data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, [supabase]);

  const handleSearchChange = (value: string) => {
    setFilters({
      ...filters,
      searchTerm: value,
    });
  };

  const handleCategoryChange = (value: string) => {
    setFilters({
      ...filters,
      category: value,
    });
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range);
    setFilters({
      ...filters,
      dateRange: range
        ? {
            start: range.from || new Date(),
            end: range.to || new Date(),
          }
        : undefined,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: "",
      category: "",
      dateRange: undefined,
    });
    setDate(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          placeholder="Search meetings..."
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker date={date} setDate={handleDateChange} />
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleClearFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}

MeetingFilters.displayName = "MeetingFilters";
