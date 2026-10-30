import { describe, expect, it } from '@jest/globals';

import { isValidMediaId } from '../utils/isValidMediaId';

import { MEDIA_COLLECTIONS } from './mediaCollections';

describe('media collection configuration', () => {
  it('defines four unique collections in the approved order', () => {
    expect(
      MEDIA_COLLECTIONS.map(({ id, title, source }) => ({
        id,
        title,
        source,
      })),
    ).toEqual([
      {
        id: 'beyond-reality',
        title: 'Beyond Reality',
        source: 'curated',
      },
      {
        id: 'batman-on-screen',
        title: 'Batman on Screen',
        source: 'search',
      },
      {
        id: 'journeys-and-discoveries',
        title: 'Journeys & Discoveries',
        source: 'search',
      },
      {
        id: 'holiday-magic',
        title: 'Holiday Magic',
        source: 'search',
      },
    ]);

    expect(new Set(MEDIA_COLLECTIONS.map(({ id }) => id)).size).toBe(
      4,
    );
  });

  it('preserves all eight curated titles in their exact alternating order', () => {
    const curated = MEDIA_COLLECTIONS[0];

    expect(
      curated.items.map(({ id, title, type, year }) => ({
        id,
        title,
        type,
        year,
      })),
    ).toEqual([
      {
        id: 'tt1375666',
        title: 'Inception',
        type: 'movie',
        year: '2010',
      },
      {
        id: 'tt5753856',
        title: 'Dark',
        type: 'series',
        year: '2017–2020',
      },
      {
        id: 'tt0816692',
        title: 'Interstellar',
        type: 'movie',
        year: '2014',
      },
      {
        id: 'tt11280740',
        title: 'Severance',
        type: 'series',
        year: '2022–',
      },
      {
        id: 'tt0133093',
        title: 'The Matrix',
        type: 'movie',
        year: '1999',
      },
      {
        id: 'tt2085059',
        title: 'Black Mirror',
        type: 'series',
        year: '2011–',
      },
      {
        id: 'tt1130884',
        title: 'Shutter Island',
        type: 'movie',
        year: '2010',
      },
      {
        id: 'tt0475784',
        title: 'Westworld',
        type: 'series',
        year: '2016–2022',
      },
    ]);

    expect(new Set(curated.items.map(({ id }) => id)).size).toBe(8);
  });

  it('stores lightweight curated summaries with valid remote poster URLs', () => {
    for (const item of MEDIA_COLLECTIONS[0].items) {
      expect(Object.keys(item).sort()).toEqual([
        'id',
        'posterUrl',
        'title',
        'type',
        'year',
      ]);

      expect(isValidMediaId(item.id)).toBe(true);

      const poster = new URL(item.posterUrl);

      expect(poster.protocol).toBe('https:');
      expect(poster.hostname).toBe('m.media-amazon.com');
      expect(poster.username).toBe('');
      expect(poster.password).toBe('');
    }
  });

  it('configures only the approved searches with mixed Home types and ten-card limits', () => {
    const searches = MEDIA_COLLECTIONS.filter(
      (collection) => collection.source === 'search',
    );

    expect(searches.map(({ query }) => query)).toEqual([
      'Batman',
      'Journey',
      'Christmas',
    ]);

    for (const collection of searches) {
      expect(collection.allowedTypes).toEqual(['movie', 'series']);
      expect(collection.maxItems).toBe(10);
      expect(collection).not.toHaveProperty('type');
      expect(collection).not.toHaveProperty('page');
    }
  });
});
