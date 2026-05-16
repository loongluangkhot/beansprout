import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SeasonCreateForm } from "./season-create-form";

jest.mock("@/lib/api/seasons", () => ({
  createSeason: jest.fn(),
  updateSeasonSchedule: jest.fn(),
}));
jest.mock("@/stores/auth-store", () => ({
  useAuthStore: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const { createSeason, updateSeasonSchedule } = jest.requireMock("@/lib/api/seasons");
const { useAuthStore } = jest.requireMock("@/stores/auth-store");
const { useRouter } = jest.requireMock("next/navigation");

function futureLocalDatetime(daysAhead = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T10:00`;
}

function pastLocalDatetime(daysBack = 1): string {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T10:00`;
}

describe("SeasonCreateForm", () => {
  const push = jest.fn();

  function renderForm() {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <SeasonCreateForm />
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    push.mockReset();
    createSeason.mockReset();
    updateSeasonSchedule.mockReset();
    useRouter.mockReturnValue({ push });
    useAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ isAuthenticated: true, token: "token-123" })
    );
  });

  it("shows validation errors for missing required fields", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /Create season/i }));

    expect(await screen.findByText(/Please add a season title/i)).toBeInTheDocument();
    expect(await screen.findByText(/Please add the book title/i)).toBeInTheDocument();
    expect(await screen.findByText(/Please add the author name/i)).toBeInTheDocument();
    expect(await screen.findByText(/Please choose a start date and time/i)).toBeInTheDocument();
    expect(createSeason).not.toHaveBeenCalled();
  });

  it("submits create season payload and routes to detail page", async () => {
    createSeason.mockResolvedValue({
      data: {
        id: "season-123",
      },
      meta: {},
    });
    updateSeasonSchedule.mockResolvedValue({ data: {}, meta: {} });

    renderForm();

    fireEvent.change(screen.getByLabelText(/Season title/i), {
      target: { value: "Spring Reads" },
    });
    fireEvent.change(screen.getByLabelText(/Book title/i), {
      target: { value: "Tomorrow" },
    });
    fireEvent.change(screen.getByLabelText(/Author/i), {
      target: { value: "Gabrielle Zevin" },
    });
    fireEvent.change(screen.getByLabelText(/Season theme/i), {
      target: { value: "Contemporary Relationships" },
    });
    fireEvent.change(screen.getByLabelText(/Maximum members/i), {
      target: { value: "22" },
    });
    fireEvent.change(screen.getByLabelText(/Start date and time/i), {
      target: { value: futureLocalDatetime(60) },
    });
    fireEvent.change(screen.getByLabelText(/Location name/i), {
      target: { value: "Bean & Leaf Cafe" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create season/i }));

    await waitFor(() => {
      expect(createSeason).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Spring Reads",
          book_title: "Tomorrow",
          book_author: "Gabrielle Zevin",
          theme: "Contemporary Relationships",
          max_members: 22,
          membership_mode: "auto-join",
          location_mode: "in-person",
          location_name: "Bean & Leaf Cafe",
        }),
        "token-123"
      );
      expect(push).toHaveBeenCalledWith("/seasons/season-123");
      expect(updateSeasonSchedule).toHaveBeenCalledWith(
        "season-123",
        expect.objectContaining({
          duration_weeks: 10,
          frequency: "weekly",
        }),
        "token-123"
      );
    });
  });

  it("shows future-date validation feedback for past start dates", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Season title/i), {
      target: { value: "Spring Reads" },
    });
    fireEvent.change(screen.getByLabelText(/Book title/i), {
      target: { value: "Tomorrow" },
    });
    fireEvent.change(screen.getByLabelText(/Author/i), {
      target: { value: "Gabrielle Zevin" },
    });
    fireEvent.change(screen.getByLabelText(/Maximum members/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/Start date and time/i), {
      target: { value: pastLocalDatetime(2) },
    });
    fireEvent.change(screen.getByLabelText(/Location name/i), {
      target: { value: "Bean & Leaf Cafe" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create season/i }));

    await waitFor(() => {
      expect(createSeason).not.toHaveBeenCalled();
    });
  });

  it("supports schedule generation and add-edit-remove before submit", async () => {
    createSeason.mockResolvedValue({
      data: { id: "season-xyz" },
      meta: {},
    });
    updateSeasonSchedule.mockResolvedValue({ data: {}, meta: {} });

    renderForm();

    fireEvent.change(screen.getByLabelText(/Season title/i), {
      target: { value: "Spring Reads" },
    });
    fireEvent.change(screen.getByLabelText(/Book title/i), {
      target: { value: "Tomorrow" },
    });
    fireEvent.change(screen.getByLabelText(/Author/i), {
      target: { value: "Gabrielle Zevin" },
    });

    const startValue = futureLocalDatetime(45);
    fireEvent.change(screen.getByLabelText(/Start date and time/i), {
      target: { value: startValue },
    });
    fireEvent.change(screen.getByLabelText(/Location name/i), {
      target: { value: "Bean & Leaf Cafe" },
    });

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Remove/i })).toHaveLength(10);
    });

    fireEvent.click(screen.getByRole("button", { name: /Add meetup/i }));
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Remove/i })).toHaveLength(11);
    });

    const draftInputs = screen.getAllByDisplayValue(startValue);
    fireEvent.change(draftInputs[0], { target: { value: futureLocalDatetime(46) } });

    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(removeButtons[removeButtons.length - 1]);

    fireEvent.click(screen.getByRole("button", { name: /Create season/i }));

    await waitFor(() => {
      expect(updateSeasonSchedule).toHaveBeenCalledWith(
        "season-xyz",
        expect.objectContaining({
          meetup_datetimes: expect.arrayContaining([
            expect.stringMatching(/Z$/),
          ]),
          frequency: "weekly",
          duration_weeks: 10,
        }),
        "token-123"
      );
    });
  });

  it("requires virtual meeting link when meetup format is virtual", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Season title/i), {
      target: { value: "Spring Reads" },
    });
    fireEvent.change(screen.getByLabelText(/Book title/i), {
      target: { value: "Tomorrow" },
    });
    fireEvent.change(screen.getByLabelText(/Author/i), {
      target: { value: "Gabrielle Zevin" },
    });
    fireEvent.change(screen.getByLabelText(/Start date and time/i), {
      target: { value: futureLocalDatetime(45) },
    });
    fireEvent.change(screen.getByLabelText(/Meetup format/i), {
      target: { value: "virtual" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create season/i }));

    expect(await screen.findByText(/Please add a virtual meeting link/i)).toBeInTheDocument();
    expect(createSeason).not.toHaveBeenCalled();
  });
});
