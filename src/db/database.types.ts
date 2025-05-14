export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      meetings: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string | null;
          category_id: string;
          user_id: string;
          location: string | null;
          ai_generated: boolean;
          ai_generated_notes: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
          category_id: string;
          user_id: string;
          location?: string | null;
          ai_generated?: boolean;
          ai_generated_notes?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
          category_id?: string;
          user_id?: string;
          location?: string | null;
          ai_generated?: boolean;
          ai_generated_notes?: string | null;
        };
      };
      meeting_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string | null;
          suggested_attire: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
          suggested_attire?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
          suggested_attire?: string | null;
        };
      };
      meeting_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferred_distribution: "rozłożone" | "skondensowane";
          preferred_times_of_day: ("rano" | "dzień" | "wieczór")[];
          min_break_minutes: number | null;
          unavailable_weekdays: number[];
        };
        Insert: {
          id?: string;
          user_id: string;
          preferred_distribution: "rozłożone" | "skondensowane";
          preferred_times_of_day?: ("rano" | "dzień" | "wieczór")[];
          min_break_minutes?: number | null;
          unavailable_weekdays?: number[];
        };
        Update: {
          id?: string;
          user_id?: string;
          preferred_distribution?: "rozłożone" | "skondensowane";
          preferred_times_of_day?: ("rano" | "dzień" | "wieczór")[];
          min_break_minutes?: number | null;
          unavailable_weekdays?: number[];
        };
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      stats_period_type: "day" | "week" | "month" | "year";
    };
  };
}
