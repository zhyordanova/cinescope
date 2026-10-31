import { describe, expect, it } from '@jest/globals';

import {
  episodeSummary as episode,
  movieSummary as movie,
  seriesSummary as series,
} from '../test-utils/mediaFixtures';
import type { SearchMediaCollection } from '../types/mediaCollection.types';

import { selectCollectionItems } from './selectCollectionItems';

const rules: Pick<
  SearchMediaCollection,
  'allowedTypes' | 'maxItems'
> = {
  allowedTypes: ['movie', 'series'],
  maxItems: 10,
};

describe('selectCollectionItems', () => {
  it('excludes episodes and preserves the order of movies and series', () => {
    expect(
      selectCollectionItems([episode, series, movie], rules),
    ).toEqual([series, movie]);
  });

  it('deduplicates by ID and retains the first eligible occurrence', () => {
    const duplicate = {
      ...movie,
      title: 'Another title for the same ID',
    };

    expect(
      selectCollectionItems(
        [
          { ...episode, id: movie.id },
          movie,
          duplicate,
          series,
          series,
        ],
        rules,
      ),
    ).toEqual([movie, series]);
  });

  it('applies the limit after filtering and deduplication', () => {
    expect(
      selectCollectionItems([episode, movie, movie, series], {
        ...rules,
        maxItems: 2,
      }),
    ).toEqual([movie, series]);
  });

  it('caps results at ten without reordering or modifying the input', () => {
    const items = Object.freeze(
      Array.from({ length: 12 }, (_, index) =>
        Object.freeze({ ...movie, id: `tt${1000000 + index}` }),
      ),
    );

    expect(selectCollectionItems(items, rules)).toEqual(
      items.slice(0, 10),
    );

    expect(items).toHaveLength(12);
  });

  it('honors a narrower allowed-type configuration', () => {
    expect(
      selectCollectionItems([movie, series], {
        allowedTypes: ['series'],
        maxItems: 10,
      }),
    ).toEqual([series]);
  });

  it.each([{ items: [] }, { items: [episode] }])(
    'returns no cards when none are eligible: $items',
    ({ items }) => {
      expect(selectCollectionItems(items, rules)).toEqual([]);
    },
  );

  it('retains eligible cards with unavailable years and posters', () => {
    const unavailable = { ...movie, year: null, posterUrl: null };

    expect(selectCollectionItems([unavailable], rules)).toEqual([
      unavailable,
    ]);
  });

  it('does not deduplicate across separate collection selections', () => {
    expect(selectCollectionItems([movie], rules)).toEqual([movie]);
    expect(selectCollectionItems([movie, series], rules)).toEqual([
      movie,
      series,
    ]);
  });
});
