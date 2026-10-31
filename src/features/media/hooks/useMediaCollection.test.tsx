import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  act,
  cleanup,
  renderHook,
  waitFor,
} from '@testing-library/react-native/pure';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { MEDIA_COLLECTIONS } from '../constants/mediaCollections';
import { mediaQueryKeys } from '../queries/media.queries';
import {
  omdbFailure,
  omdbEpisode as episode,
  omdbMovie as movie,
  omdbSeries as series,
} from '../test-utils/omdbFixtures';
import type { MediaSearchResult } from '../types/media.types';
import { UNEXPECTED_FETCH_MESSAGE } from '../test-utils/testMessages';
import { setupOmdbTestEnvironment } from '../test-utils/omdbTestEnvironment';
import type { SearchMediaCollection } from '../types/mediaCollection.types';

import { useMediaCollection } from './useMediaCollection';

setupOmdbTestEnvironment();
const collection = MEDIA_COLLECTIONS[1];

let client: QueryClient;

function wrapper({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

function searchResponse(items = [movie, series, episode]) {
  return new Response(
    JSON.stringify({
      Response: 'True',
      Search: items,
      totalResults: String(items.length),
    }),
  );
}

beforeEach(() => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error(UNEXPECTED_FETCH_MESSAGE));
  client = new QueryClient();
});

afterEach(async () => {
  await cleanup();
  client.clear();
  jest.restoreAllMocks();
});

describe('useMediaCollection', () => {
  it('exposes loading before mapped, filtered, deduplicated and limited items', async () => {
    const response = Promise.withResolvers<Response>();
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(response.promise);
    const limitedCollection: SearchMediaCollection = {
      ...collection,
      maxItems: 2,
    };

    const { result } = await renderHook(
      () => useMediaCollection(limitedCollection),
      { wrapper },
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.items).toBeUndefined();

    await act(async () => {
      response.resolve(
        searchResponse([
          episode,
          movie,
          movie,
          series,
          { ...movie, imdbID: 'tt0468569', Title: 'The Dark Knight' },
        ]),
      );
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.items).toEqual([
      {
        id: movie.imdbID,
        title: movie.Title,
        type: 'movie',
        year: movie.Year,
        posterUrl: movie.Poster,
      },
      {
        id: series.imdbID,
        title: series.Title,
        type: 'series',
        year: series.Year,
        posterUrl: null,
      },
    ]);

    const [input, init] = fetchMock.mock.calls[0]!;
    const url = new URL(String(input));

    expect(url.searchParams.get('s')).toBe('Batman');
    expect(url.searchParams.get('page')).toBe('1');
    expect(url.searchParams.has('type')).toBe(false);
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([{ items: [] }, { items: [episode] }])(
    'exposes a successful empty collection for results $items',
    async ({ items }) => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(searchResponse(items));

      const { result } = await renderHook(
        () => useMediaCollection(collection),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.error).toBeNull();
    },
  );

  it('surfaces an API error and supports manual retry', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(omdbFailure)),
      )
      .mockResolvedValueOnce(searchResponse());

    const { result } = await renderHook(
      () => useMediaCollection(collection),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe(omdbFailure.Error);
    expect(result.current.items).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.items).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shares a Search request across collection rules without filtering cached data', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => searchResponse());

    const seriesCollection: SearchMediaCollection = {
      ...collection,
      id: 'series-only',
      allowedTypes: ['series'],
      maxItems: 1,
    };
    const { result, unmount } = await renderHook(
      () => ({
        mixed: useMediaCollection(collection),
        series: useMediaCollection(seriesCollection),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.mixed.isSuccess).toBe(true);
      expect(result.current.series.isSuccess).toBe(true);
    });

    expect(
      result.current.mixed.items?.map((item) => item.id),
    ).toEqual([movie.imdbID, series.imdbID]);

    expect(
      result.current.series.items?.map((item) => item.id),
    ).toEqual([series.imdbID]);

    expect(
      client
        .getQueryData<MediaSearchResult>(
          mediaQueryKeys.search(collection.query),
        )
        ?.items.map((item) => item.id),
    ).toEqual([movie.imdbID, series.imdbID, episode.imdbID]);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await unmount();

    const remounted = await renderHook(
      () => useMediaCollection(collection),
      { wrapper },
    );

    expect(remounted.result.current.isSuccess).toBe(true);
    expect(remounted.result.current.items).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('makes exactly three independent Search requests and no Details requests', async () => {
    const pending = Promise.withResolvers<Response>();
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input) => {
        const url = new URL(String(input));
        if (url.searchParams.get('s') === 'Batman') {
          return pending.promise;
        }

        if (url.searchParams.get('s') === 'Journey') {
          return new Response(JSON.stringify(omdbFailure));
        }

        if (url.searchParams.get('s') === 'Christmas') {
          return searchResponse();
        }

        throw new Error(UNEXPECTED_FETCH_MESSAGE);
      });

    const { result } = await renderHook(
      () => ({
        batman: useMediaCollection(MEDIA_COLLECTIONS[1]),
        journey: useMediaCollection(MEDIA_COLLECTIONS[2]),
        holiday: useMediaCollection(MEDIA_COLLECTIONS[3]),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.journey.isError).toBe(true);
      expect(result.current.holiday.isSuccess).toBe(true);
    });

    expect(result.current.batman.isPending).toBe(true);
    expect(result.current.holiday.items).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const queries = fetchMock.mock.calls.map(([input]) => {
      const url = new URL(String(input));
      expect(url.searchParams.get('page')).toBe('1');
      expect(url.searchParams.has('type')).toBe(false);
      expect(url.searchParams.has('i')).toBe(false);
      return url.searchParams.get('s');
    });

    expect(queries.sort()).toEqual([
      'Batman',
      'Christmas',
      'Journey',
    ]);

    await act(async () => {
      pending.resolve(searchResponse());
    });

    await waitFor(() => {
      expect(result.current.batman.isSuccess).toBe(true);
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
