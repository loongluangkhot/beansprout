import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";

import { SeasonDetail } from "./season-detail";

jest.mock("@/lib/api/seasons", () => ({
  getSeasonById: jest.fn(),
}));

const { getSeasonById } = jest.requireMock("@/lib/api/seasons");

describe("SeasonDetail", () => {
  function renderWithQueryClient(seasonId = "season-1") {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <SeasonDetail seasonId={seasonId} />
      </QueryClientProvider>
    );
  }

  it("renders season detail content", async () => {
    getSeasonById.mockResolvedValue({
      data: {
        id: "season-1",
        title: "Spring Reads",
        theme: "Contemporary Fiction",
        description: "A warm reading circle for reflective readers.",
        book_title: "Tomorrow, and Tomorrow, and Tomorrow",
        book_author: "Gabrielle Zevin",
        cover_image_url: "https://example.com/cover.jpg",
        member_count: 12,
        location_name: "Bean & Leaf Cafe",
        location_url: "https://maps.example.com/bean-leaf",
        creator: {
          id: "creator-1",
          name: "Season Host",
          bio: "I host reflective, welcoming reading circles.",
          profile_photo_url: "https://example.com/host.jpg",
        },
        members: [
          { id: "member-1", name: "Member One", profile_photo_url: "https://example.com/m1.jpg" },
          { id: "member-2", name: "Member Two", profile_photo_url: null },
        ],
        meetups: [
          { id: "meetup-1", starts_at: "2026-06-01T10:00:00Z" },
          { id: "meetup-2", starts_at: "2026-06-08T10:00:00Z" },
        ],
      },
      meta: { meetup_count: 2 },
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Spring Reads/i })).toBeInTheDocument();
      expect(screen.getByText(/Gabrielle Zevin/)).toBeInTheDocument();
      expect(screen.getByText(/Bean & Leaf Cafe/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /View creator profile: Season Host/i })).toHaveAttribute(
        "href",
        "/profile/creator-1"
      );
      expect(screen.getByText(/I host reflective, welcoming reading circles/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /View member profile: Member One/i })).toHaveAttribute(
        "href",
        "/profile/member-1"
      );
      expect(screen.getByRole("link", { name: /Open location link/i })).toHaveAttribute(
        "href",
        "https://maps.example.com/bean-leaf"
      );
    });
  });

  it("shows warm fallback messaging for missing optional fields", async () => {
    getSeasonById.mockResolvedValue({
      data: {
        id: "season-1",
        title: "Spring Reads",
        theme: null,
        description: null,
        book_title: "Tomorrow, and Tomorrow, and Tomorrow",
        book_author: "Gabrielle Zevin",
        cover_image_url: null,
        member_count: 0,
        location_name: null,
        location_url: null,
        creator: null,
        members: [],
        meetups: [],
      },
      meta: { meetup_count: 0 },
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText(/No description yet. Details will bloom soon/i)).toBeInTheDocument();
      expect(screen.getByText(/Location details will be shared soon/i)).toBeInTheDocument();
      expect(screen.getByText(/Creator details will be shared soon/i)).toBeInTheDocument();
      expect(screen.getByText(/No members have joined yet/i)).toBeInTheDocument();
      expect(screen.getByText(/No meetups scheduled yet/i)).toBeInTheDocument();
    });
  });

  it("shows friendly error state when season is unavailable", async () => {
    getSeasonById.mockRejectedValue(new Error("Not found"));

    renderWithQueryClient("missing-season");

    await waitFor(() => {
      expect(screen.getByText(/We could not load this season right now/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Try again/i })).toBeInTheDocument();
    });
  });
});
