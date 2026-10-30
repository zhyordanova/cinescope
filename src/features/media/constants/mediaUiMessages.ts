import type { MediaType } from '../types/media.types';

export const MEDIA_TYPE_LABELS = {
  movie: 'Movie',
  series: 'Series',
  episode: 'Episode',
} as const satisfies Record<MediaType, string>;

export const MEDIA_UI_MESSAGES = {
  homeTitle: 'Movies and series',
  posterUnavailable: 'Poster unavailable',
  openMedia: (title: string, type: MediaType, year: string | null) =>
    `Open ${title}, ${MEDIA_TYPE_LABELS[type]}${year ? `, ${year}` : ''}`,
  previousTitles: (title: string) => `Previous titles in ${title}`,
  nextTitles: (title: string) => `Next titles in ${title}`,
  collection: {
    empty: 'No movies or series available in this collection.',
    loading: (title: string) => `Loading ${title}…`,
    error: (title: string, message: string) => `${title}: ${message}`,
    retry: (title: string) => `Retry ${title}`,
    retrying: (title: string) => `Retrying ${title}…`,
  },
  details: {
    invalidIdTitle: 'Invalid media ID',
    errorTitle: 'Unable to load details',
    loadingTitle: 'Loading details',
    loading: 'Loading media details…',
    plotUnavailable: 'Plot unavailable.',
    imdbId: (id: string) => `IMDb ID: ${id}`,
    year: (year: string) => `Year: ${year}`,
    genres: (genres: readonly string[]) =>
      `Genres: ${genres.join(', ')}`,
    runtime: (minutes: number) => `Runtime: ${minutes} min`,
    imdbRating: (rating: number) => `IMDb rating: ${rating}/10`,
    seasons: (seasons: number) => `Seasons: ${seasons}`,
  },
  retry: 'Retry',
  retrying: 'Retrying…',
  goBack: 'Go back',
  goHome: 'Go to Home',
} as const;
