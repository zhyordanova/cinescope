import type { MediaType } from '../types/media.types';

export const MEDIA_TYPE_LABELS = {
  movie: 'Movie',
  series: 'Series',
  episode: 'Episode',
} as const satisfies Record<MediaType, string>;

export const MEDIA_UI_MESSAGES = {
  home: {
    logoAccessibleLabel: 'CineScope',
    bannerHeadline: 'Every story starts with discovery.',
    bannerSubtitle:
      'Explore movies, series, and worlds beyond the ordinary.',
  },
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
    overviewTitle: 'Overview',
    behindTheStoryTitle: 'Behind the Story',
    directorLabel: 'Director',
    writerLabel: 'Writer',
    actorsLabel: 'Actors',
    productionDetailsTitle: 'Production Details',
    releasedLabel: 'Released',
    ratedLabel: 'Rated',
    countryLabel: 'Country',
    languageLabel: 'Language',
    awardsTitle: 'Awards & Recognition',
    criticsRatingsTitle: "Critics' Ratings",
    boxOfficeLabel: 'Box Office',
    year: (year: string) => year,
    runtime: (minutes: number) => `${minutes} min`,
    seasons: (seasons: number) => `Seasons: ${seasons}`,
  },
  retry: 'Retry',
  retrying: 'Retrying…',
} as const;
