"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getCreatorSeasons } from "@/lib/api/seasons";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";

function toStatusLabel(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "published") return "Published";
  if (normalized === "closed") return "Closed";
  if (normalized === "draft") return "Draft";
  return "Active";
}

export default function ManageSeasonsPage() {
  const token = useAuthStore((state) => state.token);

  const query = useQuery({
    queryKey: ["creator-seasons"],
    queryFn: () => getCreatorSeasons(token ?? ""),
    enabled: Boolean(token),
  });

  return (
    <main className="min-h-screen bs-editorial-shell pt-24 pb-16 px-4">
      <section className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="font-newsreader text-4xl text-foreground">My Seasons</h1>
          <p className="font-manrope text-foreground-muted">Track your published reading circles.</p>
        </header>

        {!token ? (
          <Card className="bs-panel"><CardContent className="p-6 font-manrope text-sm">Please log in to view your seasons.</CardContent></Card>
        ) : query.isLoading ? (
          <Card className="bs-panel"><CardContent className="p-6 font-manrope text-sm">Loading your seasons…</CardContent></Card>
        ) : query.isError ? (
          <Card className="bs-panel"><CardContent className="p-6 font-manrope text-sm">We could not load your seasons right now.</CardContent></Card>
        ) : (query.data?.data.length ?? 0) === 0 ? (
          <Card className="bs-panel"><CardContent className="p-6 font-manrope text-sm">No seasons yet. Create one to get started.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {query.data?.data.map((season) => (
              <Link key={season.id} href={`/seasons/${encodeURIComponent(season.id)}`}>
                <Card className="bs-panel hover:bg-surface-container-low">
                  <CardContent className="p-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-manrope text-sm text-foreground">{season.title}</p>
                      <p className="font-manrope text-xs text-foreground-muted">{season.book_title}</p>
                    </div>
                    <span className="rounded-full bg-surface-container-high px-3 py-1 font-manrope text-xs text-foreground">
                      {toStatusLabel(season.status)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
