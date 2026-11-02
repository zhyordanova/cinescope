import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { Platform, StyleSheet } from 'react-native';
import { Spacing, Typography } from '@/constants/theme';

import { DetailsPosterSkeleton } from './DetailsPosterSkeleton';

jest.mock('@/global.css', () => ({}));

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

describe('DetailsPosterSkeleton', () => {
  it('renders three rating cards and a full-width metadata row', async () => {
    await render(<DetailsPosterSkeleton fontScale={1} />);

    const ratings = screen.getAllByTestId(
      'details-skeleton-rating-card',
    );

    expect(ratings).toHaveLength(3);

    expect(StyleSheet.flatten(ratings[0]!.props.style)).toMatchObject(
      {
        flexBasis: '30%',
        minWidth: 88,
        padding: Spacing.sm,
        borderWidth: 1,
      },
    );

    expect(
      StyleSheet.flatten(
        screen.getByTestId('details-skeleton-metadata').props.style,
      ),
    ).toMatchObject({
      width: '100%',
      flexDirection: 'row',
    });
  });

  it.each(['ios', 'android'] as const)(
    'uses compact poster geometry on %s',
    async (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);

      await render(<DetailsPosterSkeleton fontScale={1} />);

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-skeleton-poster').props.style,
        ),
      ).toMatchObject({
        maxWidth: 400,
        aspectRatio: 1.2,
      });

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-skeleton-foreground').props
            .style,
        ),
      ).toMatchObject({
        width: '55%',
        aspectRatio: 2 / 3,
      });
    },
  );

  it('preserves Web selectors and leaves responsive dimensions to CSS', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');

    await render(<DetailsPosterSkeleton fontScale={1} />);

    const title = screen.getByTestId('details-skeleton-title');
    const poster = screen.getByTestId('details-skeleton-poster');
    const foreground = screen.getByTestId(
      'details-skeleton-foreground',
    );

    expect(title.parent!.props.dataSet).toEqual({
      detailsSkeletonLeft: '',
    });

    expect(title.props.dataSet).toEqual({
      detailsSkeletonCompactTitle: '',
    });

    expect(poster.props.dataSet).toEqual({
      detailsSkeletonPoster: '',
    });

    expect(foreground.props.dataSet).toEqual({
      detailsSkeletonForeground: '',
    });

    expect(
      StyleSheet.flatten(poster.props.style).aspectRatio,
    ).toBeUndefined();

    expect(
      StyleSheet.flatten(foreground.props.style).width,
    ).toBeUndefined();
  });

  it.each([1, 2])(
    'uses supplied fontScale %i for title and badge heights',
    async (fontScale) => {
      await render(<DetailsPosterSkeleton fontScale={fontScale} />);

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-skeleton-title').props.style,
        ).height,
      ).toBe(Typography.lineHeights.subtitle.mobile * fontScale);

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-skeleton-badge').props.style,
        ).height,
      ).toBe(
        Typography.lineHeights.small * fontScale + Spacing.xs * 2 + 2,
      );
    },
  );
});
