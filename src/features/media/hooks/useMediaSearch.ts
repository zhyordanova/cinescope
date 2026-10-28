import { useQuery } from '@tanstack/react-query';

import {
  mediaSearchOptions,
  type MediaSearchFilters,
} from '../queries/media.queries';

export function useMediaSearch(
  query: string,
  options: MediaSearchFilters = {},
) {
  return useQuery(mediaSearchOptions(query, options));
}
