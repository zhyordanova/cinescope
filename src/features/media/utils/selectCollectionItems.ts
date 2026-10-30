import type { MediaSummary } from '../types/media.types';
import type { SearchMediaCollection } from '../types/mediaCollection.types';

export function selectCollectionItems(
  items: readonly MediaSummary[],
  {
    allowedTypes,
    maxItems,
  }: Pick<SearchMediaCollection, 'allowedTypes' | 'maxItems'>,
): MediaSummary[] {
  const seenIds = new Set<string>();

  return items
    .filter((item) => {
      if (
        !allowedTypes.some((type) => type === item.type) ||
        seenIds.has(item.id)
      ) {
        return false;
      }

      seenIds.add(item.id);
      return true;
    })
    .slice(0, maxItems);
}
