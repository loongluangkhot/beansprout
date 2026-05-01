import { apiRequest, createAuthHeaders } from "./client";
import type {
  SeasonBrowseFilters,
  SeasonBrowseResponse,
  SeasonDetailResponse,
  SeasonJoinResponse,
} from "@/types/season";

export type {
  SeasonBrowseFilters,
  SeasonBrowseItem,
  SeasonBrowseMeta,
  SeasonBrowseResponse,
  SeasonDetailItem,
  SeasonDetailMeta,
  SeasonDetailResponse,
  SeasonJoinData,
  SeasonJoinResponse,
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

export function getSeasonById(
  seasonId: string,
  token?: string | null
): Promise<SeasonDetailResponse> {
  const normalizedSeasonId = seasonId.trim();
  if (!normalizedSeasonId) {
    throw new Error("seasonId is required");
  }

  const encodedSeasonId = encodeURIComponent(normalizedSeasonId);

  return apiRequest<SeasonDetailResponse>(`${SEASONS_ENDPOINT}/${encodedSeasonId}`, {
    method: "GET",
    headers: createAuthHeaders(token),
  });
}

export function joinSeason(seasonId: string, token: string): Promise<SeasonJoinResponse> {
  const normalizedSeasonId = seasonId.trim();
  if (!normalizedSeasonId) {
    throw new Error("seasonId is required");
  }
  if (!token) {
    throw new Error("token is required");
  }
  const encodedSeasonId = encodeURIComponent(normalizedSeasonId);
  return apiRequest<SeasonJoinResponse>(`${SEASONS_ENDPOINT}/${encodedSeasonId}/join`, {
    method: "POST",
    headers: createAuthHeaders(token),
  });
}
