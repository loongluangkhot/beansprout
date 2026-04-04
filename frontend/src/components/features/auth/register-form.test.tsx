/**
 * Authentication Tests
 * Tests for authentication-related functionality
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegisterForm } from "@/components/features/auth/register-form";
import { useAuthStore } from "@/stores/auth-store";

// Mock the useAuth hook
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    register: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

describe("RegisterForm", () => {
  describe("Email Validation", () => {
    it("shows error for invalid email format", async () => {
      render(<RegisterForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it("accepts valid email format", async () => {
      render(<RegisterForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      
      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Password Validation", () => {
    it("shows all requirements when password is empty", () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: "" } });
      
      expect(screen.getByText(/8\+ characters/i)).toBeInTheDocument();
      expect(screen.getByText(/contains letter/i)).toBeInTheDocument();
      expect(screen.getByText(/contains number/i)).toBeInTheDocument();
    });

    it("shows requirements as met when password is valid", async () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: "SecurePass123" } });
      
      await waitFor(() => {
        const requirements = screen.getAllByText(/✓/);
        expect(requirements.length).toBe(3);
      });
    });
  });

  describe("Form Submission", () => {
    it("disables submit button when requirements not met", () => {
      render(<RegisterForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });
      
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "weak" } });
      
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when all requirements met", async () => {
      render(<RegisterForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });
      
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "SecurePass123" } });
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });
});

describe("AuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should set auth state", () => {
    const { setAuth } = useAuthStore.getState();
    
    setAuth(
      { id: "123", email: "test@example.com", created_at: "2026-04-03" },
      "test-token"
    );
    
    const state = useAuthStore.getState();
    
    expect(state.user).toEqual({ id: "123", email: "test@example.com", created_at: "2026-04-03" });
    expect(state.token).toBe("test-token");
    expect(state.isAuthenticated).toBe(true);
  });

  it("should clear error", () => {
    const { setError, clearError } = useAuthStore.getState();
    
    setError("Test error");
    expect(useAuthStore.getState().error).toBe("Test error");
    
    clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it("should logout", () => {
    const { setAuth, logout } = useAuthStore.getState();
    
    setAuth(
      { id: "123", email: "test@example.com", created_at: "2026-04-03" },
      "test-token"
    );
    
    logout();
    
    const state = useAuthStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

describe("useAuth", () => {
  it("should export useAuth hook", () => {
    const { useAuth } = require("@/hooks/useAuth");
    expect(typeof useAuth).toBe("function");
  });
});
