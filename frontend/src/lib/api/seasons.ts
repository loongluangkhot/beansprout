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
  CreatorSeasonListResponse,
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
  CreatorSeasonItem,
  CreatorSeasonListResponse,
} from "@/types/season";

const SEASONS_ENDPOINT = "/v1/seasons";

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

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

  const locationMode = payload.location_mode ?? "in-person";
  if (locationMode !== "virtual" && locationMode !== "in-person") {
    throw new Error("location_mode must be virtual or in-person");
  }
  normalizedPayload.location_mode = locationMode;

  const locationName = payload.location_name?.trim();
  const locationUrl = payload.location_url?.trim();
  const locationAddress = payload.location_address?.trim();

  if (locationName) {
    normalizedPayload.location_name = locationName;
  }
  if (locationUrl) {
    if (!isHttpUrl(locationUrl)) {
      throw new Error("location_url must be a valid http(s) URL");
    }
    normalizedPayload.location_url = locationUrl;
  }
  if (locationAddress) {
    normalizedPayload.location_address = locationAddress;
  }

  if (normalizedPayload.location_mode === "virtual" && !normalizedPayload.location_url) {
    throw new Error("location_url is required when location_mode is virtual");
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

export function getCreatorSeasons(token: string): Promise<CreatorSeasonListResponse> {
  if (!token) {
    throw new Error("token is required");
  }

  return apiRequest<CreatorSeasonListResponse>(`${SEASONS_ENDPOINT}/mine`, {
    method: "GET",
    headers: createAuthHeaders(token),
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
