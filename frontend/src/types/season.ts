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
