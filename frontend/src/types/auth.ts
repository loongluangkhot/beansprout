/**
 * Authentication Types
 * Type definitions for authentication-related data structures
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
  profile_photo_url?: string | null;
}

export interface AuthData {
  user: User;
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  data: AuthData;
  meta?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: {
    type: string;
    title: string;
    status: number;
    detail: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ValidationError {
  type: "validation_error";
  title: string;
  status: number;
  detail: string;
}
