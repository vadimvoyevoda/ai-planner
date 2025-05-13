import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MeetingCard } from "../MeetingCard";
import type { Meeting } from "@/types";

describe("MeetingCard", () => {
  const mockMeeting: Meeting = {
    id: "123",
    title: "Test Meeting",
    startTime: "2023-06-01T10:00:00Z",
    endTime: "2023-06-01T11:00:00Z",
    description: "Test Description",
    participants: [],
    notes: "",
    userId: "user123",
    createdAt: "2023-05-30T10:00:00Z",
  };

  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders meeting information correctly", () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByText("Test Meeting")).toBeInTheDocument();
    expect(screen.getByText(/01.06/)).toBeInTheDocument();
    expect(
      screen.getByText((content) => {
        return content.includes("12:00") || content.includes("10:00");
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Szczegóły →")).toBeInTheDocument();
  });

  it("does not show delete button when onDelete is not provided", () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.queryByLabelText("Usuń spotkanie")).not.toBeInTheDocument();
  });

  it("shows delete button when onDelete is provided", () => {
    render(<MeetingCard meeting={mockMeeting} onDelete={mockOnDelete} />);

    expect(screen.getByLabelText("Usuń spotkanie")).toBeInTheDocument();
  });

  it("calls onDelete when delete is confirmed", async () => {
    render(<MeetingCard meeting={mockMeeting} onDelete={mockOnDelete} />);

    // Open delete dialog
    const deleteButton = screen.getByLabelText("Usuń spotkanie");
    await userEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByText("Usuń");
    await userEvent.click(confirmButton);

    // Verify onDelete was called with the meeting ID
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith("123");
    });
  });

  it("does not call onDelete when delete is canceled", async () => {
    render(<MeetingCard meeting={mockMeeting} onDelete={mockOnDelete} />);

    // Open delete dialog
    const deleteButton = screen.getByLabelText("Usuń spotkanie");
    await userEvent.click(deleteButton);

    // Cancel deletion
    const cancelButton = screen.getByText("Anuluj");
    await userEvent.click(cancelButton);

    // Verify onDelete was not called
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
