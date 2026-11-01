import type {
  OmdbDetailsResponse,
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

export const omdbMovieDetails = {
  Response: 'True',
  imdbID: 'tt0133093',
  Title: 'The Matrix',
  Type: 'movie',
  Poster: 'https://example.com/matrix.jpg',
  Year: '1999',
  Genre: 'Action, Sci-Fi',
  Runtime: '136 min',
  Plot: 'A programmer discovers the truth about his world.',
  Director: 'Lana Wachowski, Lilly Wachowski',
  Writer: 'Lana Wachowski, Lilly Wachowski',
  Actors: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss',
  Released: '31 March 1999',
  Rated: 'R',
  Country: 'United States',
  Language: 'English',
  Awards: 'Won 4 Oscars. 42 wins & 51 nominations total',
  Ratings: [
    { Source: 'Internet Movie Database', Value: '8.7/10' },
    { Source: 'Rotten Tomatoes', Value: '88%' },
    { Source: 'Metacritic', Value: '73/100' },
  ],
  BoxOffice: '$171,479,930',
} satisfies OmdbDetailsResponse;

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
