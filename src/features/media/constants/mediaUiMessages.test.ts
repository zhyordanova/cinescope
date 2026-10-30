import { describe, expect, it } from '@jest/globals';

import {
  MEDIA_TYPE_LABELS,
  MEDIA_UI_MESSAGES,
} from './mediaUiMessages';

describe('media UI messages', () => {
  it('labels every supported media type', () => {
    expect(MEDIA_TYPE_LABELS).toEqual({
      movie: 'Movie',
      series: 'Series',
      episode: 'Episode',
    });
  });

  it.each([
    {
      type: 'movie',
      year: '1999',
      expected: 'Open The Matrix, Movie, 1999',
    },
    {
      type: 'series',
      year: '2017–2020',
      expected: 'Open The Matrix, Series, 2017–2020',
    },
    {
      type: 'episode',
      year: null,
      expected: 'Open The Matrix, Episode',
    },
    { type: 'movie', year: null, expected: 'Open The Matrix, Movie' },
    {
      type: 'series',
      year: '2022–',
      expected: 'Open The Matrix, Series, 2022–',
    },
  ] as const)(
    'formats an accessible card label: $expected',
    ({ type, year, expected }) => {
      expect(
        MEDIA_UI_MESSAGES.openMedia('The Matrix', type, year),
      ).toBe(expected);
    },
  );

  it('formats collection navigation and lifecycle messages', () => {
    expect(MEDIA_UI_MESSAGES.previousTitles('Holiday Magic')).toBe(
      'Previous titles in Holiday Magic',
    );

    expect(MEDIA_UI_MESSAGES.nextTitles('Holiday Magic')).toBe(
      'Next titles in Holiday Magic',
    );

    expect(
      MEDIA_UI_MESSAGES.collection.loading('Holiday Magic'),
    ).toBe('Loading Holiday Magic…');

    expect(
      MEDIA_UI_MESSAGES.collection.error(
        'Holiday Magic',
        'Request failed.',
      ),
    ).toBe('Holiday Magic: Request failed.');

    expect(MEDIA_UI_MESSAGES.collection.retry('Holiday Magic')).toBe(
      'Retry Holiday Magic',
    );

    expect(
      MEDIA_UI_MESSAGES.collection.retrying('Holiday Magic'),
    ).toBe('Retrying Holiday Magic…');
  });

  it('formats Details metadata, including units and genre separators', () => {
    expect(MEDIA_UI_MESSAGES.details.imdbId('tt0133093')).toBe(
      'IMDb ID: tt0133093',
    );

    expect(MEDIA_UI_MESSAGES.details.year('2022–')).toBe(
      'Year: 2022–',
    );

    expect(
      MEDIA_UI_MESSAGES.details.genres(['Action', 'Sci-Fi']),
    ).toBe('Genres: Action, Sci-Fi');

    expect(MEDIA_UI_MESSAGES.details.genres([])).toBe('Genres: ');

    expect(MEDIA_UI_MESSAGES.details.runtime(136)).toBe(
      'Runtime: 136 min',
    );

    expect(MEDIA_UI_MESSAGES.details.imdbRating(8.7)).toBe(
      'IMDb rating: 8.7/10',
    );

    expect(MEDIA_UI_MESSAGES.details.seasons(3)).toBe('Seasons: 3');
  });
});
