import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  within,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import type { MediaRating } from '../types/media.types';

import { CriticsRatings } from './CriticsRatings';

jest.mock('@/global.css', () => ({}));

jest.mock('expo-symbols', () => ({
  SymbolView:
    jest.requireActual<typeof import('react-native')>('react-native')
      .View,
}));

afterEach(cleanup);

describe('CriticsRatings', () => {
  it('renders available ratings with their source icons and scales', async () => {
    const ratings: MediaRating[] = [
      { source: 'IMDb', value: '8.7/10' },
      { source: 'Rotten Tomatoes', value: '88%' },
      { source: 'Metacritic', value: '73/100' },
    ];

    const { getByTestId, queryByRole } = await render(
      <CriticsRatings ratings={ratings} />,
    );

    const section = getByTestId('details-critics-ratings');

    expect(
      within(section).getByRole('header', {
        name: MEDIA_UI_MESSAGES.details.criticsRatingsTitle,
      }),
    ).toBeTruthy();

    const list = getByTestId('details-critic-ratings-list');

    expect(StyleSheet.flatten(list.props.style)).toMatchObject({
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'stretch',
      gap: Spacing.sm,
    });

    const cardStyle = {
      flexBasis: '30%',
      flexGrow: 0,
      flexShrink: 0,
      alignItems: 'center',
      minWidth: 88,
      maxWidth: 260,
      padding: Spacing.sm,
      backgroundColor: Colors.surface,
      borderColor: Colors.border,
    };

    for (const [sourceId, source, value, iconName, color] of [
      [
        'imdb',
        'IMDb',
        '8.7/10',
        { ios: 'star.fill', android: 'star', web: 'star' },
        Colors.ratingStar,
      ],
      [
        'rotten-tomatoes',
        'Rotten Tomatoes',
        '88%',
        {
          ios: 'rosette',
          android: 'award_star',
          web: 'award_star',
        },
        Colors.accent,
      ],
      [
        'metacritic',
        'Metacritic',
        '73/100',
        {
          ios: 'chart.bar',
          android: 'bar_chart',
          web: 'bar_chart',
        },
        Colors.accent,
      ],
    ] as const) {
      const card = within(section).getByTestId(
        `details-rating-card-${sourceId}`,
      );

      const icon = within(card).getByTestId(
        `details-rating-icon-${sourceId}`,
        { includeHiddenElements: true },
      );

      const sourceText = within(card).getByText(source);
      const valueText = within(card).getByText(value);

      expect(card).toBeTruthy();

      expect(StyleSheet.flatten(card.props.style)).toMatchObject(
        cardStyle,
      );

      expect(icon.props.name).toEqual(iconName);
      expect(icon.props.size).toBe(14);
      expect(icon.props.tintColor).toBe(color);
      expect(icon.props.accessible).toBe(false);

      expect(
        StyleSheet.flatten(sourceText.props.style),
      ).toMatchObject({
        color: Colors.textSecondary,
        minWidth: 0,
        textAlign: 'center',
      });

      expect(StyleSheet.flatten(valueText.props.style)).toMatchObject(
        {
          color: Colors.textPrimary,
          flexShrink: 1,
          minWidth: 0,
          textAlign: 'center',
        },
      );
    }

    expect(Colors.ratingStar).toBe('#F6BA54');

    expect(
      queryByRole('button', {
        name: /IMDb|Rotten Tomatoes|Metacritic/,
      }),
    ).toBeNull();
  });

  it.each([
    {
      ratings: [
        { source: 'Rotten Tomatoes', value: '88%' },
      ] satisfies MediaRating[],
      expectedTestId: 'details-rating-card-rotten-tomatoes',
      expectedValue: '88%',
    },
    {
      ratings: [
        { source: 'IMDb', value: '8.7/10' },
      ] satisfies MediaRating[],
      expectedTestId: 'details-rating-card-imdb',
      expectedValue: '8.7/10',
    },
  ])(
    'renders only the available rating without placeholders',
    async ({ ratings, expectedTestId, expectedValue }) => {
      const { getByTestId } = await render(
        <CriticsRatings ratings={ratings} />,
      );

      const section = getByTestId('details-critics-ratings');

      expect(
        within(section).getByTestId(expectedTestId),
      ).toBeTruthy();

      expect(within(section).getByText(expectedValue)).toBeTruthy();
      
      expect(
        within(section).queryAllByTestId(/details-rating-card-/),
      ).toHaveLength(1);
    },
  );

  it('hides the section when no ratings are available', async () => {
    const { queryByTestId } = await render(
      <CriticsRatings ratings={[]} />,
    );

    expect(queryByTestId('details-critics-ratings')).toBeNull();
  });
});
