/**
 * useProfile Hook
 * Custom hook for accessing and managing profile data
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { 
  getProfile, 
  updateProfile, 
  uploadProfilePhoto, 
  deleteProfilePhoto,
  type ProfileUpdateRequest, 
  type ProfileData 
} from "@/lib/api/profile";

export function useProfile() {
  const token = useAuthStore((state) => state.token);
  const updateAuthUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();

  // Fetch profile data
  const profileQuery = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: () => {
      if (!token) throw new Error("No auth token");
      return getProfile(token).then((res) => res.data);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: ProfileUpdateRequest) => {
      if (!token) throw new Error("No auth token");
      return updateProfile(data, token).then((res) => res.data);
    },
    onSuccess: (updatedProfile) => {
      // Update cache with new profile data
      queryClient.setQueryData<ProfileData>(["profile"], updatedProfile);
      // Also update auth store
      if (updatedProfile.profile_photo_url) {
        updateAuthUser({ profile_photo_url: updatedProfile.profile_photo_url });
      }
    },
  });

  // Upload profile photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => {
      if (!token) throw new Error("No auth token");
      return uploadProfilePhoto(file, token).then((res) => res.data);
    },
    onSuccess: (updatedProfile) => {
      // Update cache with new profile data
      queryClient.setQueryData<ProfileData>(["profile"], updatedProfile);
      // Also update auth store for global access
      if (updatedProfile.profile_photo_url) {
        updateAuthUser({ profile_photo_url: updatedProfile.profile_photo_url });
      }
    },
  });

  // Delete profile photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("No auth token");
      return deleteProfilePhoto(token).then((res) => res.data);
    },
    onSuccess: (updatedProfile) => {
      // Update cache with new profile data
      queryClient.setQueryData<ProfileData>(["profile"], updatedProfile);
      // Also update auth store
      updateAuthUser({ profile_photo_url: null });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
    updateProfile: updateMutation.mutate,
    updateProfileAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    uploadPhoto: uploadPhotoMutation.mutate,
    uploadPhotoAsync: uploadPhotoMutation.mutateAsync,
    isUploadingPhoto: uploadPhotoMutation.isPending,
    uploadPhotoError: uploadPhotoMutation.error,
    deletePhoto: deletePhotoMutation.mutate,
    deletePhotoAsync: deletePhotoMutation.mutateAsync,
    isDeletingPhoto: deletePhotoMutation.isPending,
    deletePhotoError: deletePhotoMutation.error,
  };
}