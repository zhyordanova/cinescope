import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { UNEXPECTED_FETCH_MESSAGE } from '../test-utils/testMessages';
import { omdbInvalidKeyFailure } from '../test-utils/omdbFixtures';
import { setupOmdbTestEnvironment } from '../test-utils/omdbTestEnvironment';

import { getMediaDetails, searchMedia } from './mediaRepository';

setupOmdbTestEnvironment();

const movie = {
  imdbID: 'tt0133093',
  Title: 'The Matrix',
  Type: 'movie',
  Year: '1999',
  Poster: 'N/A',
};

const series = {
  imdbID: 'tt0903747',
  Title: 'Breaking Bad',
  Type: 'series',
  Year: '2008-2013',
  Poster: 'N/A',
};

beforeEach(() => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error(UNEXPECTED_FETCH_MESSAGE));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('searchMedia', () => {
  it('rejects unsupported runtime types rather than silently omitting the filter', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch');

    await expect(
      // @ts-expect-error Exercise untyped caller input at the public boundary.
      searchMedia('matrix', { type: 'movie,series' }),
    ).rejects.toHaveProperty('kind', 'invalid-input');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a non-string runtime query', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch');

    await expect(
      // @ts-expect-error Exercise untyped caller input at the public boundary.
      searchMedia(null),
    ).rejects.toHaveProperty('kind', 'invalid-input');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    { year: 1000, page: 1 },
    { year: 9999, page: 100 },
  ])('accepts inclusive search bounds: %p', async (options) => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            Response: 'True',
            Search: [],
            totalResults: '0',
          }),
        ),
      );

    await searchMedia('matrix', options);

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));

    expect(url.searchParams.get('y')).toBe(String(options.year));
    expect(url.searchParams.get('page')).toBe(String(options.page));
  });

  it('returns mapped mixed results without a type filter or per-card detail requests', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            Response: 'True',
            Search: [
              movie,
              series,
              {
                ...series,
                imdbID: 'tt0959621',
                Type: 'episode',
              },
            ],
            totalResults: '3',
          }),
        ),
      );

    const result = await searchMedia('  matrix  ');

    expect(result.items.map((item) => item.type)).toEqual([
      'movie',
      'series',
      'episode',
    ]);

    expect(result.items[1]).toMatchObject({
      year: '2008-2013',
      posterUrl: null,
    });

    expect(result.totalResults).toBe(3);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));

    expect(url.searchParams.get('s')).toBe('matrix');

    for (const key of ['type', 'y', 'page', 'i']) {
      expect(url.searchParams.has(key)).toBe(false);
    }
  });

  it.each(['movie', 'series', 'episode'] as const)(
    'supports the optional single %s filter, year, page and signal',
    async (type) => {
      const fetchMock = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              Response: 'True',
              Search: [],
              totalResults: '0',
            }),
          ),
        );

      const signal = new AbortController().signal;

      await searchMedia('matrix', {
        type,
        year: 1999,
        page: 2,
        signal,
      });

      const url = new URL(String(fetchMock.mock.calls[0]?.[0]));

      expect(url.searchParams.get('type')).toBe(type);
      expect(url.searchParams.get('y')).toBe('1999');
      expect(url.searchParams.get('page')).toBe('2');
      expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(signal);
    },
  );

  it.each(['', '   '])(
    'rejects empty search input: %p',
    async (query) => {
      const fetchMock = jest.spyOn(globalThis, 'fetch');

      await expect(searchMedia(query)).rejects.toHaveProperty(
        'kind',
        'invalid-input',
      );

      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each([0, -1, 101, 1.5, NaN, Infinity])(
    'rejects an invalid page: %p',

    async (page) => {
      const fetchMock = jest.spyOn(globalThis, 'fetch');
      await expect(
        searchMedia('matrix', { page }),
      ).rejects.toHaveProperty('kind', 'invalid-input');
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each([999, 10000, 1999.5, NaN, Infinity])(
    'rejects an invalid year: %p',
    async (year) => {
      const fetchMock = jest.spyOn(globalThis, 'fetch');

      await expect(
        searchMedia('matrix', { year }),
      ).rejects.toHaveProperty('kind', 'invalid-input');

      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});

describe('getMediaDetails', () => {
  it.each([movie, series])(
    'maps details for $Type using the ID, full plot and signal',

    async (item) => {
      const fetchMock = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              ...item,
              Response: 'True',
              Plot: 'Full plot',
              totalSeasons: '5',
            }),
          ),
        );

      const signal = new AbortController().signal;
      const result = await getMediaDetails(item.imdbID, { signal });

      expect(result).toMatchObject({
        id: item.imdbID,
        type: item.Type,
        plot: 'Full plot',
        totalSeasons: item.Type === 'series' ? 5 : null,
      });

      const url = new URL(String(fetchMock.mock.calls[0]?.[0]));

      expect(url.searchParams.get('i')).toBe(item.imdbID);
      expect(url.searchParams.get('plot')).toBe('full');
      expect(url.searchParams.has('s')).toBe(false);
      expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(signal);
    },
  );

  it.each(['', 'invalid', 'tt123', ' tt0133093', 'tt0133093 '])(
    'rejects an invalid ID: %p',

    async (id) => {
      const fetchMock = jest.spyOn(globalThis, 'fetch');
      await expect(getMediaDetails(id)).rejects.toHaveProperty(
        'kind',
        'invalid-input',
      );

      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('rejects a response belonging to a different title', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ...series,
          Response: 'True',
        }),
      ),
    );
    await expect(
      getMediaDetails(movie.imdbID),
    ).rejects.toHaveProperty('kind', 'invalid-response');
  });
});

describe('repository failures', () => {
  it.each([
    () => searchMedia('matrix'),
    () => getMediaDetails(movie.imdbID),
  ])(
    'propagates OMDb application failures without an empty fallback: %p',

    async (request) => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(JSON.stringify(omdbInvalidKeyFailure)),
        );

      await expect(request()).rejects.toMatchObject({
        kind: 'api',
        message: omdbInvalidKeyFailure.Error,
      });
    },
  );

  it.each([
    () => searchMedia('matrix'),
    () => getMediaDetails(movie.imdbID),
  ])('rejects malformed success payloads: %p', async (request) => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ Response: 'True' })),
      );

    await expect(request()).rejects.toHaveProperty(
      'kind',
      'invalid-response',
    );
  });

  it('preserves cancellation through the repository', async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchMock = jest.spyOn(globalThis, 'fetch');

    await expect(
      searchMedia('matrix', { signal: controller.signal }),
    ).rejects.toHaveProperty('name', 'AbortError');

    await expect(
      getMediaDetails(movie.imdbID, { signal: controller.signal }),
    ).rejects.toHaveProperty('name', 'AbortError');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
