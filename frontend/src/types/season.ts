export interface SeasonBrowseItem {
  id: string;
  title: string;
  theme: string | null;
  next_meetup_at: string | null;
  book_title: string;
  book_author: string;
  cover_image_url: string | null;
  member_count: number;
  max_members: number | null;
}

export interface SeasonBrowseMeta {
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface SeasonBrowseResponse {
  data: SeasonBrowseItem[];
  meta: SeasonBrowseMeta;
}

export interface SeasonBrowseFilters {
  search?: string;
  genre?: string;
  schedule?: "this-week";
}

export interface SeasonDetailMeetup {
  id: string;
  starts_at: string;
}

export interface SeasonProfileSummary {
  id: string;
  name: string;
  bio: string | null;
  profile_photo_url: string | null;
}

export interface SeasonDetailItem {
  id: string;
  title: string;
  theme: string | null;
  description: string | null;
  book_title: string;
  book_author: string;
  cover_image_url: string | null;
  member_count: number;
  max_members: number | null;
  location_mode: "virtual" | "in-person";
  location_name: string | null;
  location_url: string | null;
  location_address: string | null;
  is_member: boolean;
  can_join: boolean;
  is_full: boolean;
  creator: SeasonProfileSummary | null;
  members: SeasonProfileSummary[];
  meetups: SeasonDetailMeetup[];
}

export interface SeasonDetailMeta {
  meetup_count: number;
}

export interface SeasonDetailResponse {
  data: SeasonDetailItem;
  meta: SeasonDetailMeta;
}

export interface SeasonJoinData {
  season_id: string;
  joined: boolean;
  is_member: boolean;
  member_count: number;
  max_members: number | null;
  is_full: boolean;
}

export interface SeasonJoinResponse {
  data: SeasonJoinData;
  meta: Record<string, never>;
}

export interface SeasonCreateRequest {
  title: string;
  book_title: string;
  book_author: string;
  description?: string;
  cover_image_url?: string;
  theme?: string;
  max_members?: number;
  membership_mode?: "auto-join" | "approval-required";
  location_mode?: "virtual" | "in-person";
  location_name?: string;
  location_url?: string;
  location_address?: string;
}

export interface SeasonCreateData {
  id: string;
  title: string;
  book_title: string;
  book_author: string;
  description: string | null;
  cover_image_url: string | null;
  theme: string | null;
  max_members: number | null;
  membership_mode: "auto-join" | "approval-required";
  location_mode: "virtual" | "in-person";
  location_name: string | null;
  location_url: string | null;
  location_address: string | null;
  created_by_user_id: string;
  status: string;
  is_public: boolean;
}

export interface SeasonCreateResponse {
  data: SeasonCreateData;
  meta: Record<string, never>;
}

export type SeasonScheduleFrequency = "weekly" | "bi-weekly" | "monthly";

export interface SeasonScheduleRequest {
  start_date: string;
  duration_weeks: number;
  frequency: SeasonScheduleFrequency;
  meetup_datetimes?: string[];
}

export interface SeasonScheduleData {
  season_id: string;
  start_date: string;
  end_date: string;
  duration_weeks: number;
  frequency: SeasonScheduleFrequency;
  meetup_datetimes: string[];
  meetup_count: number;
}

export interface SeasonScheduleResponse {
  data: SeasonScheduleData;
  meta: Record<string, never>;
}
