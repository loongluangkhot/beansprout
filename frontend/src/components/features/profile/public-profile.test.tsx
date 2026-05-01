import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";

import { PublicProfile } from "./public-profile";

jest.mock("@/lib/api/profile", () => ({
  getPublicProfile: jest.fn(),
}));

const { getPublicProfile } = jest.requireMock("@/lib/api/profile");

describe("PublicProfile", () => {
  function renderWithQueryClient(userId = "user-1") {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <PublicProfile userId={userId} />
      </QueryClientProvider>
    );
  }

  it("renders public profile details", async () => {
    getPublicProfile.mockResolvedValue({
      data: {
        id: "user-1",
        display_name: "Reader One",
        bio: "Loves memoirs",
        favorite_genres: ["Memoir", "Fiction"],
        profile_photo_url: "https://example.com/avatar.jpg",
      },
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Reader One/i })).toBeInTheDocument();
      expect(screen.getByText(/Loves memoirs/i)).toBeInTheDocument();
      expect(screen.getByText("Memoir")).toBeInTheDocument();
    });
  });

  it("shows warm fallback text when optional fields are missing", async () => {
    getPublicProfile.mockResolvedValue({
      data: {
        id: "user-1",
        display_name: undefined,
        bio: undefined,
        favorite_genres: [],
        profile_photo_url: undefined,
      },
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Community Reader/i })).toBeInTheDocument();
      expect(screen.getByText(/No bio shared yet/i)).toBeInTheDocument();
      expect(screen.getByText(/No favorite genres shared yet/i)).toBeInTheDocument();
    });
  });

  it("shows a safe fallback when success payload is missing data", async () => {
    getPublicProfile.mockResolvedValue({});

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText(/This profile is not available yet/i)).toBeInTheDocument();
    });
  });
});
