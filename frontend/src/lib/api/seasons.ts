import { apiRequest } from "./client";
import type { SeasonBrowseFilters, SeasonBrowseResponse } from "@/types/season";

export type {
  SeasonBrowseFilters,
  SeasonBrowseItem,
  SeasonBrowseMeta,
  SeasonBrowseResponse,
} from "@/types/season";

const SEASONS_ENDPOINT = "/v1/seasons";

export function getSeasons(
  page = 1,
  pageSize = 10,
  filters: SeasonBrowseFilters = {}
): Promise<SeasonBrowseResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.genre) {
    params.set("genre", filters.genre);
  }

  if (filters.schedule) {
    params.set("schedule", filters.schedule);
  }

  return apiRequest<SeasonBrowseResponse>(
    `${SEASONS_ENDPOINT}?${params.toString()}`,
    { method: "GET" }
  );
}
