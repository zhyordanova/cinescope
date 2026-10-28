import { MEDIA_ERROR_MESSAGES } from '../constants/mediaErrorMessages';
import type { OmdbMediaType } from '../types/omdb.types';

type OmdbRequestParams =
  | { s: string; type?: OmdbMediaType; y?: number; page?: number }
  | { i: string; plot: 'full' };

export class OmdbRequestError extends Error {
  constructor(
    public readonly kind:
      | 'configuration'
      | 'http'
      | 'network'
      | 'invalid-json'
      | 'invalid-input',
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'OmdbRequestError';
  }
}

function checkCancellation(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw (
      signal.reason ??
      Object.assign(new Error(MEDIA_ERROR_MESSAGES.cancelled), {
        name: 'AbortError',
      })
    );
  }
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

export async function requestOmdb(
  params: OmdbRequestParams,
  signal?: AbortSignal,
): Promise<unknown> {
  checkCancellation(signal);

  const apiKey = process.env.EXPO_PUBLIC_OMDB_API_KEY?.trim();

  if (!apiKey) {
    throw new OmdbRequestError(
      'configuration',
      MEDIA_ERROR_MESSAGES.missingApiKey,
    );
  }

  const url = new URL('https://www.omdbapi.com/');

  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('r', 'json');

  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined)
      url.searchParams.set(name, String(value));
  }

  let response: Response;

  try {
    response = await fetch(url.href, { signal });
  } catch (error) {
    checkCancellation(signal);
    if (isAbortError(error)) throw error;
    throw new OmdbRequestError(
      'network',
      MEDIA_ERROR_MESSAGES.network,
    );
  }

  checkCancellation(signal);

  if (!response.ok) {
    throw new OmdbRequestError(
      'http',
      MEDIA_ERROR_MESSAGES.http(response.status),
      response.status,
    );
  }

  let body: string;

  try {
    body = await response.text();
  } catch (error) {
    checkCancellation(signal);
    if (isAbortError(error)) throw error;
    throw new OmdbRequestError(
      'network',
      MEDIA_ERROR_MESSAGES.responseRead,
    );
  }

  checkCancellation(signal);

  try {
    const parsed: unknown = JSON.parse(body);
    return parsed;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    throw new OmdbRequestError(
      'invalid-json',
      MEDIA_ERROR_MESSAGES.invalidJson,
    );
  }
}
