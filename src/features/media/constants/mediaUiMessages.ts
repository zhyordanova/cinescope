import type { MediaType } from '../types/media.types';

export const MEDIA_TYPE_LABELS = {
  movie: 'Movie',
  series: 'Series',
  episode: 'Episode',
} as const satisfies Record<MediaType, string>;

export const MEDIA_UI_MESSAGES = {
  home: {
    logoAccessibleLabel: 'CineScope',
    bannerLoading: 'Loading artwork…',
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
    emptyTitle: 'No titles available',
    empty:
      'There are no titles to display in this collection right now.',
    loading: (title: string) => `Loading ${title}…`,
    errorTitle: "Couldn't load this collection",
    errorDescription:
      'Something went wrong while loading these titles.',
    retryLabel: 'Try Again',
    retryingLabel: 'Trying Again…',
    retry: (title: string) => `Try Again: ${title}`,
    retrying: (title: string) => `Trying Again: ${title}…`,
  },
  details: {
    invalidIdTitle: 'Invalid media ID',
    errorTitle: "Couldn't load media details",
    errorDescription:
      "We couldn't retrieve information for this title.",
    retry: 'Try Again',
    retrying: 'Trying Again…',
    loadingTitle: 'Loading details',
    loading: 'Loading media details…',
    goHome: 'CineScope — Go to Home',
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
