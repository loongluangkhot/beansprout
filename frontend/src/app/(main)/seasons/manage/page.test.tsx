import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";

import ManageSeasonsPage from "./page";

jest.mock("@/lib/api/seasons", () => ({
  getCreatorSeasons: jest.fn(),
}));
jest.mock("@/stores/auth-store", () => ({
  useAuthStore: jest.fn(),
}));

const { getCreatorSeasons } = jest.requireMock("@/lib/api/seasons");
const { useAuthStore } = jest.requireMock("@/stores/auth-store");

describe("ManageSeasonsPage", () => {
  beforeEach(() => {
    getCreatorSeasons.mockReset();
    useAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ token: "token-123" })
    );
  });

  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <ManageSeasonsPage />
      </QueryClientProvider>
    );
  }

  it("renders creator seasons with published status", async () => {
    getCreatorSeasons.mockResolvedValue({
      data: [
        {
          id: "season-1",
          title: "Spring Reads",
          book_title: "Tomorrow",
          status: "published",
          is_public: true,
          created_at: "2026-05-16T10:00:00Z",
        },
      ],
      meta: {},
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Spring Reads")).toBeInTheDocument();
      expect(screen.getByText("Published")).toBeInTheDocument();
    });
  });
});
