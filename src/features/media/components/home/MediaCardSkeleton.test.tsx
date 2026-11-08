import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { Platform, StyleSheet } from 'react-native';

import { Colors, Radii, Sizing, Spacing } from '@/constants/theme';

import { MediaCardSkeleton } from './MediaCardSkeleton';

jest.mock('@/global.css', () => ({}));

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

describe('MediaCardSkeleton', () => {
  it.each(['ios', 'android'] as const)(
    'uses the supplied width and card spacing on %s',
    async (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);
      await render(
        <MediaCardSkeleton cardWidth={176} lineHeight={20} />,
      );

      expect(
        StyleSheet.flatten(
          screen.getByTestId('media-card-skeleton').props.style,
        ),
      ).toMatchObject({
        width: 176,
        gap: Spacing.xs,
        flexShrink: 0,
      });
    },
  );

  it('matches poster proportions and themed colors', async () => {
    await render(
      <MediaCardSkeleton cardWidth={143} lineHeight={20} />,
    );

    expect(
      StyleSheet.flatten(
        screen.getByTestId('media-card-skeleton-poster').props.style,
      ),
    ).toMatchObject({
      width: '100%',
      aspectRatio: Sizing.posterAspectRatio,
      borderRadius: Radii.poster,
      backgroundColor: Colors.surface,
      marginBottom: Spacing.xs,
    });
  });

  it.each([20, 40])(
    'uses the supplied %i px line height for title and year',
    async (lineHeight) => {
      await render(
        <MediaCardSkeleton cardWidth={143} lineHeight={lineHeight} />,
      );

      for (const variant of ['title', 'year']) {
        expect(
          StyleSheet.flatten(
            screen.getByTestId(`media-card-skeleton-${variant}`, {
              includeHiddenElements: true,
            }).props.style,
          ),
        ).toMatchObject({
          height: lineHeight,
        });
      }
    },
  );

  it('uses the shared CSS sizing attribute without an inline Web width', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    await render(
      <MediaCardSkeleton cardWidth={120} lineHeight={20} />,
    );

    const card = screen.getByTestId('media-card-skeleton');

    expect(card.props.dataSet).toEqual({ mediaCardSizing: '' });

    expect(
      StyleSheet.flatten(card.props.style).width,
    ).toBeUndefined();
  });
});
