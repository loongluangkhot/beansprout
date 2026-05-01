/**
 * Login Form Tests
 * Unit tests for the login form component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./login-form";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
}));

// Mock the useAuth hook
const mockUseAuth = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });
  });

  describe("Form Rendering", () => {
    it("renders login form with email and password fields", () => {
      render(<LoginForm />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it("renders sign in button", () => {
      render(<LoginForm />);
      
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("renders remember me checkbox", () => {
      render(<LoginForm />);
      
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it("renders sign up link", () => {
      render(<LoginForm />);
      
      expect(screen.getByRole("link", { name: /create account/i })).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("shows validation error for empty email", async () => {
      render(<LoginForm />);
      
      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter your email/i)).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid email format", async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.blur(emailInput);
      
      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it("shows validation error for empty password", async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      
      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
      });
    });
  });

  describe("Password Visibility", () => {
    it("toggles password visibility", () => {
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      
      const toggleButton = screen.getByLabelText(/show password/i);
      fireEvent.click(toggleButton);
      
      expect(passwordInput).toHaveAttribute("type", "text");
      
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Error Display", () => {
    it("displays error message when error prop is provided", () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isLoading: false,
        error: "Invalid email or password",
        clearError: jest.fn(),
      });
      
      render(<LoginForm />);
      
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("disables submit button when loading", () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isLoading: true,
        error: null,
        clearError: jest.fn(),
      });
      
      render(<LoginForm />);
      
      const submitButton = screen.getByRole("button", { name: /signing in/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Redirect Behavior", () => {
    it("uses /seasons as default redirect when query param is missing", async () => {
      const loginMock = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        login: loginMock,
        isLoading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "reader@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "SecurePass123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(loginMock).toHaveBeenCalledWith(
          "reader@example.com",
          "SecurePass123",
          "/seasons"
        );
      });
    });
  });
});
