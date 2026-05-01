import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent } from "@testing-library/react";
import { render, screen, waitFor } from "@testing-library/react";

import { SeasonLibrary } from "./season-library";

jest.mock("@/lib/api/seasons", () => ({
  getSeasons: jest.fn(),
}));

const { getSeasons } = jest.requireMock("@/lib/api/seasons");

describe("SeasonLibrary", () => {
  function renderWithQueryClient() {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <SeasonLibrary />
      </QueryClientProvider>
    );
  }

  it("renders season cards from API", async () => {
    getSeasons.mockResolvedValue({
      data: [
        {
          id: "season-1",
          title: "Spring Reads",
          theme: "Contemporary",
          next_meetup_at: "2026-05-10T10:00:00Z",
          book_title: "Tomorrow, and Tomorrow, and Tomorrow",
          book_author: "Gabrielle Zevin",
          cover_image_url: "https://example.com/cover.jpg",
          member_count: 12,
        },
      ],
      meta: { page: 1, page_size: 10, total: 1, has_next: false },
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText("Spring Reads")).toBeInTheDocument();
      expect(screen.getByText(/Gabrielle Zevin/)).toBeInTheDocument();
      expect(screen.getByText(/Theme: Contemporary/)).toBeInTheDocument();
    });
  });

  it("shows warm empty state when no seasons exist", async () => {
    getSeasons.mockResolvedValue({
      data: [],
      meta: { page: 1, page_size: 10, total: 0, has_next: false },
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(
        screen.getByText(/No seasons yet. Be the first to plant one/i)
      ).toBeInTheDocument();
    });
  });

  it("shows loading indicators while fetching the next page", async () => {
    let resolveNextPage: ((value: unknown) => void) | null = null;
    const nextPagePromise = new Promise((resolve) => {
      resolveNextPage = resolve;
    });

    getSeasons
      .mockResolvedValueOnce({
        data: [
          {
            id: "season-1",
            title: "Spring Reads",
            theme: "Contemporary",
            next_meetup_at: "2026-05-10T10:00:00Z",
            book_title: "Tomorrow, and Tomorrow, and Tomorrow",
            book_author: "Gabrielle Zevin",
            cover_image_url: "https://example.com/cover.jpg",
            member_count: 12,
          },
        ],
        meta: { page: 1, page_size: 10, total: 11, has_next: true },
      })
      .mockImplementationOnce(() => nextPagePromise);

    renderWithQueryClient();

    await screen.findByText("Spring Reads");

    const loadMoreButton = screen.getByRole("button", { name: /Load more seasons/i });
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Loading more seasons")).toBeInTheDocument();
    });

    resolveNextPage?.({
      data: [],
      meta: { page: 2, page_size: 10, total: 11, has_next: false },
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("Loading more seasons")).not.toBeInTheDocument();
    });
  });

  it("applies search and filter controls to API queries", async () => {
    getSeasons.mockResolvedValue({
      data: [],
      meta: { page: 1, page_size: 10, total: 0, has_next: false },
    });

    renderWithQueryClient();

    const searchInput = await screen.findByLabelText(/Search seasons/i);
    fireEvent.change(searchInput, { target: { value: "spring" } });

    const genreSelect = screen.getByLabelText(/Genre filter/i);
    fireEvent.change(genreSelect, { target: { value: "Contemporary Fiction" } });

    const scheduleSelect = screen.getByLabelText(/Schedule filter/i);
    fireEvent.change(scheduleSelect, { target: { value: "this-week" } });

    await waitFor(() => {
      expect(getSeasons).toHaveBeenLastCalledWith(1, 10, {
        search: "spring",
        genre: "Contemporary Fiction",
        schedule: "this-week",
      });
    });
  });

  it("shows no-results guidance with clear filters action", async () => {
    getSeasons.mockResolvedValue({
      data: [],
      meta: { page: 1, page_size: 10, total: 0, has_next: false },
    });

    renderWithQueryClient();

    const searchInput = await screen.findByLabelText(/Search seasons/i);
    fireEvent.change(searchInput, { target: { value: "nothing-matches" } });

    await waitFor(() => {
      expect(screen.getByText(/No seasons match your search/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Clear filters/i })).toBeInTheDocument();
  });
});
