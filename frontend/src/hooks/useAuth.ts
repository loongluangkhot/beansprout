/**
 * useAuth Hook
 * Custom hook for accessing authentication state and actions
 */

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { register as registerApi } from "@/lib/api/auth";
import type { RegisterRequest } from "@/types/auth";

function normalizeRedirectPath(redirectTo: string): string {
  if (!redirectTo.startsWith("/")) {
    return "/";
  }
  if (redirectTo.startsWith("//")) {
    return "/";
  }
  return redirectTo;
}

export function useAuth() {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    setLoading,
    setError,
    performLogout,
    clearError,
    login,
  } = useAuthStore();

  /**
   * Register a new user account
   */
  const register = useCallback(
    async (data: RegisterRequest) => {
      clearError();
      setLoading(true);

      try {
        const response = await registerApi(data);
        setAuth(response.data.user, response.data.access_token);
        // Redirect to home after successful registration
        router.push("/");
        return response;
      } catch (err) {
        // Handle API errors
        const errorObj = err as {
          error?: { detail?: string; type?: string };
        };
        const errorMessage =
          errorObj?.error?.detail ||
          "Registration failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, setLoading, setAuth, setError, router]
  );

  /**
    * Log out the current user - calls backend to invalidate token, then clears local state
    */
  const handleLogout = useCallback(async () => {
    await performLogout();
    // Redirect to login with a friendly message
    router.push("/login?logged_out=true");
  }, [performLogout, router]);

  /**
   * Login with existing credentials
   */
  const handleLogin = useCallback(
    async (email: string, password: string, redirectTo = "/") => {
      clearError();
      setLoading(true);

      try {
        await login(email, password);
        router.push(normalizeRedirectPath(redirectTo));
        return true;
      } catch (err) {
        // Error is already set in the store
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, setLoading, login, router]
  );

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    register,
    login: handleLogin,
    logout: handleLogout,
    clearError,
  };
}
