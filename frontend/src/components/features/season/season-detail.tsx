"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getSeasonById } from "@/lib/api/seasons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SeasonDetailProps = {
  seasonId: string;
};

function formatMeetupDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function SeasonDetail({ seasonId }: SeasonDetailProps) {
  const query = useQuery({
    queryKey: ["season-detail", seasonId],
    queryFn: () => getSeasonById(seasonId),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 rounded-2xl bg-surface-container-low animate-pulse" />
        <div className="h-28 rounded-2xl bg-surface-container-low animate-pulse" />
        <div className="h-40 rounded-2xl bg-surface-container-low animate-pulse" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <Card className="bs-panel">
        <CardContent className="p-6 space-y-3">
          <p className="font-manrope text-sm text-foreground">
            We could not load this season right now. Please try again in a moment.
          </p>
          <Button type="button" onClick={() => query.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const season = query.data.data;

  return (
    <div className="space-y-4">
      <Card className="bs-panel">
        <CardContent className="p-6 space-y-4">
          {season.cover_image_url ? (
            <img
              src={season.cover_image_url}
              alt={`Cover for ${season.book_title}`}
              className="h-56 w-full rounded-2xl object-cover bg-surface-container-low"
            />
          ) : (
            <div className="h-56 w-full rounded-2xl bg-surface-container-low flex items-center justify-center">
              <p className="font-manrope text-sm text-foreground-muted">Cover image coming soon</p>
            </div>
          )}
          <div className="space-y-2">
            <h1 className="font-newsreader text-4xl text-foreground">{season.title}</h1>
            <p className="font-manrope text-sm text-foreground-muted">
              {season.book_title} by {season.book_author}
            </p>
            {season.theme ? (
              <p className="font-manrope text-sm text-foreground">Theme: {season.theme}</p>
            ) : null}
            <p className="font-manrope text-sm text-foreground">{season.member_count} members</p>
          </div>
          <p className="font-manrope text-sm text-foreground">
            {season.description ?? "No description yet. Details will bloom soon."}
          </p>
        </CardContent>
      </Card>

      <Card className="bs-panel">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-newsreader text-2xl text-foreground">Creator</h2>
          {season.creator ? (
            <Link
              href={`/profile/${encodeURIComponent(season.creator.id)}`}
              className="flex items-start gap-3 rounded-xl bg-surface-container-low px-4 py-3 min-h-11"
              aria-label={`View creator profile: ${season.creator.name}`}
            >
              {season.creator.profile_photo_url ? (
                <img
                  src={season.creator.profile_photo_url}
                  alt={`${season.creator.name} profile photo`}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="h-11 w-11 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="font-manrope text-xs text-foreground-muted">No photo</span>
                </div>
              )}
              <div className="space-y-1">
                <p className="font-manrope text-sm text-foreground">{season.creator.name}</p>
                <p className="font-manrope text-xs text-foreground-muted">
                  {season.creator.bio ?? "No bio shared yet. Their story is still unfolding."}
                </p>
              </div>
            </Link>
          ) : (
            <p className="font-manrope text-sm text-foreground-muted">
              Creator details will be shared soon.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bs-panel">
        <CardContent className="p-6 space-y-3">
          <h2 className="font-newsreader text-2xl text-foreground">Members</h2>
          {(season.members ?? []).length > 0 ? (
            <ul className="space-y-2">
              {(season.members ?? []).map((member) => (
                <li key={member.id}>
                  <Link
                    href={`/profile/${encodeURIComponent(member.id)}`}
                    className="flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3 min-h-11"
                    aria-label={`View member profile: ${member.name}`}
                  >
                    {member.profile_photo_url ? (
                      <img
                        src={member.profile_photo_url}
                        alt={`${member.name} profile photo`}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-surface-container-high flex items-center justify-center">
                        <span className="font-manrope text-xs text-foreground-muted">No photo</span>
                      </div>
                    )}
                    <p className="font-manrope text-sm text-foreground">{member.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-manrope text-sm text-foreground-muted">
              No members have joined yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bs-panel">
        <CardContent className="p-6 space-y-2">
          <h2 className="font-newsreader text-2xl text-foreground">Location</h2>
          {season.location_name ? (
            <p className="font-manrope text-sm text-foreground">{season.location_name}</p>
          ) : (
            <p className="font-manrope text-sm text-foreground-muted">
              Location details will be shared soon.
            </p>
          )}
          {season.location_url ? (
            <a
              href={season.location_url}
              target="_blank"
              rel="noreferrer"
              className="font-manrope text-sm text-primary underline underline-offset-2"
              aria-label="Open location link"
            >
              Open location link
            </a>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bs-panel">
        <CardContent className="p-6 space-y-3">
          <h2 className="font-newsreader text-2xl text-foreground">Upcoming Meetups</h2>
          {season.meetups.length > 0 ? (
            <ul className="space-y-2">
              {season.meetups.map((meetup) => (
                <li
                  key={meetup.id}
                  className="rounded-xl bg-surface-container-low px-4 py-3 font-manrope text-sm text-foreground"
                >
                  {formatMeetupDate(meetup.starts_at)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-manrope text-sm text-foreground-muted">No meetups scheduled yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
