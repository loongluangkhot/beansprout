"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ChangeEvent, useMemo, useState } from "react";
import { useEffect, useRef } from "react";

import { getSeasons } from "@/lib/api/seasons";
import type { SeasonBrowseFilters } from "@/types/season";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeasonCard } from "./season-card";

const PAGE_SIZE = 10;

export function SeasonLibrary() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [schedule, setSchedule] = useState<"" | "this-week">("");

  const filters = useMemo<SeasonBrowseFilters>(() => {
    const nextFilters: SeasonBrowseFilters = {};
    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      nextFilters.search = trimmedSearch;
    }
    if (genre) {
      nextFilters.genre = genre;
    }
    if (schedule) {
      nextFilters.schedule = schedule;
    }

    return nextFilters;
  }, [genre, schedule, search]);

  const hasActiveFilters = Boolean(filters.search || filters.genre || filters.schedule);

  const query = useInfiniteQuery({
    queryKey: ["season-library", filters],
    queryFn: ({ pageParam = 1 }) => getSeasons(pageParam, PAGE_SIZE, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next ? lastPage.meta.page + 1 : undefined,
  });

  const seasons = query.data?.pages.flatMap((page) => page.data) ?? [];
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    if (
      !hasNextPage ||
      isFetchingNextPage ||
      typeof IntersectionObserver === "undefined" ||
      !loadMoreRef.current
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <FilterControls
          search={search}
          genre={genre}
          schedule={schedule}
          onSearchChange={setSearch}
          onGenreChange={setGenre}
          onScheduleChange={setSchedule}
        />
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-2xl bg-surface-container-low animate-pulse"
            aria-label="Loading season"
          />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-2xl bg-error-container/70 p-6">
        <p className="font-manrope text-sm text-foreground mb-3">
          We could not load seasons right now. Please try again.
        </p>
        <Button onClick={() => query.refetch()}>Try again</Button>
      </div>
    );
  }

  if (seasons.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="space-y-4">
          <FilterControls
            search={search}
            genre={genre}
            schedule={schedule}
            onSearchChange={setSearch}
            onGenreChange={setGenre}
            onScheduleChange={setSchedule}
          />
          <div className="rounded-2xl bg-surface-container-low p-6 space-y-3">
            <p className="font-newsreader text-2xl text-foreground">
              No seasons match your search.
            </p>
            <p className="font-manrope text-sm text-foreground-muted">
              Try adjusting your filters or clear them to browse all seasons.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setGenre("");
                setSchedule("");
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <FilterControls
          search={search}
          genre={genre}
          schedule={schedule}
          onSearchChange={setSearch}
          onGenreChange={setGenre}
          onScheduleChange={setSchedule}
        />
        <div className="rounded-2xl bg-surface-container-low p-6 space-y-3">
          <p className="font-newsreader text-2xl text-foreground">
            No seasons yet. Be the first to plant one.
          </p>
          <p className="font-manrope text-sm text-foreground-muted">
            Fresh conversations are waiting. Start a season and invite your reading circle.
          </p>
          {isAuthenticated ? (
            <Button asChild>
              <a href="/seasons/create">Create a season</a>
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterControls
        search={search}
        genre={genre}
        schedule={schedule}
        onSearchChange={setSearch}
        onGenreChange={setGenre}
        onScheduleChange={setSchedule}
      />
      {seasons.map((season) => (
        <SeasonCard key={season.id} season={season} />
      ))}
      {query.hasNextPage ? (
        <>
          <div ref={loadMoreRef} className="h-1 w-full" aria-hidden="true" />
          {query.isFetchingNextPage ? (
            <div className="space-y-4" aria-label="Loading more seasons">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`next-page-skeleton-${index}`}
                  className="h-36 rounded-2xl bg-surface-container-low animate-pulse"
                />
              ))}
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            Load more seasons
          </Button>
        </>
      ) : null}
    </div>
  );
}

type FilterControlsProps = {
  search: string;
  genre: string;
  schedule: "" | "this-week";
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onScheduleChange: (value: "" | "this-week") => void;
};

function FilterControls({
  search,
  genre,
  schedule,
  onSearchChange,
  onGenreChange,
  onScheduleChange,
}: FilterControlsProps) {
  const handleScheduleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onScheduleChange(value === "this-week" ? "this-week" : "");
  };

  return (
    <div className="rounded-2xl bg-surface-container-low p-4 space-y-3">
      <div className="space-y-1">
        <label htmlFor="season-search" className="font-manrope text-sm text-foreground">
          Search seasons
        </label>
        <Input
          id="season-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title, book, or theme"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="season-genre-filter" className="font-manrope text-sm text-foreground">
            Genre filter
          </label>
          <select
            id="season-genre-filter"
            value={genre}
            onChange={(event) => onGenreChange(event.target.value)}
            className="h-11 w-full rounded-full border border-outline-variant/20 bg-surface px-4 font-manrope text-sm text-foreground"
          >
            <option value="">All genres</option>
            <option value="Contemporary Fiction">Contemporary Fiction</option>
            <option value="Literary Fiction">Literary Fiction</option>
            <option value="Mystery">Mystery</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Nonfiction">Nonfiction</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="season-schedule-filter" className="font-manrope text-sm text-foreground">
            Schedule filter
          </label>
          <select
            id="season-schedule-filter"
            value={schedule}
            onChange={handleScheduleChange}
            className="h-11 w-full rounded-full border border-outline-variant/20 bg-surface px-4 font-manrope text-sm text-foreground"
          >
            <option value="">Any time</option>
            <option value="this-week">This week</option>
          </select>
        </div>
      </div>
    </div>
  );
}
