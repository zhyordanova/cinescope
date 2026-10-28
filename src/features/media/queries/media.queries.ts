import { queryOptions } from '@tanstack/react-query';

import { getMediaDetails, searchMedia } from '../api/mediaRepository';
import { OmdbRequestError } from '../api/omdbClient';
import type { SearchMediaOptions } from '../types/mediaRepository.types';
import { isValidMediaId } from '../utils/isValidMediaId';

export type MediaSearchFilters = Omit<SearchMediaOptions, 'signal'>;

function retryMediaRequest(
  failureCount: number,
  error: Error,
): boolean {
  if (failureCount >= 2 || !(error instanceof OmdbRequestError)) {
    return false;
  }

  return (
    error.kind === 'network' ||
    (error.kind === 'http' &&
      error.status !== undefined &&
      error.status >= 500 &&
      error.status <= 599)
  );
}

export const mediaQueryKeys = {
  all: ['media'] as const,
  search: (query: string, filters: MediaSearchFilters = {}) =>
    [
      ...mediaQueryKeys.all,
      'search',
      query.trim(),
      filters?.type ?? null,
      filters?.year ?? null,
      filters.page ?? 1,
    ] as const,

  details: (id: string) =>
    [...mediaQueryKeys.all, 'details', id] as const,
};

export function mediaSearchOptions(
  query: string,
  { type, year, page = 1 }: MediaSearchFilters = {},
) {
  const normalizedQuery = query.trim();

  return queryOptions({
    queryKey: mediaQueryKeys.search(normalizedQuery, {
      type,
      year,
      page,
    }),
    enabled: normalizedQuery.length > 0,
    queryFn: ({ signal }) =>
      searchMedia(normalizedQuery, { type, year, page, signal }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: retryMediaRequest,
  });
}

export function mediaDetailsOptions(id: string) {
  return queryOptions({
    queryKey: mediaQueryKeys.details(id),
    enabled: isValidMediaId(id),
    queryFn: ({ signal }) => getMediaDetails(id, { signal }),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: retryMediaRequest,
  });
}
