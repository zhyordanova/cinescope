import { useQuery } from '@tanstack/react-query';

import { mediaDetailsOptions } from '../queries/media.queries';

export function useMediaDetails(id: string) {
  return useQuery(mediaDetailsOptions(id));
}
