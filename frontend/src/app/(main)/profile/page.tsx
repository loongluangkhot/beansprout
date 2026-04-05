/**
 * Profile Page
 * Main profile view and edit functionality
 */

"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/stores/auth-store";
import { ProfilePhotoUpload } from "@/components/features/profile/profile-photo-upload";
import { ProfileForm, type ProfileFormData } from "@/components/features/profile/profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { profile, isLoading, isError, updateProfile, isUpdating, refetch } = useProfile();
  const user = useAuthStore((state) => state.user);

  const defaultFormValues = {
    bio: profile?.bio || "",
    favorite_genres: profile?.favorite_genres || [],
    reading_history: profile?.reading_history || [],
  };

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      await new Promise<void>((resolve, reject) => {
        updateProfile(
          {
            bio: data.bio,
            favorite_genres: data.favorite_genres,
            reading_history: data.reading_history,
          },
          {
            onSuccess: () => {
              setIsEditing(false);
              setToast({ message: "Profile updated successfully!", type: "success" });
              setTimeout(() => setToast(null), 3000);
              resolve();
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    } catch {
      setToast({ message: "Failed to update profile", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handlePhotoUploadSuccess = (photoUrl: string) => {
    setToast({ message: "Profile photo updated!", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] p-4">
        <Card className="max-w-2xl mx-auto mt-8">
          <CardContent className="p-8">
            <div className="animate-pulse">
              <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#faf9f5] p-4">
        <Card className="max-w-2xl mx-auto mt-8">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-[Manrope]">Failed to load profile</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] p-4 pb-20">
      <Card className="max-w-2xl mx-auto mt-4 rounded-lg" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#4e6240]/10 pb-4">
          <h1 className="font-[Newsreader] text-2xl text-[#1b1c1a]">My Profile</h1>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#4e6240] hover:bg-[#3d5133] text-white font-[Manrope]"
            >
              Edit
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Toast notification */}
          {toast && (
            <div
              className={`fixed top-4 right-4 px-4 py-2 rounded-lg font-[Manrope] ${
                toast.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* Profile Header - Always visible */}
          <div className="flex flex-col items-center text-center">
            <ProfilePhotoUpload
              displayName={profile?.display_name || user?.email}
              email={user?.email || ""}
              currentPhotoUrl={profile?.profile_photo_url}
              size="lg"
              onUploadSuccess={handlePhotoUploadSuccess}
            />
            <h2 className="mt-4 font-[Newsreader] text-xl text-[#1b1c1a]">
              {profile?.display_name || user?.email}
            </h2>
            <p className="text-[#1b1c1a]/60 font-[Manrope] text-sm">{user?.email}</p>
          </div>

          {isEditing ? (
            /* Edit Mode - Use ProfileForm with React Hook Form + Zod */
            <ProfileForm
              defaultValues={defaultFormValues}
              onSubmit={handleSubmit}
              isSubmitting={isUpdating}
            />
          ) : (
            /* View Mode - Display profile data */
            <div className="space-y-6">
              {/* Bio Section */}
              <div>
                <h3 className="font-[Newsreader] text-lg text-[#1b1c1a] mb-2">Bio</h3>
                <p className="text-[#1b1c1a]/80 font-[Manrope]">
                  {profile?.bio || "No bio yet. Tell us about yourself!"}
                </p>
              </div>

              {/* Favorite Genres */}
              <div>
                <h3 className="font-[Newsreader] text-lg text-[#1b1c1a] mb-2">Favorite Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.favorite_genres?.length ? (
                    profile.favorite_genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1.5 rounded-full bg-[#4e6240]/10 text-[#4e6240] font-[Manrope] text-sm"
                      >
                        {genre}
                      </span>
                    ))
                  ) : (
                    <p className="text-[#1b1c1a]/50 font-[Manrope]">No genres selected</p>
                  )}
                </div>
              </div>

              {/* Reading History */}
              <div>
                <h3 className="font-[Newsreader] text-lg text-[#1b1c1a] mb-2">Reading History</h3>
                <div className="space-y-2">
                  {profile?.reading_history?.length ? (
                    profile.reading_history.map((book, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-lg bg-white/50 border border-[#4e6240]/10"
                      >
                        <span className="text-lg">📖</span>
                        <div>
                          <p className="font-[Manrope] text-[#1b1c1a]">{book.title}</p>
                          <p className="font-[Manrope] text-sm text-[#1b1c1a]/60">
                            {book.author}
                            {book.completed_date && ` (${book.completed_date})`}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#1b1c1a]/50 font-[Manrope]">No books in reading history</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
