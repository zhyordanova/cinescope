import type { SearchMediaCollection } from '../types/mediaCollection.types';
import { selectCollectionItems } from '../utils/selectCollectionItems';

import { useMediaSearch } from './useMediaSearch';

export function useMediaCollection(
  collection: SearchMediaCollection,
) {
  const search = useMediaSearch(collection.query, { page: 1 });

  return {
    ...search,
    items: search.data
      ? selectCollectionItems(search.data.items, collection)
      : undefined,
  };
}
