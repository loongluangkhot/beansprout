import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SeasonDetail } from "./season-detail";

jest.mock("@/lib/api/seasons", () => ({
  getSeasonById: jest.fn(),
  joinSeason: jest.fn(),
}));
jest.mock("@/stores/auth-store", () => ({
  useAuthStore: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const { getSeasonById, joinSeason } = jest.requireMock("@/lib/api/seasons");
const { useAuthStore } = jest.requireMock("@/stores/auth-store");
const { useRouter } = jest.requireMock("next/navigation");

describe("SeasonDetail", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    joinSeason.mockReset();
    useRouter.mockReturnValue({ push });
    useAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        isAuthenticated: false,
        token: null,
      })
    );
  });

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
        location_mode: "in-person",
        location_name: "Bean & Leaf Cafe",
        location_url: "https://maps.example.com/bean-leaf",
        location_address: "123 Main St",
        creator: {
          id: "creator-1",
          name: "Season Host",
          bio: "I host reflective, welcoming reading circles.",
          profile_photo_url: "https://example.com/host.jpg",
        },
        is_member: false,
        can_join: true,
        is_full: false,
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
        location_mode: "in-person",
        location_name: null,
        location_url: null,
        location_address: null,
        creator: null,
        is_member: false,
        can_join: false,
        is_full: true,
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

  it("redirects unauthenticated users to login with season return path", async () => {
    getSeasonById.mockResolvedValue({
      data: {
        id: "season-1",
        title: "Spring Reads",
        theme: null,
        description: null,
        book_title: "Tomorrow",
        book_author: "Gabrielle Zevin",
        cover_image_url: null,
        member_count: 3,
        location_mode: "in-person",
        location_name: null,
        location_url: null,
        location_address: null,
        creator: null,
        is_member: false,
        can_join: true,
        is_full: false,
        members: [],
        meetups: [],
      },
      meta: { meetup_count: 0 },
    });

    renderWithQueryClient();

    const button = await screen.findByRole("button", { name: /Join Season/i });
    fireEvent.click(button);

    expect(push).toHaveBeenCalledWith("/login?redirect=%2Fseasons%2Fseason-1");
  });

  it("shows joined button for members", async () => {
    useAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        isAuthenticated: true,
        token: "token-123",
      })
    );
    getSeasonById.mockResolvedValue({
      data: {
        id: "season-1",
        title: "Spring Reads",
        theme: null,
        description: null,
        book_title: "Tomorrow",
        book_author: "Gabrielle Zevin",
        cover_image_url: null,
        member_count: 3,
        location_mode: "in-person",
        location_name: null,
        location_url: null,
        location_address: null,
        creator: null,
        is_member: true,
        can_join: false,
        is_full: false,
        members: [],
        meetups: [{ id: "meetup-1", starts_at: "2026-06-01T10:00:00Z" }],
      },
      meta: { meetup_count: 1 },
    });

    renderWithQueryClient();

    const button = await screen.findByRole("button", { name: /Joined/i });
    expect(button).toBeDisabled();
    expect(screen.getByRole("button", { name: /RSVP/i })).toBeInTheDocument();
  });

  it("joins season for authenticated users and refreshes detail", async () => {
    useAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        isAuthenticated: true,
        token: "token-123",
      })
    );
    getSeasonById
      .mockResolvedValueOnce({
        data: {
          id: "season-1",
          title: "Spring Reads",
          theme: null,
          description: null,
          book_title: "Tomorrow",
          book_author: "Gabrielle Zevin",
          cover_image_url: null,
          member_count: 3,
          location_mode: "in-person",
          location_name: null,
          location_url: null,
          location_address: null,
          creator: null,
          is_member: false,
          can_join: true,
          is_full: false,
          members: [],
          meetups: [{ id: "meetup-1", starts_at: "2026-06-01T10:00:00Z" }],
        },
        meta: { meetup_count: 1 },
      })
      .mockResolvedValueOnce({
        data: {
          id: "season-1",
          title: "Spring Reads",
          theme: null,
          description: null,
          book_title: "Tomorrow",
          book_author: "Gabrielle Zevin",
          cover_image_url: null,
          member_count: 4,
          location_mode: "in-person",
          location_name: null,
          location_url: null,
          location_address: null,
          creator: null,
          is_member: true,
          can_join: false,
          is_full: false,
          members: [],
          meetups: [{ id: "meetup-1", starts_at: "2026-06-01T10:00:00Z" }],
        },
        meta: { meetup_count: 1 },
      });
    joinSeason.mockResolvedValue({
      data: {
        season_id: "season-1",
        joined: true,
        is_member: true,
        member_count: 4,
        max_members: 10,
        is_full: false,
      },
      meta: {},
    });

    renderWithQueryClient();

    const button = await screen.findByRole("button", { name: /Join Season/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(joinSeason).toHaveBeenCalledWith("season-1", "token-123");
      expect(screen.getByRole("button", { name: /Joined/i })).toBeDisabled();
    });
  });
});
