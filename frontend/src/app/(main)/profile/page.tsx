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

  const handlePhotoUploadSuccess = () => {
    setToast({ message: "Profile photo updated!", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bs-editorial-shell p-4 pb-20">
        <Card className="max-w-2xl mx-auto mt-12 bs-panel">
          <CardContent className="p-8">
            <div className="animate-pulse">
              <div className="h-20 w-20 bg-surface-container-high rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-surface-container-high rounded w-1/3 mx-auto mb-2"></div>
              <div className="h-3 bg-surface-container-high rounded w-1/4 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bs-editorial-shell p-4 pb-20">
        <Card className="max-w-2xl mx-auto mt-12 bs-panel">
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-manrope">Failed to load profile</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bs-editorial-shell p-4 pb-20">
      <Card className="max-w-2xl mx-auto mt-10 bs-panel">
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-7 pt-7">
          <h1 className="font-newsreader text-2xl text-foreground">My Profile</h1>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="font-manrope"
            >
              Edit
            </Button>
          )}
        </CardHeader>

        <CardContent className="px-7 pb-8 space-y-8">
          {/* Toast notification */}
          {toast && (
            <div
              className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl font-manrope bs-glass ${
                toast.type === "success" ? "bg-success-container" : "bg-error-container"
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* Profile Header - Always visible */}
          <div className="flex flex-col items-center text-center bg-surface-container-low rounded-2xl py-6 px-4">
            <ProfilePhotoUpload
              displayName={profile?.display_name || user?.email}
              email={user?.email || ""}
              currentPhotoUrl={profile?.profile_photo_url}
              size="lg"
              onUploadSuccess={handlePhotoUploadSuccess}
            />
            <h2 className="mt-4 font-newsreader text-xl text-foreground">
              {profile?.display_name || user?.email}
            </h2>
            <p className="text-muted-foreground font-manrope text-sm">{user?.email}</p>
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
            <div className="space-y-8">
              {/* Bio Section */}
              <div className="bg-surface-container-low rounded-2xl p-4">
                <h3 className="font-newsreader text-lg text-foreground mb-2">Bio</h3>
                <p className="text-foreground font-manrope opacity-80">
                  {profile?.bio || "No bio yet. Tell us about yourself!"}
                </p>
              </div>

              {/* Favorite Genres */}
              <div className="bg-surface-container-low rounded-2xl p-4">
                <h3 className="font-newsreader text-lg text-foreground mb-2">Favorite Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.favorite_genres?.length ? (
                    profile.favorite_genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1.5 rounded-full bg-surface-container-low text-foreground font-manrope text-sm"
                      >
                        {genre}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground font-manrope">No genres selected</p>
                  )}
                </div>
              </div>

              {/* Reading History */}
              <div className="bg-surface-container-low rounded-2xl p-4">
                <h3 className="font-newsreader text-lg text-foreground mb-2">Reading History</h3>
                <div className="space-y-2">
                  {profile?.reading_history?.length ? (
                    profile.reading_history.map((book, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low"
                      >
                        <span className="text-lg">📖</span>
                        <div>
                          <p className="font-manrope text-foreground">{book.title}</p>
                          <p className="font-manrope text-sm text-muted-foreground">
                            {book.author}
                            {book.completed_date && ` (${book.completed_date})`}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground font-manrope">No books in reading history</p>
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
