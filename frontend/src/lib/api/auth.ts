/**
 * Authentication API Client
 * API functions for authentication endpoints
 */

import { apiRequest, createAuthHeaders } from "./client";
import type { AuthResponse, RegisterRequest } from "@/types/auth";

const AUTH_ENDPOINT = "/v1/auth";

/**
 * Register a new user account
 */
export async function register(
  data: RegisterRequest,
  token?: string | null
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(`${AUTH_ENDPOINT}/register`, {
    method: "POST",
    headers: createAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

/**
 * Login with existing credentials
 */
export async function login(
  data: { email: string; password: string },
  token?: string | null
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(`${AUTH_ENDPOINT}/login`, {
    method: "POST",
    headers: createAuthHeaders(token),
    body: JSON.stringify(data),
  });
}
