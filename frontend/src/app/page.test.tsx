import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "./page";

const mockReplace = jest.fn();
const mockUseAuthStore = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: { isAuthenticated: boolean }) => boolean) =>
    mockUseAuthStore(selector),
}));

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects authenticated users to /seasons", async () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ isAuthenticated: true })
    );

    const { container } = render(<HomePage />);

    expect(container.firstChild).toBeNull();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/seasons");
    });
  });

  it("shows landing buttons for unauthenticated users", () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ isAuthenticated: false })
    );

    render(<HomePage />);

    expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
