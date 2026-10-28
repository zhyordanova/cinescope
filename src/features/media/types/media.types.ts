export type MediaType = 'movie' | 'series' | 'episode';

export type MediaSummary = {
  id: string;
  title: string;
  type: MediaType;
  year: string | null;
  posterUrl: string | null;
};

export type MediaDetails = MediaSummary & {
  plot: string | null;
  genres: string[];
  runtimeMinutes: number | null;
  imdbRating: number | null;
  totalSeasons: number | null;
};

export type MediaSearchResult = {
  items: MediaSummary[];
  totalResults: number;
};
