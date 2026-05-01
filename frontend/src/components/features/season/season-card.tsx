import Link from "next/link";

import type { SeasonBrowseItem } from "@/lib/api/seasons";
import { Card, CardContent } from "@/components/ui/card";

interface SeasonCardProps {
  season: SeasonBrowseItem;
}

function formatMeetupDate(value: string | null): string {
  if (!value) {
    return "Meetup date to be announced";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Meetup date to be announced";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function SeasonCard({ season }: SeasonCardProps) {
  return (
    <Link href={`/seasons/${season.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
      <Card className="bs-panel transition-transform duration-150 active:scale-[0.99] hover:bg-surface-container-low">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-newsreader text-2xl text-foreground">{season.title}</h2>
            <span className="text-xs font-manrope bg-surface-container-high px-2 py-1 rounded-full text-foreground-muted">
              {season.member_count} members
            </span>
          </div>
          <p className="text-sm font-manrope text-foreground-muted">
            {season.book_title} by {season.book_author}
          </p>
          {season.theme ? (
            <p className="text-sm font-manrope text-foreground">Theme: {season.theme}</p>
          ) : null}
          <p className="text-sm font-manrope text-foreground-muted">
            Next meetup: {formatMeetupDate(season.next_meetup_at)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
