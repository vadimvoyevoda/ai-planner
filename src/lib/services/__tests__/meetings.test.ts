import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMeetings,
  getUpcomingMeetings,
  deleteMeeting,
  exportMeeting,
  generateMeetingSuggestions,
} from "../meetings";
import type { Meeting } from "@/types";

// Mockowanie globalnego fetch API
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Przygotowanie danych testowych
const mockMeeting: Meeting = {
  id: "123",
  title: "Test Meeting",
  description: "Test Description",
  category: {
    id: "cat1",
    name: "Category 1",
    suggested_attire: null,
  },
  startTime: "2023-06-01T10:00:00Z",
  endTime: "2023-06-01T11:00:00Z",
  locationName: "Test Location",
  coordinates: { lat: 50.123, lng: 19.456 },
  aiGenerated: false,
  originalNote: null,
  aiGeneratedNotes: null,
  createdAt: "2023-05-30T10:00:00Z",
  updatedAt: "2023-05-30T10:00:00Z",
  userId: "user123",
};

const mockPagination = {
  page: 1,
  limit: 10,
  total: 100,
};

describe("Meetings Service", () => {
  // Reset mocków przed każdym testem
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Testy dla getMeetings
  describe("getMeetings", () => {
    it("should fetch meetings without params", async () => {
      // Arrange
      const mockResponse = {
        meetings: [mockMeeting],
        pagination: mockPagination,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Act
      const result = await getMeetings();

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith("/api/meetings");
      expect(result).toEqual(mockResponse);
    });

    it("should include query params when options are provided", async () => {
      // Arrange
      const options = {
        upcoming: true,
        page: 2,
        limit: 20,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ meetings: [], pagination: mockPagination }),
      });

      // Act
      await getMeetings(options);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith("/api/meetings?upcoming=true&page=2&limit=20");
    });

    it("should throw an error when the response is not ok", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      // Act & Assert
      await expect(getMeetings()).rejects.toThrow("Failed to fetch meetings");
    });
  });

  // Testy dla getUpcomingMeetings
  describe("getUpcomingMeetings", () => {
    it("should fetch upcoming meetings with default limit", async () => {
      // Arrange
      const mockResponse = {
        meetings: [mockMeeting],
        pagination: mockPagination,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Act
      const result = await getUpcomingMeetings();

      // Assert
      expect(mockFetch).toHaveBeenCalledWith("/api/meetings?upcoming=true&limit=5");
      expect(result).toEqual(mockResponse.meetings);
    });

    it("should use custom limit when provided", async () => {
      // Arrange
      const customLimit = 10;
      const mockResponse = {
        meetings: [mockMeeting, mockMeeting], // Dwa spotkania
        pagination: mockPagination,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Act
      const result = await getUpcomingMeetings(customLimit);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith("/api/meetings?upcoming=true&limit=10");
      expect(result).toEqual(mockResponse.meetings);
      expect(result.length).toBe(2);
    });
  });

  // Testy dla deleteMeeting
  describe("deleteMeeting", () => {
    it("should delete a meeting by id", async () => {
      // Arrange
      const meetingId = "123";
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      // Act
      await deleteMeeting(meetingId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith("/api/meetings/123", {
        method: "DELETE",
      });
    });

    it("should throw an error when deletion fails", async () => {
      // Arrange
      const meetingId = "456";
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      // Act & Assert
      await expect(deleteMeeting(meetingId)).rejects.toThrow("Failed to delete meeting");
    });
  });

  // Testy dla exportMeeting
  describe("exportMeeting", () => {
    it("should export a meeting by id", async () => {
      // Arrange
      const meetingId = "123";
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      // Act
      await exportMeeting(meetingId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith("/api/meetings/123/export", {
        method: "POST",
      });
    });

    it("should throw an error when export fails", async () => {
      // Arrange
      const meetingId = "456";
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      // Act & Assert
      await expect(exportMeeting(meetingId)).rejects.toThrow("Failed to export meeting");
    });
  });

  // Testy dla generateMeetingSuggestions
  describe("generateMeetingSuggestions", () => {
    it("should generate meeting suggestions from a note", async () => {
      // Arrange
      const note = "Meeting with John about project X";
      const mockResponse = {
        meetings: [mockMeeting],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Act
      const result = await generateMeetingSuggestions(note);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith("/api/meetings/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw an error when suggestion generation fails", async () => {
      // Arrange
      const note = "Invalid note";
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      // Act & Assert
      await expect(generateMeetingSuggestions(note)).rejects.toThrow("Failed to generate meeting suggestions");
    });
  });
});
