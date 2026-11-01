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
  ratings: MediaRating[];
  totalSeasons: number | null;
  director: string | null;
  writer: string | null;
  actors: string | null;
  released: string | null;
  rated: string | null;
  country: string | null;
  language: string | null;
  awards: string | null;
  boxOffice: string | null;
};

export type MediaRating = {
  source: MediaRatingSource;
  value: string;
};

export type MediaRatingSource =
  'IMDb' | 'Rotten Tomatoes' | 'Metacritic';

export type MediaSearchResult = {
  items: MediaSummary[];
  totalResults: number;
};
