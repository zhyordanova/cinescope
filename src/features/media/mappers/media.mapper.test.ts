import { describe, expect, it } from '@jest/globals';

import {
  omdbFailure,
  omdbInvalidKeyFailure,
} from '../test-utils/omdbFixtures';

import {
  mapOmdbDetailsResponse,
  mapOmdbSearchResponse,
  OmdbResponseError,
  parseOmdbDetailsResponse,
  parseOmdbSearchResponse,
} from './media.mapper';

const summary = {
  imdbID: 'tt0133093',
  Title: 'The Matrix',
  Type: 'movie',
  Year: '1999',
  Poster: 'https://example.com/matrix.jpg',
};

const details = {
  ...summary,
  Response: 'True',
  Plot: ' A programmer discovers a simulated reality. ',
  Genre: 'Action, Sci-Fi',
  Runtime: '136 min',
  imdbRating: '8.7',
};

function search(item: unknown = summary) {
  return { Response: 'True', Search: [item], totalResults: '1' };
}

describe('OMDb response contracts', () => {
  it('parses Search success and failure as distinct variants', () => {
    expect(parseOmdbSearchResponse(search())).toEqual(search());

    expect(parseOmdbSearchResponse(omdbFailure)).toEqual({
      Response: 'False',
      Error: 'Movie not found!',
    });
  });

  it('parses Details success and failure as distinct variants', () => {
    expect(parseOmdbDetailsResponse(details)).toEqual(details);

    expect(parseOmdbDetailsResponse(omdbInvalidKeyFailure)).toEqual({
      Response: 'False',
      Error: 'Invalid API key!',
    });
  });

  it.each([null, undefined, [], 'invalid', 42, {}])(
    'rejects invalid envelopes: %p',
    (value) => {
      expect(() => parseOmdbSearchResponse(value)).toThrow(
        OmdbResponseError,
      );

      expect(() => parseOmdbDetailsResponse(value)).toThrow(
        OmdbResponseError,
      );
    },
  );

  it.each([
    { Response: true },
    { Response: 'False' },
    { Response: 'False', Error: '' },
    { Response: 'False', Error: 123 },
    { Response: 'False', Error: 'N/A' },
  ])(
    'rejects malformed response discriminators/errors: %p',
    (value) => {
      expect(() => parseOmdbSearchResponse(value)).toThrow(
        OmdbResponseError,
      );

      expect(() => parseOmdbDetailsResponse(value)).toThrow(
        OmdbResponseError,
      );
    },
  );

  it.each([
    { Response: 'True', totalResults: '1' },
    { Response: 'True', Search: {}, totalResults: '1' },
    { Response: 'True', Search: [summary] },
    { Response: 'True', Search: [summary], totalResults: 1 },
    { Response: 'True', Search: [summary], totalResults: '-1' },
    { Response: 'True', Search: [summary], totalResults: '1.5' },
    {
      Response: 'True',
      Search: [summary],
      totalResults: '9007199254740992',
    },
  ])('rejects malformed Search fields: %p', (value) => {
    expect(() => parseOmdbSearchResponse(value)).toThrow(
      OmdbResponseError,
    );
  });

  it.each([
    { imdbID: undefined },
    { imdbID: 'invalid' },
    { imdbID: 'tt123' },
    { Title: undefined },
    { Title: ' ' },
    { Title: 'N/A' },
    { Title: 12 },
    { Type: undefined },
    { Type: 'game' },
  ])('rejects missing/malformed identity fields: %p', (fields) => {
    const item = { ...summary, ...fields };

    expect(() => parseOmdbSearchResponse(search(item))).toThrow(
      OmdbResponseError,
    );

    expect(() =>
      parseOmdbDetailsResponse({ ...item, Response: 'True' }),
    ).toThrow(OmdbResponseError);
  });
});

