export interface SeasonBrowseItem {
  id: string;
  title: string;
  theme: string | null;
  next_meetup_at: string | null;
  book_title: string;
  book_author: string;
  cover_image_url: string | null;
  member_count: number;
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
  location_name: string | null;
  location_url: string | null;
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
