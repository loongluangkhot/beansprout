import { render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "./page";

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

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects authenticated users to /seasons", async () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ isAuthenticated: true })
    );

    render(<RegisterPage />);

    expect(screen.getByText("Redirecting...")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/seasons");
    });
  });
});
