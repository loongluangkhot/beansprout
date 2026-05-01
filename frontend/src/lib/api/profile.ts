/**
 * Profile API Client
 * API functions for profile endpoints
 */

import { apiRequest, createAuthHeaders } from "./client";

export interface ReadingHistoryItem {
  title: string;
  author: string;
  completed_date?: string;
}

export interface ProfileData {
  id: string;
  email: string;
  display_name?: string;
  bio?: string;
  favorite_genres?: string[];
  reading_history?: ReadingHistoryItem[];
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicProfileData {
  id: string;
  display_name?: string;
  bio?: string;
  favorite_genres?: string[];
  profile_photo_url?: string;
}

export interface ProfileResponse {
  data: ProfileData;
}

export interface PublicProfileResponse {
  data: PublicProfileData;
}

export interface ProfileUpdateRequest {
  bio?: string;
  favorite_genres?: string[];
  reading_history?: ReadingHistoryItem[];
}

const PROFILE_ENDPOINT = "/v1/users";

/**
 * Get current user's profile
 */
export async function getProfile(token: string): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>(`${PROFILE_ENDPOINT}/me`, {
    method: "GET",
    headers: createAuthHeaders(token),
  });
}

/**
 * Update current user's profile
 */
export async function updateProfile(
  data: ProfileUpdateRequest,
  token: string
): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>(`${PROFILE_ENDPOINT}/me`, {
    method: "PATCH",
    headers: createAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

/**
 * Upload profile photo
 */
export async function uploadProfilePhoto(
  file: File,
  token: string
): Promise<ProfileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<ProfileResponse>(`${PROFILE_ENDPOINT}/me/photo`, {
    method: "POST",
    headers: createAuthHeaders(token),
    body: formData,
    // Don't set Content-Type - let browser set it with boundary
  });
}

/**
 * Delete profile photo
 */
export async function deleteProfilePhoto(token: string): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>(`${PROFILE_ENDPOINT}/me/photo`, {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });
}

/**
 * Get a user's public profile
 */
export async function getPublicProfile(userId: string): Promise<PublicProfileResponse> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    throw new Error("userId is required");
  }

  const encodedUserId = encodeURIComponent(normalizedUserId);
  return apiRequest<PublicProfileResponse>(`${PROFILE_ENDPOINT}/${encodedUserId}/profile`, {
    method: "GET",
  });
}
