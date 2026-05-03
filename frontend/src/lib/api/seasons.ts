import { apiRequest, createAuthHeaders } from "./client";
import type {
  SeasonBrowseFilters,
  SeasonBrowseResponse,
  SeasonDetailResponse,
  SeasonCreateRequest,
  SeasonCreateResponse,
  SeasonJoinResponse,
  SeasonScheduleRequest,
  SeasonScheduleResponse,
} from "@/types/season";

export type {
  SeasonBrowseFilters,
  SeasonBrowseItem,
  SeasonBrowseMeta,
  SeasonBrowseResponse,
  SeasonDetailItem,
  SeasonDetailMeta,
  SeasonDetailResponse,
  SeasonCreateRequest,
  SeasonCreateData,
  SeasonCreateResponse,
  SeasonJoinData,
  SeasonJoinResponse,
  SeasonScheduleRequest,
  SeasonScheduleData,
  SeasonScheduleResponse,
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

export function createSeason(
  payload: SeasonCreateRequest,
  token: string
): Promise<SeasonCreateResponse> {
  if (!token) {
    throw new Error("token is required");
  }

  const normalizedPayload: SeasonCreateRequest = {
    title: payload.title.trim(),
    book_title: payload.book_title.trim(),
    book_author: payload.book_author.trim(),
  };

  if (payload.description?.trim()) {
    normalizedPayload.description = payload.description.trim();
  }

  if (payload.cover_image_url?.trim()) {
    normalizedPayload.cover_image_url = payload.cover_image_url.trim();
  }

  if (payload.theme?.trim()) {
    normalizedPayload.theme = payload.theme.trim();
  }

  if (
    typeof payload.max_members === "number"
    && Number.isInteger(payload.max_members)
    && payload.max_members >= 1
    && payload.max_members <= 500
  ) {
    normalizedPayload.max_members = payload.max_members;
  }

  if (payload.membership_mode === "auto-join" || payload.membership_mode === "approval-required") {
    normalizedPayload.membership_mode = payload.membership_mode;
  } else {
    normalizedPayload.membership_mode = "auto-join";
  }

  if (!normalizedPayload.title || !normalizedPayload.book_title || !normalizedPayload.book_author) {
    throw new Error("title, book_title, and book_author are required");
  }

  return apiRequest<SeasonCreateResponse>(SEASONS_ENDPOINT, {
    method: "POST",
    headers: createAuthHeaders(token),
    body: JSON.stringify(normalizedPayload),
  });
}

export function updateSeasonSchedule(
  seasonId: string,
  payload: SeasonScheduleRequest,
  token: string
): Promise<SeasonScheduleResponse> {
  const normalizedSeasonId = seasonId.trim();
  if (!normalizedSeasonId) {
    throw new Error("seasonId is required");
  }
  if (!token) {
    throw new Error("token is required");
  }
  const encodedSeasonId = encodeURIComponent(normalizedSeasonId);
  return apiRequest<SeasonScheduleResponse>(`${SEASONS_ENDPOINT}/${encodedSeasonId}/schedule`, {
    method: "PATCH",
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}
