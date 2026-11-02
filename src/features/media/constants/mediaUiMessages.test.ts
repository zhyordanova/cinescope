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

    expect(MEDIA_UI_MESSAGES.collection.errorTitle).toBe(
      "Couldn't load this collection",
    );
    
    expect(MEDIA_UI_MESSAGES.collection.errorDescription).toBe(
      'Something went wrong while loading these titles.',
    );

    expect(MEDIA_UI_MESSAGES.collection.retry('Holiday Magic')).toBe(
      'Try Again: Holiday Magic',
    );

    expect(
      MEDIA_UI_MESSAGES.collection.retrying('Holiday Magic'),
    ).toBe('Trying Again: Holiday Magic…');
  });

  it('formats Details metadata, including units', () => {
    expect(MEDIA_UI_MESSAGES.details.goHome).toBe(
      'CineScope — Go to Home',
    );

    expect(MEDIA_UI_MESSAGES.details.year('2022–')).toBe('2022–');

    expect(MEDIA_UI_MESSAGES.details.runtime(136)).toBe('136 min');

    expect(MEDIA_UI_MESSAGES.details.seasons(3)).toBe('Seasons: 3');
  });
});
