import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  CancelledError,
  QueryClient,
  QueryObserver,
} from '@tanstack/react-query';

import { createAbortError } from '../test-utils/createAbortError';

import {
  mediaDetailsOptions,
  mediaQueryKeys,
  mediaSearchOptions,
} from './media.queries';

const originalKey = process.env.EXPO_PUBLIC_OMDB_API_KEY;

const movie = {
  imdbID: 'tt0133093',
  Title: 'The Matrix',
  Type: 'movie',
  Year: '1999',
};

let client: QueryClient;

function searchResponse() {
  return new Response(
    JSON.stringify({
      Response: 'True',
      Search: [movie],
      totalResults: '1',
    }),
  );
}

function detailsResponse() {
  return new Response(JSON.stringify({ Response: 'True', ...movie }));
}

beforeEach(() => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(
      new Error('Unexpected Fetch request in test.'),
    );
  process.env.EXPO_PUBLIC_OMDB_API_KEY =
    'test-key-not-a-real-credential';
  client = new QueryClient();
});

afterEach(() => {
  client.clear();
  jest.restoreAllMocks();
  jest.useRealTimers();
  if (originalKey === undefined) {
    delete process.env.EXPO_PUBLIC_OMDB_API_KEY;
  } else {
    process.env.EXPO_PUBLIC_OMDB_API_KEY = originalKey;
  }
});

describe('media query keys', () => {
  it('normalizes whitespace and the default page', () => {
    expect(mediaQueryKeys.search(' matrix ')).toEqual(
      mediaQueryKeys.search('matrix', { page: 1 }),
    );
  });

  it('separates all result-affecting filters, text, and Details IDs', () => {
    const keys = [
      mediaQueryKeys.search('matrix'),
      mediaQueryKeys.search('batman'),
      mediaQueryKeys.search('matrix', { type: 'movie' }),
      mediaQueryKeys.search('matrix', { type: 'series' }),
      mediaQueryKeys.search('matrix', { type: 'episode' }),
      mediaQueryKeys.search('matrix', { year: 1999 }),
      mediaQueryKeys.search('matrix', { page: 2 }),
      mediaQueryKeys.details(movie.imdbID),
      mediaQueryKeys.details('tt0903747'),
    ];

    expect(new Set(keys.map((key) => JSON.stringify(key))).size).toBe(
      keys.length,
    );
    expect(JSON.stringify(keys)).not.toContain(
      process.env.EXPO_PUBLIC_OMDB_API_KEY,
    );
  });
});

