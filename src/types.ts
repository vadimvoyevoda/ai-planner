import type { Database } from "./db/database.types";

// Database related types
export type DbTables = Database["public"]["Tables"];
export type DbEnums = Database["public"]["Enums"];

// Utility types
export type TimeOfDay = "rano" | "dzień" | "wieczór";
export type MeetingDistribution = "rozłożone" | "skondensowane";
export type StatsPeriodType = DbEnums["stats_period_type"];

// Base entity types that map directly to database tables
export interface ProfileEntity {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  updated_at: string;
  email: string; // Added from auth system, not in the profiles table
}

export interface MeetingPreferencesEntity {
  id: string;
  user_id: string;
  preferred_distribution: "rozłożone" | "skondensowane";
  preferred_times_of_day: ("rano" | "dzień" | "wieczór")[];
  min_break_minutes: number | null;
  unavailable_weekdays: number[];
}

export interface MeetingCategoryEntity {
  id: string;
  name: string;
  suggested_attire: string | null;
  created_at: string;
}

export interface MeetingEntity {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string;
  start_time: string;
  end_time: string;
  location_name: string | null;
  coordinates: unknown | null;
  ai_generated: boolean;
  original_note: string | null;
  ai_generated_notes: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface ProposalStatsEntity {
  id: string;
  user_id: string;
  period_type: StatsPeriodType;
  period_start_date: string;
  total_generations: number;
  accepted_proposals: number;
  last_updated: string;
}

// Coordinates type for geospatial data
export interface Coordinates {
  x: number;
  y: number;
}

// DTOs for API responses

// User Profile DTOs
export interface UserProfileResponseDto {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdateCommand {
  first_name: string;
  last_name: string;
  password?: string;
}

// Meeting Preferences DTOs
export interface MeetingPreferencesResponseDto {
  id: string;
  preferred_distribution: MeetingDistribution;
  preferred_times_of_day: TimeOfDay[];
  min_break_minutes: number | null;
  unavailable_weekdays: number[];
}

export interface MeetingPreferencesUpdateCommand {
  preferred_distribution: MeetingDistribution;
  preferred_times_of_day: TimeOfDay[];
  min_break_minutes: number | null;
  unavailable_weekdays: number[];
}

export interface MeetingPreferencesUpdateDto {
  preferred_distribution: "rozłożone" | "skondensowane";
  preferred_times_of_day: ("rano" | "dzień" | "wieczór")[];
  min_break_minutes: number | null;
  unavailable_weekdays: number[];
}

// Meeting Categories DTOs
export interface MeetingCategoryResponseDto {
  id: string;
  name: string;
  suggested_attire: string | null;
}

// Meeting DTOs
export interface MeetingResponseDto {
  id: string;
  title: string;
  description: string | null;
  category: {
    id: string;
    name: string;
    suggested_attire: string | null;
  };
  start_time: string;
  end_time: string;
  location_name: string | null;
  coordinates: Coordinates | null;
  ai_generated: boolean;
  original_note: string | null;
  ai_generated_notes: string | null;
  created_at: string;
}

export interface MeetingListResponseDto {
  meetings: MeetingResponseDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface MeetingCreateCommand {
  title: string;
  description: string | null;
  category_id: string;
  start_time: string;
  end_time: string;
  location_name: string | null;
  coordinates: Coordinates | null;
}

export type MeetingUpdateCommand = MeetingCreateCommand;

export interface MeetingListParams {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  category_id?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface MeetingConflictDto {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
}

export interface MeetingCreateResponseDto extends MeetingResponseDto {
  conflicts?: MeetingConflictDto[];
}

export interface MeetingUpdateResponseDto extends MeetingResponseDto {
  conflicts?: MeetingConflictDto[];
}

// AI Integration DTOs
export interface NoteAnalysisCommand {
  note: string;
}

export interface NoteAnalysisResponseDto {
  analyzed_note: string;
  suggested_category: {
    id: string;
    name: string;
    suggested_attire: string | null;
  };
  suggested_title: string;
  suggested_description: string;
  estimated_duration: number; // in minutes
}

export interface MeetingProposalCommand {
  note: string;
  location_name: string;
  estimated_duration?: number; // in minutes
}

export interface MeetingProposalItem {
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    suggested_attire: string | null;
  };
  location_name: string;
  ai_generated_notes: string;
  original_note: string;
}

export interface MeetingProposalResponseDto {
  proposals: MeetingProposalItem[];
}

export interface AcceptMeetingProposalCommand {
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  category_id: string;
  location_name: string;
  ai_generated_notes: string;
  original_note: string;
}

export interface AcceptMeetingProposalResponseDto extends MeetingResponseDto {
  conflicts?: MeetingConflictDto[];
}

// Google Calendar Integration DTOs
export interface GoogleCalendarConnectionCommand {
  auth_code: string;
}

export interface GoogleCalendarConnectionResponseDto {
  connected: boolean;
  account_email: string;
}

export interface ExportMeetingResponseDto {
  success: boolean;
  google_event_id: string;
}

export interface ExportAllMeetingsResponseDto {
  success: boolean;
  exported_count: number;
  failed_count: number;
}

// Statistics DTOs
export interface UserStatisticsParams {
  period_type?: StatsPeriodType;
  period_start_date?: string;
}

export interface UserStatisticsResponseDto {
  total_generations: number;
  accepted_proposals: number;
  acceptance_rate: number; // percentage
  last_updated: string;
}

export interface AcceptanceRateResponseDto {
  acceptance_rate: number; // percentage
  sample_size: number;
}

// General API response types
export interface ApiErrorResponseDto {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiSuccessResponseDto {
  message: string;
}

// Meeting Proposals View types
export interface MeetingProposalRequest {
  note: string;
  preferredDateTime?: string; // ISO8601
  categoryId?: string;
  estimatedDuration?: number;
  title?: string;
  description?: string;
  locationName?: string;
}

export interface MeetingProposal {
  startTime: string; // ISO8601
  endTime: string; // ISO8601
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  suggestedAttire: string;
  locationName: string;
  aiGeneratedNotes: string;
  originalNote: string;
}

export interface MeetingProposalsResponse {
  proposals: MeetingProposal[];
}

export interface MeetingAcceptRequest {
  startTime: string; // ISO8601
  endTime: string; // ISO8601
  title: string;
  description: string;
  categoryId: string;
  locationName: string;
  aiGeneratedNotes: string;
  originalNote: string;
}

export interface MeetingAcceptResponse {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    suggestedAttire: string;
  };
  startTime: string; // ISO8601
  endTime: string; // ISO8601
  locationName: string;
  aiGenerated: boolean;
  originalNote: string;
  aiGeneratedNotes: string;
  createdAt: string; // ISO8601
  conflicts?: MeetingConflict[];
}

export interface MeetingConflict {
  id: string;
  title: string;
  startTime: string; // ISO8601
  endTime: string; // ISO8601
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ProposalPageState {
  status: "loading" | "error" | "success" | "initial";
  proposals: MeetingProposal[];
  selectedProposal: MeetingProposal | null;
  error: ApiError | null;
  conflicts: MeetingConflict[] | null;
  showConfirmDialog: boolean;
  confirmationType: "cancel-generation" | "accept-with-conflicts" | null;
}

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  category: {
    id: string;
    name: string;
    suggested_attire: string | null;
  };
  startTime: string;
  endTime: string;
  locationName: string | null;
  aiGenerated: boolean;
  originalNote: string | null;
  aiGeneratedNotes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export function transformSupabaseMeeting(
  meeting: Database["public"]["Tables"]["meetings"]["Row"] & {
    meeting_categories?: Database["public"]["Tables"]["meeting_categories"]["Row"] | null;
  }
): Meeting {
  return {
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    category: {
      id: meeting.meeting_categories?.id || "",
      name: meeting.meeting_categories?.name || "",
      suggested_attire: meeting.meeting_categories?.suggested_attire || null,
    },
    startTime: meeting.start_time,
    endTime: meeting.end_time || meeting.start_time,
    locationName: meeting.location || null,
    aiGenerated: meeting.ai_generated,
    originalNote: null, // These fields don't exist in the database yet
    aiGeneratedNotes: meeting.ai_generated_notes,
    createdAt: meeting.created_at,
    updatedAt: meeting.updated_at || meeting.created_at,
    userId: meeting.user_id,
  };
}

export interface MeetingFilters {
  searchTerm: string;
  category: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  pagination?: PaginationState;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    reminders: {
      enabled: boolean;
      beforeMinutes: number;
    };
  };
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

export interface Note {
  id: string;
  meeting_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Suggestion {
  id: string;
  meeting_id: string;
  content: string;
  type: "time" | "location" | "agenda" | "attendees";
  created_at: string;
  user_id: string;
  status: "pending" | "accepted" | "rejected";
}
