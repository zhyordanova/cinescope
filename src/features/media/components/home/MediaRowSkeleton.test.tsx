import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { Platform, StyleSheet } from 'react-native';
import * as ReactNative from 'react-native';

import {
  MaxContentWidth,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useResponsiveWidth } from '@/hooks/use-responsive-width';

import { MEDIA_UI_MESSAGES } from '../../constants/mediaUiMessages';

import { MediaRowSkeleton } from './MediaRowSkeleton';

jest.mock('@/global.css', () => ({}));
jest.mock('@/hooks/use-responsive-width', () => ({
  useResponsiveWidth: jest.fn(),
}));

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

describe('MediaRowSkeleton', () => {
  it.each([
    { width: 0, cardWidth: 120 },
    { width: 320, cardWidth: 120 },
    { width: 390, cardWidth: 143 },
    { width: 600, cardWidth: 176 },
    { width: 1440, cardWidth: 190 },
    { width: 1920, cardWidth: 190 },
  ])(
    'renders eight placeholders with matching card dimensions at $width px',
    async ({ width, cardWidth }) => {
      jest.replaceProperty(Platform, 'OS', 'ios');
      jest.mocked(useResponsiveWidth).mockReturnValue(width);

      await render(<MediaRowSkeleton title="Test collection" />);

      const cards = screen.getAllByTestId('media-card-skeleton', {
        includeHiddenElements: true,
      });

      expect(cards).toHaveLength(8);

      if (width > 0) {
        expect(
          cards.length * cardWidth + (cards.length - 1) * Spacing.sm,
        ).toBeGreaterThanOrEqual(
          Math.min(width, MaxContentWidth) - Spacing.lg * 2,
        );
      }

      for (const card of cards) {
        expect(StyleSheet.flatten(card.props.style).width).toBe(
          cardWidth,
        );
      }
    },
  );

  it('announces one loading state without exposing decorative cards or controls', async () => {
    jest.mocked(useResponsiveWidth).mockReturnValue(390);

    await render(<MediaRowSkeleton title="Test collection" />);

    expect(screen.getByRole('header').props.children).toBe(
      'Test collection',
    );

    expect(
      screen.getByRole('progressbar', {
        name: MEDIA_UI_MESSAGES.collection.loading('Test collection'),
      }).props,
    ).toMatchObject({
      accessibilityState: { busy: true },
      accessibilityLiveRegion: 'polite',
    });

    expect(
      screen.queryAllByTestId('media-card-skeleton'),
    ).toHaveLength(0);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('keeps the same cards from hydration through resize and clips overflow without scrolling', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    jest.mocked(useResponsiveWidth).mockReturnValue(0);

    const { rerender } = await render(
      <MediaRowSkeleton title="Test collection" />,
    );

    const viewport = screen.getByTestId('media-row-skeleton');

    expect(StyleSheet.flatten(viewport.props.style)).toMatchObject({
      width: '100%',
      overflow: 'hidden',
    });

    expect(viewport.props.onLayout).toBeUndefined();
    expect(viewport.props.onScroll).toBeUndefined();

    for (const width of [1440, 390, 600]) {
      jest.mocked(useResponsiveWidth).mockReturnValue(width);
      await rerender(<MediaRowSkeleton title="Test collection" />);

      const cards = screen.getAllByTestId('media-card-skeleton', {
        includeHiddenElements: true,
      });

      expect(cards).toHaveLength(8);
    }
  });

  it('reserves one scaled line each for the title and year', async () => {
    jest.mocked(useResponsiveWidth).mockReturnValue(390);
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 2,
    });

    await render(<MediaRowSkeleton title="Test collection" />);

    for (const part of ['title', 'year']) {
      expect(
        StyleSheet.flatten(
          screen.getAllByTestId(`media-card-skeleton-${part}`, {
            includeHiddenElements: true,
          })[0]!.props.style,
        ).height,
      ).toBe(Typography.lineHeights.small * 2);
    }
  });
});
