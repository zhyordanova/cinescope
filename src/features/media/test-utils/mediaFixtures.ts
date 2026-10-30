import type { MediaSummary } from '../types/media.types';

export const movieSummary: MediaSummary = {
  id: 'tt0133093',
  title: 'The Matrix',
  type: 'movie',
  year: '1999',
  posterUrl: null,
};

export const seriesSummary: MediaSummary = {
  ...movieSummary,
  id: 'tt5753856',
  title: 'Dark',
  type: 'series',
  year: '2017–2020',
};

export const episodeSummary: MediaSummary = {
  ...movieSummary,
  id: 'tt0959621',
  title: 'An episode',
  type: 'episode',
};
