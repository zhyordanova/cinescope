import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { MEDIA_ERROR_MESSAGES } from '../constants/mediaErrorMessages';
import { createAbortError } from '../test-utils/createAbortError';

import { OmdbRequestError, requestOmdb } from './omdbClient';

const originalKey = process.env.EXPO_PUBLIC_OMDB_API_KEY;
const testKey = 'test-key-not-a-real-credential';

beforeEach(() => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(
      new Error('Unexpected Fetch request in test.'),
    );
  process.env.EXPO_PUBLIC_OMDB_API_KEY = testKey;
});

afterEach(() => {
  jest.restoreAllMocks();
  if (originalKey === undefined) {
    delete process.env.EXPO_PUBLIC_OMDB_API_KEY;
  } else {
    process.env.EXPO_PUBLIC_OMDB_API_KEY = originalKey;
  }
});

describe('OMDb transport', () => {
  it('encodes parameters over HTTPS and forwards the exact signal', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ Response: 'True' })),
      );

    const signal = new AbortController().signal;

    await expect(
      requestOmdb({ s: 'A & B? #映画' }, signal),
    ).resolves.toEqual({
      Response: 'True',
    });

    const [input, init] = fetchMock.mock.calls[0] ?? [];

    expect(typeof input).toBe('string');

    const url = new URL(String(input));

    expect(url.origin).toBe('https://www.omdbapi.com');
    expect(url.searchParams.get('s')).toBe('A & B? #映画');
    expect(url.searchParams.get('apikey')).toBe(testKey);
    expect(url.searchParams.get('r')).toBe('json');
    expect(url.searchParams.has('type')).toBe(false);
    expect(init?.signal).toBe(signal);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, '', '  '])(
    'rejects missing configuration: %p',
    async (key) => {
      const fetchMock = jest.spyOn(globalThis, 'fetch');

      if (key === undefined)
        delete process.env.EXPO_PUBLIC_OMDB_API_KEY;
      else process.env.EXPO_PUBLIC_OMDB_API_KEY = key;

      await expect(
        requestOmdb({ s: 'matrix' }),
      ).rejects.toMatchObject({
        kind: 'configuration',
      });

      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each([401, 429, 500, 503])(
    'surfaces HTTP %i without reading the body',

    async (status) => {
      const response = new Response('private response body', {
        status,
      });

      const text = jest.spyOn(response, 'text');

      jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);

      await expect(
        requestOmdb({ s: 'matrix' }),
      ).rejects.toMatchObject({
        kind: 'http',
        status,
        message: MEDIA_ERROR_MESSAGES.http(status),
      });

      expect(text).not.toHaveBeenCalled();
    },
  );

  it('sanitizes network failures rather than including request URLs or keys', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(
        new TypeError(
          `Failed URL https://www.omdbapi.com/?apikey=${testKey}`,
        ),
      );

    await expect(requestOmdb({ s: 'matrix' })).rejects.toEqual(
      new OmdbRequestError('network', MEDIA_ERROR_MESSAGES.network),
    );
  });

  it('rejects invalid JSON without exposing the response body', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('<html>bad response</html>'));

    await expect(requestOmdb({ s: 'matrix' })).rejects.toMatchObject({
      kind: 'invalid-json',
      message: MEDIA_ERROR_MESSAGES.invalidJson,
    });
  });

  it('reports body-read network failures separately from JSON parse failures', async () => {
    const response = new Response('{}');

    jest
      .spyOn(response, 'text')
      .mockRejectedValue(new TypeError('stream disconnected'));

    jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    await expect(requestOmdb({ s: 'matrix' })).rejects.toMatchObject({
      kind: 'network',
      message: MEDIA_ERROR_MESSAGES.responseRead,
    });
  });

  it('leaves OMDb application failures for response validation/mapping', async () => {
    const body = { Response: 'False', Error: 'Movie not found!' };

    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(body)));

    await expect(requestOmdb({ s: 'missing' })).resolves.toEqual(
      body,
    );
  });
});

describe('cancellation', () => {
  it('does not fetch an already cancelled request', async () => {
    const controller = new AbortController();

    controller.abort();

    const fetchMock = jest.spyOn(globalThis, 'fetch');

    await expect(
      requestOmdb({ s: 'matrix' }, controller.signal),
    ).rejects.toHaveProperty('name', 'AbortError');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('preserves fetch AbortError identity', async () => {
    const abortError = createAbortError();

    jest.spyOn(globalThis, 'fetch').mockRejectedValue(abortError);

    await expect(requestOmdb({ s: 'matrix' })).rejects.toBe(
      abortError,
    );
  });

  it('propagates cancellation while fetch is in flight', async () => {
    const controller = new AbortController();

    const abortError = createAbortError();

    jest.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(abortError),
            { once: true },
          );
        }),
    );

    const request = requestOmdb({ s: 'matrix' }, controller.signal);

    controller.abort();

    await expect(request).rejects.toHaveProperty(
      'name',
      'AbortError',
    );
  });

  it('preserves cancellation while reading the body', async () => {
    const response = new Response('{}');

    const abortError = createAbortError();

    jest.spyOn(response, 'text').mockRejectedValue(abortError);
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    await expect(requestOmdb({ s: 'matrix' })).rejects.toBe(
      abortError,
    );
  });

  it('does not return success if cancellation happens during body parsing', async () => {
    const controller = new AbortController();
    const response = new Response('{}');

    jest.spyOn(response, 'text').mockImplementation(async () => {
      controller.abort();
      return '{}';
    });

    jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    await expect(
      requestOmdb({ s: 'matrix' }, controller.signal),
    ).rejects.toHaveProperty('name', 'AbortError');
  });
});
