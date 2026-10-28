export type OmdbMediaType = 'movie' | 'series' | 'episode';

export type OmdbMediaSummary = {
  imdbID: string;
  Title: string;
  Type: OmdbMediaType;
  Year?: string;
  Poster?: string;
};

export type OmdbFailureResponse = {
  Response: 'False';
  Error: string;
};

export type OmdbSearchResponse =
  | {
      Response: 'True';
      Search: OmdbMediaSummary[];
      totalResults: string;
    }
  | OmdbFailureResponse;

export type OmdbDetailsResponse =
  | (OmdbMediaSummary & {
      Response: 'True';
      Plot?: string;
      Genre?: string;
      Runtime?: string;
      imdbRating?: string;
      totalSeasons?: string;
    })
  | OmdbFailureResponse;
