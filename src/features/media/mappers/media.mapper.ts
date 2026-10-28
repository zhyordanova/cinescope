import { MEDIA_ERROR_MESSAGES } from '../constants/mediaErrorMessages';
import type {
  MediaDetails,
  MediaSearchResult,
  MediaSummary,
} from '../types/media.types';
import type {
  OmdbDetailsResponse,
  OmdbFailureResponse,
  OmdbMediaSummary,
  OmdbSearchResponse,
} from '../types/omdb.types';
import { isValidMediaId } from '../utils/isValidMediaId';

export class OmdbResponseError extends Error {
  constructor(
    public readonly kind: 'invalid-response' | 'api',
    message: string,
  ) {
    super(message);
    this.name = 'OmdbResponseError';
  }
}

function invalidResponse(field: string): never {
  throw new OmdbResponseError(
    'invalid-response',
    MEDIA_ERROR_MESSAGES.invalidResponse(field),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    return invalidResponse('expected an object');
  }

  return value;
}

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();

  return trimmed && trimmed !== 'N/A' ? trimmed : null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function parseFailure(
  value: Record<string, unknown>,
): OmdbFailureResponse | null {
  if (value.Response === 'True') return null;

  if (value.Response !== 'False') return invalidResponse('Response');

  const message = text(value.Error);

  if (!message) return invalidResponse('Error');

  return { Response: 'False', Error: message };
}

function parseSummary(value: unknown): OmdbMediaSummary {
  const item = record(value);
  const id = text(item.imdbID);
  const title = text(item.Title);

  if (!isValidMediaId(id)) return invalidResponse('imdbID');

  if (!title) return invalidResponse('Title');

  if (
    item.Type !== 'movie' &&
    item.Type !== 'series' &&
    item.Type !== 'episode'
  ) {
    return invalidResponse('Type');
  }

  return {
    imdbID: id,
    Title: title,
    Type: item.Type,
    Year: optionalString(item.Year),
    Poster: optionalString(item.Poster),
  };
}

export function parseOmdbSearchResponse(
  value: unknown,
): OmdbSearchResponse {
  const response = record(value);
  const failure = parseFailure(response);

  if (failure) return failure;
  if (!Array.isArray(response.Search))
    return invalidResponse('Search');

  if (
    typeof response.totalResults !== 'string' ||
    !/^\d+$/.test(response.totalResults) ||
    !Number.isSafeInteger(Number(response.totalResults))
  ) {
    return invalidResponse('totalResults');
  }

  return {
    Response: 'True',
    Search: response.Search.map((item: unknown) =>
      parseSummary(item),
    ),
    totalResults: response.totalResults,
  };
}

export function parseOmdbDetailsResponse(
  value: unknown,
): OmdbDetailsResponse {
  const response = record(value);
  const failure = parseFailure(response);

  if (failure) return failure;
  return {
    ...parseSummary(response),
    Response: 'True',
    Plot: optionalString(response.Plot),
    Genre: optionalString(response.Genre),
    Runtime: optionalString(response.Runtime),
    imdbRating: optionalString(response.imdbRating),
    totalSeasons: optionalString(response.totalSeasons),
  };
}

function posterUrl(value: unknown): string | null {
  const candidate = text(value);

  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.href;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}

function mapSummary(item: OmdbMediaSummary): MediaSummary {
  const year = text(item.Year);

  return {
    id: item.imdbID,
    title: item.Title,
    type: item.Type,
    year:
      year && /^\d{4}(?:[-\u2013](?:\d{4})?)?$/.test(year)
        ? year
        : null,
    posterUrl: posterUrl(item.Poster),
  };
}

function positiveInteger(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function mapOmdbSearchResponse(
  value: unknown,
): MediaSearchResult {
  const response = parseOmdbSearchResponse(value);

  if (response.Response === 'False') {
    throw new OmdbResponseError('api', response.Error);
  }

  return {
    items: response.Search.map(mapSummary),
    totalResults: Number(response.totalResults),
  };
}

export function mapOmdbDetailsResponse(value: unknown): MediaDetails {
  const response = parseOmdbDetailsResponse(value);

  if (response.Response === 'False') {
    throw new OmdbResponseError('api', response.Error);
  }

  const runtime = text(response.Runtime)?.match(/^(\d+) min$/);
  const ratingText = text(response.imdbRating);

  const rating =
    ratingText && /^\d+(?:\.\d+)?$/.test(ratingText)
      ? Number(ratingText)
      : null;
  return {
    ...mapSummary(response),
    plot: text(response.Plot),
    genres:
      text(response.Genre)
        ?.split(',')
        .map((genre) => genre.trim())
        .filter((genre) => genre && genre !== 'N/A') ?? [],
    runtimeMinutes: positiveInteger(runtime?.[1] ?? null),
    imdbRating:
      rating !== null && rating >= 0 && rating <= 10 ? rating : null,
    totalSeasons:
      response.Type === 'series'
        ? positiveInteger(text(response.totalSeasons))
        : null,
  };
}