describe('domain mapping', () => {
  it('maps mixed media without filtering episodes or requiring a type filter', () => {
    const items = ['movie', 'series', 'episode'].map((Type) => ({
      ...summary,
      Type,
    }));
    expect(
      mapOmdbSearchResponse({
        Response: 'True',
        Search: items,
        totalResults: '30',
      }),
    ).toEqual({
      items: items.map((item) => ({
        id: item.imdbID,
        title: item.Title,
        type: item.Type,
        year: '1999',
        posterUrl: item.Poster,
      })),
      totalResults: 30,
    });
  });

  it('maps a genuine empty success without treating failures as empty results', () => {
    expect(
      mapOmdbSearchResponse({
        Response: 'True',
        Search: [],
        totalResults: '0',
      }),
    ).toEqual({ items: [], totalResults: 0 });
  });

  it.each([mapOmdbSearchResponse, mapOmdbDetailsResponse])(
    'surfaces API errors from %p',
    (map) => {
      expect(() =>
        map({ Response: 'False', Error: 'Request limit reached!' }),
      ).toThrow(
        new OmdbResponseError('api', 'Request limit reached!'),
      );

      let error: unknown;

      try {
        map(omdbInvalidKeyFailure);
      } catch (caught) {
        error = caught;
      }

      expect(error).toBeInstanceOf(OmdbResponseError);
      expect(error).toMatchObject({
        kind: 'api',
        message: omdbInvalidKeyFailure.Error,
      });
    },
  );

  it('distinguishes malformed payload errors from API failures', () => {
    try {
      mapOmdbDetailsResponse(null);
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(OmdbResponseError);
      if (!(error instanceof OmdbResponseError)) throw error;
      expect(error.kind).toBe('invalid-response');
    }
  });

  it.each([
    '1999',
    '2008-2013',
    '2022-',
    '2008\u20132013',
    '2022\u2013',
  ])(
    'preserves single years and complete/open ranges: %s',
    (Year) => {
      expect(mapOmdbDetailsResponse({ ...details, Year }).year).toBe(
        Year,
      );
    },
  );

  it.each([undefined, null, 'N/A', '', 'unknown', '2008-20', 1999])(
    'normalizes unavailable/malformed years: %p',
    (Year) => {
      expect(
        mapOmdbDetailsResponse({ ...details, Year }).year,
      ).toBeNull();
    },
  );

  it.each([
    undefined,
    null,
    'N/A',
    '',
    'not-a-url',
    '/poster.jpg',
    'ftp://example.com/poster.jpg',
    'javascript:alert(1)',
    'https://user:password@example.com/poster.jpg',
    42,
  ])('normalizes unavailable/invalid poster URLs: %p', (Poster) => {
    expect(
      mapOmdbDetailsResponse({ ...details, Poster }).posterUrl,
    ).toBeNull();

    expect(
      mapOmdbSearchResponse(search({ ...summary, Poster })).items[0]
        ?.posterUrl,
    ).toBeNull();
  });

  it.each([
    'https://example.com/poster.jpg',
    'http://example.com/poster.jpg',
  ])('accepts absolute HTTP(S) poster URLs: %s', (Poster) => {
    expect(
      mapOmdbDetailsResponse({ ...details, Poster }).posterUrl,
    ).toBe(Poster);
  });

  it('maps movie details to domain metadata without retaining raw fields', () => {
    expect(mapOmdbDetailsResponse(details)).toEqual({
      id: 'tt0133093',
      title: 'The Matrix',
      type: 'movie',
      year: '1999',
      posterUrl: 'https://example.com/matrix.jpg',
      plot: 'A programmer discovers a simulated reality.',
      genres: ['Action', 'Sci-Fi'],
      runtimeMinutes: 136,
      imdbRating: 8.7,
      totalSeasons: null,
    });
  });

  it('maps series season counts and preserves its year range', () => {
    const result = mapOmdbDetailsResponse({
      ...details,
      imdbID: 'tt0903747',
      Title: 'Breaking Bad',
      Type: 'series',
      Year: '2008-2013',
      totalSeasons: '5',
    });

    expect(result).toMatchObject({
      id: 'tt0903747',
      type: 'series',
      year: '2008-2013',
      totalSeasons: 5,
    });
  });

  it.each(['movie', 'episode'])(
    'does not expose season counts for %s',
    (Type) => {
      expect(
        mapOmdbDetailsResponse({
          ...details,
          Type,
          totalSeasons: '5',
        }).totalSeasons,
      ).toBeNull();
    },
  );

  it.each([undefined, null, 'N/A', '', 42, {}])(
    'normalizes missing and malformed optional metadata: %p',
    (value) => {
      expect(
        mapOmdbDetailsResponse({
          ...details,
          Type: 'series',
          Plot: value,
          Genre: value,
          Runtime: value,
          imdbRating: value,
          totalSeasons: value,
        }),
      ).toMatchObject({
        plot: null,
        genres: [],
        runtimeMinutes: null,
        imdbRating: null,
        totalSeasons: null,
      });
    },
  );

  it.each([
    '0 min',
    '-5 min',
    '120',
    '120 minutes',
    '9007199254740992 min',
  ])('rejects invalid runtimes: %s', (Runtime) => {
    expect(
      mapOmdbDetailsResponse({ ...details, Runtime }).runtimeMinutes,
    ).toBeNull();
  });

  it.each(['-1', '11', '8.7/10', 'Infinity', '0x8'])(
    'rejects invalid ratings: %s',
    (imdbRating) => {
      expect(
        mapOmdbDetailsResponse({ ...details, imdbRating }).imdbRating,
      ).toBeNull();
    },
  );

  it.each(['0', '-1', '1.5', 'five', '9007199254740992'])(
    'rejects invalid season counts: %s',
    (totalSeasons) => {
      expect(
        mapOmdbDetailsResponse({
          ...details,
          Type: 'series',
          totalSeasons,
        }).totalSeasons,
      ).toBeNull();
    },
  );
});
