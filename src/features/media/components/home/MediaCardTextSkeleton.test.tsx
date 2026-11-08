import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { MediaCardTextSkeleton } from './MediaCardTextSkeleton';

jest.mock('@/global.css', () => ({}));

afterEach(async () => {
  await cleanup();
});

describe('MediaCardTextSkeleton', () => {
  it.each([
    { variant: 'title' as const, width: '85%', lineHeight: 20 },
    { variant: 'title' as const, width: '85%', lineHeight: 40 },
    { variant: 'year' as const, width: '35%', lineHeight: 20 },
    { variant: 'year' as const, width: '35%', lineHeight: 40 },
  ])(
    'renders the $variant bar at $lineHeight px',
    async ({ variant, width, lineHeight }) => {
      await render(
        <MediaCardTextSkeleton
          variant={variant}
          lineHeight={lineHeight}
        />,
      );

      const bar = screen.getByTestId(
        `media-card-skeleton-${variant}`,
        {
          includeHiddenElements: true,
        },
      );

      expect(StyleSheet.flatten(bar.props.style)).toMatchObject({
        width,
        height: lineHeight,
        borderRadius: Spacing.xs,
        backgroundColor: Colors.surfaceElevated,
      });

      expect(
        StyleSheet.flatten(bar.props.style).position,
      ).toBeUndefined();

      expect(bar.props).toMatchObject({
        accessible: false,
        'aria-hidden': true,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
      });

      expect(
        screen.queryByTestId(`media-card-skeleton-${variant}`),
      ).toBeNull();
    },
  );

  it.each(['title', 'year'] as const)(
    'positions the %s overlay without occupying text space',
    async (variant) => {
      await render(
        <MediaCardTextSkeleton
          variant={variant}
          lineHeight={20}
          overlay
        />,
      );

      expect(
        StyleSheet.flatten(
          screen.getByTestId(`media-card-skeleton-${variant}`, {
            includeHiddenElements: true,
          }).props.style,
        ),
      ).toMatchObject({
        position: 'absolute',
        top: 0,
        left: 0,
      });
    },
  );
});
