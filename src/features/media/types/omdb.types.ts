export type OmdbMediaType = 'movie' | 'series' | 'episode';

export type OmdbMediaSummary = {
  imdbID: string;
  Title: string;
  Type: OmdbMediaType;
  Year?: string;
  Poster?: string;
};

export type OmdbRating = {
  Source: string;
  Value: string;
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
      totalSeasons?: string;
      Director?: string;
      Writer?: string;
      Actors?: string;
      Released?: string;
      Rated?: string;
      Country?: string;
      Language?: string;
      Awards?: string;
      Ratings: OmdbRating[];
      BoxOffice?: string;
    })
  | OmdbFailureResponse;
