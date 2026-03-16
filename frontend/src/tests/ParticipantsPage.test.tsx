import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ParticipantsPage from "../pages/ParticipantsPage";
import { useParticipants } from "../hooks/useParticipants";
import type { ParticipantRead } from "../types/api";

vi.mock("../hooks/useParticipants");

const mockParticipant: ParticipantRead = {
  participant_id: "11111111-1111-1111-1111-111111111111",
  subject_id: "SUB-001",
  study_group: "treatment",
  enrollment_date: "2024-01-15",
  status: "active",
  age: 35,
  gender: "F",
};

function renderParticipantsPage() {
  return render(
    <MemoryRouter>
      <ParticipantsPage />
    </MemoryRouter>,
  );
}

describe("ParticipantsPage", () => {
  beforeEach(() => {
    vi.mocked(useParticipants).mockReturnValue({
      participants: [],
      loading: false,
      error: null,
      fetchParticipants: vi.fn(),
      addParticipant: vi.fn(),
    });
  });

  it("renders participant list when data is returned", () => {
    vi.mocked(useParticipants).mockReturnValue({
      participants: [mockParticipant],
      loading: false,
      error: null,
      fetchParticipants: vi.fn(),
      addParticipant: vi.fn(),
    });

    renderParticipantsPage();

    expect(screen.getByRole("heading", { name: /participants/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add participant/i })).toBeInTheDocument();
    expect(screen.getByText("Subject ID")).toBeInTheDocument();
    expect(screen.getByText("SUB-001")).toBeInTheDocument();
  });

  it("shows loading state when loading", () => {
    vi.mocked(useParticipants).mockReturnValue({
      participants: [],
      loading: true,
      error: null,
      fetchParticipants: vi.fn(),
      addParticipant: vi.fn(),
    });

    renderParticipantsPage();

    // When loading, table is replaced by skeleton so table header is not present
    expect(screen.queryByText("Subject ID")).not.toBeInTheDocument();
  });

  it("shows empty state when no participants", () => {
    renderParticipantsPage();

    expect(screen.getByText("No participants yet.")).toBeInTheDocument();
  });
});
