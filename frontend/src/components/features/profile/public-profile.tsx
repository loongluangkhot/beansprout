"use client";

import { useQuery } from "@tanstack/react-query";

import { getPublicProfile } from "@/lib/api/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PublicProfileProps = {
  userId: string;
};

export function PublicProfile({ userId }: PublicProfileProps) {
  const query = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: () => getPublicProfile(userId),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 rounded-2xl bg-surface-container-low animate-pulse" />
        <div className="h-24 rounded-2xl bg-surface-container-low animate-pulse" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <Card className="bs-panel">
        <CardContent className="p-6 space-y-3">
          <p className="font-manrope text-sm text-foreground">
            We could not load this profile right now. Please try again in a moment.
          </p>
          <Button type="button" onClick={() => query.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const profile = query.data?.data;
  if (!profile) {
    return (
      <Card className="bs-panel">
        <CardContent className="p-6 space-y-3">
          <p className="font-manrope text-sm text-foreground">
            This profile is not available yet. Please refresh and try again.
          </p>
          <Button type="button" onClick={() => query.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }
  const displayName = profile.display_name ?? "Community Reader";

  return (
    <Card className="bs-panel">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          {profile.profile_photo_url ? (
            <img
              src={profile.profile_photo_url}
              alt={`${displayName} profile photo`}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="font-manrope text-xs text-foreground-muted">No photo</span>
            </div>
          )}
          <h1 className="font-newsreader text-3xl text-foreground">{displayName}</h1>
        </div>

        <div className="space-y-2">
          <h2 className="font-newsreader text-2xl text-foreground">Bio</h2>
          <p className="font-manrope text-sm text-foreground">
            {profile.bio ?? "No bio shared yet. Their story is still unfolding."}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-newsreader text-2xl text-foreground">Favorite Genres</h2>
          {profile.favorite_genres && profile.favorite_genres.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.favorite_genres.map((genre, index) => (
                <span
                  key={`${genre}-${index}`}
                  className="rounded-full bg-surface-container-low px-3 py-1 font-manrope text-sm text-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-manrope text-sm text-foreground-muted">No favorite genres shared yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
