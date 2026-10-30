import type {
  OmdbFailureResponse,
  OmdbMediaSummary,
} from '../types/omdb.types';

export const omdbFailure = {
  Response: 'False',
  Error: 'Movie not found!',
} satisfies OmdbFailureResponse;

export const omdbInvalidKeyFailure = {
  Response: 'False',
  Error: 'Invalid API key!',
} satisfies OmdbFailureResponse;

export const omdbMovie: OmdbMediaSummary = {
  imdbID: 'tt0372784',
  Title: 'Batman Begins',
  Type: 'movie',
  Year: '2005',
  Poster: 'https://example.com/batman.jpg',
};

export const omdbSeries: OmdbMediaSummary = {
  imdbID: 'tt0091040',
  Title: 'Batman: The Animated Series',
  Type: 'series',
  Year: '1992–1995',
  Poster: 'N/A',
};

export const omdbEpisode: OmdbMediaSummary = {
  imdbID: 'tt0519589',
  Title: 'On Leather Wings',
  Type: 'episode',
  Year: '1992',
};