describe('media query lifecycle', () => {
  it('passes normalized Search filters and a cancellation signal to Fetch', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(searchResponse());

    const result = await client.query(
      mediaSearchOptions(' matrix ', {
        type: 'movie',
        year: 1999,
        page: 2,
      }),
    );
    const [input, init] = fetchMock.mock.calls[0]!;
    const url = new URL(String(input));

    expect(url.searchParams.get('s')).toBe('matrix');
    expect(url.searchParams.get('type')).toBe('movie');
    expect(url.searchParams.get('y')).toBe('1999');
    expect(url.searchParams.get('page')).toBe('2');
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(result.items[0]?.id).toBe(movie.imdbID);
  });

  it.each(['search', 'details'] as const)(
    'deduplicates concurrent %s requests and reuses fresh data',
    async (kind) => {
      const fetchMock = jest
        .spyOn(globalThis, 'fetch')
        .mockImplementation(async () =>
          kind === 'search' ? searchResponse() : detailsResponse(),
        );

      if (kind === 'search') {
        const [first, second] = await Promise.all([
          client.query(mediaSearchOptions('matrix')),
          client.query(mediaSearchOptions(' matrix ', { page: 1 })),
        ]);
        expect(first).toEqual(second);
        await client.query(mediaSearchOptions('matrix'));
      } else {
        const options = mediaDetailsOptions(movie.imdbID);
        const [first, second] = await Promise.all([
          client.query(options),
          client.query(options),
        ]);
        expect(first).toEqual(second);
        await client.query(options);
      }

      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it('refetches Search after five minutes, not merely when the timer expires', async () => {
    jest.useFakeTimers();
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => searchResponse());
    const options = mediaSearchOptions('matrix');

    await client.query(options);
    jest.advanceTimersByTime(5 * 60 * 1000 - 1);
    await client.query(options);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await client.query(options);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retains inactive Search data for exactly ten minutes', async () => {
    jest.useFakeTimers();
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(searchResponse());

    const options = mediaSearchOptions('matrix');

    await client.query(options);

    jest.advanceTimersByTime(10 * 60 * 1000 - 1);
    expect(client.getQueryData(options.queryKey)).toBeDefined();

    jest.advanceTimersByTime(1);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
  });

  it('uses the longer Details freshness and retention thresholds', async () => {
    jest.useFakeTimers();
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => detailsResponse());
    const options = mediaDetailsOptions(movie.imdbID);

    await client.query(options);

    jest.advanceTimersByTime(10 * 60 * 1000 - 1);

    await client.query(options);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1);

    await client.query(options);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(30 * 60 * 1000 - 1);
    expect(client.getQueryData(options.queryKey)).toBeDefined();

    jest.advanceTimersByTime(1);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
  });

  it('aborts in-flight Fetch when the query is cancelled, without retries', async () => {
    let requestSignal: AbortSignal | null | undefined;

    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(
        (_input, init) =>
          new Promise<Response>((_resolve, reject) => {
            requestSignal = init?.signal;
            requestSignal?.addEventListener('abort', () => {
              reject(createAbortError('Cancelled test request'));
            });
          }),
      );

    const options = mediaDetailsOptions(movie.imdbID);

    const outcome = client
      .query(options)
      .catch((error: unknown) => error);

    await client.cancelQueries({ queryKey: options.queryKey });

    expect(requestSignal?.aborted).toBe(true);
    expect(await outcome).toBeInstanceOf(CancelledError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
  });

  it('does not automatically fetch empty searches or invalid Details IDs', () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch');

    const searchObserver = new QueryObserver(
      client,
      mediaSearchOptions('  '),
    );

    const detailsObserver = new QueryObserver(
      client,
      mediaDetailsOptions('invalid'),
    );

    const unsubscribeSearch = searchObserver.subscribe(() => {});
    const unsubscribeDetails = detailsObserver.subscribe(() => {});

    expect(searchObserver.getCurrentResult().fetchStatus).toBe(
      'idle',
    );

    expect(detailsObserver.getCurrentResult().fetchStatus).toBe(
      'idle',
    );

    expect(fetchMock).not.toHaveBeenCalled();

    unsubscribeSearch();
    unsubscribeDetails();
  });
});

describe('media retries', () => {
  it('recovers from a transient network failure', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Test network failure'))
      .mockResolvedValue(searchResponse());

    await expect(
      client.query({
        ...mediaSearchOptions('matrix'),
        retryDelay: 0,
      }),
    ).resolves.toHaveProperty('totalResults', 1);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('stops after two retries for persistent HTTP 5xx failures', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(
        async () => new Response('', { status: 503 }),
      );

    await expect(
      client.query({
        ...mediaDetailsOptions(movie.imdbID),
        retryDelay: 0,
      }),
    ).rejects.toHaveProperty('status', 503);

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it.each([
    ['HTTP 401', () => new Response('', { status: 401 })],
    ['HTTP 429', () => new Response('', { status: 429 })],
    ['invalid JSON', () => new Response('not json')],

    [
      'OMDb failure',
      () =>
        new Response(
          JSON.stringify({
            Response: 'False',
            Error: 'Invalid API key!',
          }),
        ),
    ],

    [
      'invalid response',
      () => new Response(JSON.stringify({ Response: 'True' })),
    ],
  ] as const)('does not retry %s', async (_label, response) => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => response());

    await expect(
      client.query({
        ...mediaSearchOptions('matrix'),
        retryDelay: 0,
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(['configuration', 'invalid-input'] as const)(
    'surfaces %s without fetching or retrying',

    async (kind) => {
      const fetchMock = jest.spyOn(globalThis, 'fetch');
      if (kind === 'configuration') {
        delete process.env.EXPO_PUBLIC_OMDB_API_KEY;
      }

      await expect(
        client.query({
          ...mediaSearchOptions('matrix', {
            page: kind === 'invalid-input' ? 0 : 1,
          }),
          retryDelay: 0,
        }),
      ).rejects.toHaveProperty('kind', kind);

      expect(fetchMock).not.toHaveBeenCalled();

      expect(
        client.getQueryState(
          mediaQueryKeys.search('matrix', {
            page: kind === 'invalid-input' ? 0 : 1,
          }),
        )?.fetchFailureCount,
      ).toBe(1);
    },
  );
});
