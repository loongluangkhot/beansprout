/**
 * Authentication Store
 * Zustand store for managing authentication state
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/auth";
import { apiRequest } from "@/lib/api/client";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  setLoading: (loading: boolean) => void;
  setValidating: (validating: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  performLogout: () => Promise<void>;
  clearError: () => void;
  validateSession: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

interface SessionValidationResponse {
  data: {
    valid: boolean;
    user: {
      id: string;
      email: string;
    };
  };
}

interface LoginApiResponse {
  data: {
    user: {
      id: string;
      email: string;
      created_at: string;
    };
    access_token: string;
    token_type: string;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isValidating: false,
      error: null,
      
      // Actions
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
          isValidating: false,
        }),
      
      setLoading: (loading) =>
        set({ isLoading: loading }),
      
      setValidating: (validating) =>
        set({ isValidating: validating }),
      
      setError: (error) =>
        set({ error, isLoading: false, isValidating: false }),
      
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isValidating: false,
        }),
      
      clearError: () =>
        set({ error: null }),
      
      // Full logout: call backend and clear local state
      performLogout: async () => {
        const { token, logout } = get();
        
        if (token) {
          try {
            // Dynamic import to avoid circular dependencies
            const { logout: logoutApi } = await import("@/lib/api/auth");
            await logoutApi(token);
          } catch {
            // Even if API call fails, continue with local logout
            // Token might already be invalid
          }
        }
        
        // Clear local state regardless of API result
        logout();
      },
      
      validateSession: async () => {
        const { token, logout } = get();
        if (!token) {
          set({ isAuthenticated: false, isValidating: false });
          return false;
        }
        
        set({ isValidating: true });
        
        try {
          // Server-side validation
          const response = await apiRequest<SessionValidationResponse>(
            "/v1/auth/validate-session",
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          if (response.data.valid) {
            // Update user data from server response
            set({
              user: {
                id: response.data.user.id,
                email: response.data.user.email,
                created_at: "",
              },
              isValidating: false,
              isAuthenticated: true,
            });
            return true;
          } else {
            logout();
            return false;
          }
        } catch {
          // Token is invalid or server is unavailable
          logout();
          return false;
        }
      },

      login: async (email: string, password: string) => {
        const { setAuth, setLoading, setError } = get();
        
        setLoading(true);
        
        try {
          // Dynamic import to avoid circular dependencies
          const { login: loginApi } = await import("@/lib/api/auth");
          
          const response = await loginApi({ email, password });
          
          setAuth(
            {
              id: response.data.user.id,
              email: response.data.user.email,
              created_at: response.data.user.created_at,
            },
            response.data.access_token
          );
        } catch (err) {
          const errorObj = err as {
            error?: { detail?: string; type?: string };
          };
          const errorMessage =
            errorObj?.error?.detail ||
            "Invalid email or password";
          setError(errorMessage);
          throw err;
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: "beansprout-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
