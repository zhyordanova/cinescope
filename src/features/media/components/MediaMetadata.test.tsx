import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  within,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

import { MediaMetadata } from './MediaMetadata';

jest.mock('@/global.css', () => ({}));

jest.mock('expo-symbols', () => ({
  SymbolView:
    jest.requireActual<typeof import('react-native')>('react-native')
      .View,
}));

afterEach(cleanup);

describe('MediaMetadata', () => {
  it('renders movie metadata, accessible icon labels, and genres', async () => {
    const { getByTestId, getByText } = await render(
      <MediaMetadata
        mediaType="movie"
        year="1999"
        runtimeMinutes={136}
        totalSeasons={null}
        genres={['Action', 'Sci-Fi']}
        compact
      />,
    );

    expect(getByTestId('details-media-type-chip')).toBeTruthy();

    const metadata = getByTestId('details-metadata');
    expect(StyleSheet.flatten(metadata.props.style)).toMatchObject({
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      width: '100%',
      gap: Spacing.md,
    });

    expect(getByText('1999')).toBeTruthy();

    expect(
      within(metadata).getByTestId('details-metadata-calendar').props
        .accessibilityLabel,
    ).toBe('1999');

    expect(
      within(metadata).getByTestId('details-metadata-clock').props
        .accessibilityLabel,
    ).toBe(MEDIA_UI_MESSAGES.details.runtime(136));

    expect(
      getByTestId('details-metadata-icon-calendar', {
        includeHiddenElements: true,
      }).props.tintColor,
    ).toBe(Colors.textSecondary);

    expect(
      getByTestId('details-metadata-icon-calendar', {
        includeHiddenElements: true,
      }).props.name,
    ).toEqual({
      ios: 'calendar',
      android: 'calendar_today',
      web: 'calendar_today',
    });

    expect(
      getByTestId('details-metadata-icon-clock', {
        includeHiddenElements: true,
      }).props.name,
    ).toEqual({
      ios: 'clock',
      android: 'schedule',
      web: 'schedule',
    });

    expect(
      getByText(MEDIA_UI_MESSAGES.details.runtime(136)),
    ).toBeTruthy();

    expect(getByText('Action · Sci-Fi')).toBeTruthy();

    const genresText = getByTestId('details-genres-text');

    expect(genresText.props.numberOfLines).toBeUndefined();
    expect(genresText.props.allowFontScaling).not.toBe(false);
    expect(StyleSheet.flatten(genresText.props.style).textAlign).toBe(
      'left',
    );
  });

  it.each([
    ['series', true],
    ['movie', false],
    ['episode', false],
  ] as const)(
    'shows seasons only for a series (%s)',
    async (mediaType, showsSeasons) => {
      const { getByTestId, getByText, queryByTestId, queryByText } =
        await render(
          <MediaMetadata
            mediaType={mediaType}
            year={null}
            runtimeMinutes={null}
            totalSeasons={5}
            genres={[]}
            compact={false}
          />,
        );

      if (showsSeasons) {
        const seasons = MEDIA_UI_MESSAGES.details.seasons(5);

        expect(getByText(seasons)).toBeTruthy();

        expect(
          getByTestId('details-metadata-tv').props.accessibilityLabel,
        ).toBe(seasons);

        expect(
          getByTestId('details-metadata-icon-tv', {
            includeHiddenElements: true,
          }).props.tintColor,
        ).toBe(Colors.textSecondary);

        expect(
          getByTestId('details-metadata-icon-tv', {
            includeHiddenElements: true,
          }).props.name,
        ).toEqual({
          ios: 'tv',
          android: 'tv',
          web: 'tv',
        });
      } else {
        expect(
          queryByText(MEDIA_UI_MESSAGES.details.seasons(5)),
        ).toBeNull();
        expect(queryByTestId('details-metadata')).toBeNull();
      }
    },
  );

  it('uses the standard metadata spacing outside compact layouts', async () => {
    const { getByTestId } = await render(
      <MediaMetadata
        mediaType="movie"
        year="1999"
        runtimeMinutes={null}
        totalSeasons={null}
        genres={[]}
        compact={false}
      />,
    );

    expect(
      StyleSheet.flatten(getByTestId('details-metadata').props.style)
        .gap,
    ).toBe(Spacing.sm);
  });

  it('omits metadata and genres when their values are unavailable', async () => {
    const { getByTestId, queryByTestId } = await render(
      <MediaMetadata
        mediaType="series"
        year={null}
        runtimeMinutes={null}
        totalSeasons={null}
        genres={[]}
        compact
      />,
    );

    expect(getByTestId('details-media-type-chip')).toBeTruthy();
    expect(queryByTestId('details-metadata')).toBeNull();
    expect(queryByTestId('details-genres')).toBeNull();
  });
});
