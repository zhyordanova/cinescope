import { MEDIA_ERROR_MESSAGES } from '../constants/mediaErrorMessages';
import {
  mapOmdbDetailsResponse,
  mapOmdbSearchResponse,
  OmdbResponseError,
} from '../mappers/media.mapper';
import type {
  MediaDetails,
  MediaSearchResult,
} from '../types/media.types';
import type {
  RequestOptions,
  SearchMediaOptions,
} from '../types/mediaRepository.types';
import { isValidMediaId } from '../utils/isValidMediaId';

import { OmdbRequestError, requestOmdb } from './omdbClient';

export async function searchMedia(
  query: string,
  { type, year, page, signal }: SearchMediaOptions = {},
): Promise<MediaSearchResult> {
  if (typeof query !== 'string' || !query.trim()) {
    throw new OmdbRequestError(
      'invalid-input',
      MEDIA_ERROR_MESSAGES.emptyQuery,
    );
  }

  if (
    type !== undefined &&
    type !== 'movie' &&
    type !== 'series' &&
    type !== 'episode'
  ) {
    throw new OmdbRequestError(
      'invalid-input',
      MEDIA_ERROR_MESSAGES.invalidSearchType,
    );
  }

  if (
    year !== undefined &&
    (!Number.isInteger(year) || year < 1000 || year > 9999)
  ) {
    throw new OmdbRequestError(
      'invalid-input',
      MEDIA_ERROR_MESSAGES.invalidSearchYear,
    );
  }

  if (
    page !== undefined &&
    (!Number.isInteger(page) || page < 1 || page > 100)
  ) {
    throw new OmdbRequestError(
      'invalid-input',
      MEDIA_ERROR_MESSAGES.invalidSearchPage,
    );
  }

  return mapOmdbSearchResponse(
    await requestOmdb(
      { s: query.trim(), type, y: year, page },
      signal,
    ),
  );
}

export async function getMediaDetails(
  id: string,
  { signal }: RequestOptions = {},
): Promise<MediaDetails> {
  if (!isValidMediaId(id)) {
    throw new OmdbRequestError(
      'invalid-input',
      MEDIA_ERROR_MESSAGES.invalidId,
    );
  }

  const media = mapOmdbDetailsResponse(
    await requestOmdb({ i: id, plot: 'full' }, signal),
  );

  if (media.id !== id) {
    throw new OmdbResponseError(
      'invalid-response',
      MEDIA_ERROR_MESSAGES.mismatchedId,
    );
  }

  return media;
}
