import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { Colors, Spacing, Typography } from '@/constants/theme';

import {
  MEDIA_TYPE_LABELS,
  MEDIA_UI_MESSAGES,
} from '../constants/mediaUiMessages';
import {
  movieSummary,
  seriesSummary,
} from '../test-utils/mediaFixtures';

import { MediaCard } from './MediaCard';

jest.mock('@/global.css', () => ({}));
jest.mock('expo-image', () => ({
  Image:
    jest.requireActual<typeof import('react-native')>('react-native')
      .View,
}));

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

describe('MediaCard', () => {
  it('hides metadata visually without removing text space or accessible navigation', async () => {
    const onPress = jest.fn();

    const { rerender } = await render(
      <MediaCard
        media={movieSummary}
        onPress={onPress}
        showMetadata={false}
      />,
    );

    expect(
      screen.queryByTestId('media-type-badge', {
        includeHiddenElements: true,
      }),
    ).toBeNull();

    expect(
      StyleSheet.flatten(
        screen.getByText(movieSummary.title, {
          includeHiddenElements: true,
        }).props.style,
      ),
    ).toMatchObject({ opacity: 0 });

    for (const variant of ['title', 'year']) {
      expect(
        StyleSheet.flatten(
          screen.getByTestId(`media-card-skeleton-${variant}`, {
            includeHiddenElements: true,
          }).props.style,
        ),
      ).toMatchObject({
        height:
          Typography.lineHeights.small *
          Dimensions.get('window').fontScale,
        position: 'absolute',
      });
    }

    expect(
      screen.getByTestId('poster-fallback', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.openMedia(
          movieSummary.title,
          movieSummary.type,
          movieSummary.year,
        ),
      }),
    );

    expect(onPress).toHaveBeenCalledTimes(1);

    await rerender(
      <MediaCard media={movieSummary} onPress={onPress} />,
    );

    expect(
      screen.queryByTestId('media-card-skeleton-title', {
        includeHiddenElements: true,
      }),
    ).toBeNull();

    expect(
      screen.queryByTestId('media-card-skeleton-year', {
        includeHiddenElements: true,
      }),
    ).toBeNull();

    expect(
      screen.getByTestId('media-type-badge', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    expect(
      StyleSheet.flatten(
        screen.getByText(movieSummary.title).props.style,
      ).opacity,
    ).not.toBe(0);
  });

  it('shows hover and keyboard-focus feedback on web', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    await render(
      <MediaCard media={movieSummary} onPress={jest.fn()} />,
    );

    const card = screen.getByTestId('media-card');

    expect(card.props.dataSet).toEqual({ mediaCardSizing: '' });

    expect(
      StyleSheet.flatten(card.props.style).width,
    ).toBeUndefined();

    await fireEvent(card, 'hoverIn');

    const hoveredCard = screen.getByTestId('media-card');

    expect(StyleSheet.flatten(hoveredCard.props.style).opacity).toBe(
      0.9,
    );

    await fireEvent(card, 'focus');

    const focusRing = screen.getByTestId('media-card-focus-ring');

    expect(StyleSheet.flatten(focusRing.props.style)).toMatchObject({
      borderColor: Colors.accent,
      borderWidth: 2,
    });

    await fireEvent(card, 'blur');

    expect(screen.queryByTestId('media-card-focus-ring')).toBeNull();
  });

  it.each([
    { media: movieSummary, label: MEDIA_TYPE_LABELS.movie },
    { media: seriesSummary, label: MEDIA_TYPE_LABELS.series },
  ])(
    'renders metadata and the visible $label label',
    async ({ media, label }) => {
      await render(<MediaCard media={media} onPress={jest.fn()} />);

      expect(screen.getByText(media.title)).toBeTruthy();
      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.getByText(media.year!)).toBeTruthy();

      const badge = screen.getByTestId('media-type-badge');

      expect(badge.props.pointerEvents).toBe('none');

      expect(StyleSheet.flatten(badge.props.style)).toMatchObject({
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
      });

      expect(
        screen.getByRole('button', {
          name: MEDIA_UI_MESSAGES.openMedia(
            media.title,
            media.type,
            media.year,
          ),
        }),
      ).toBeTruthy();
    },
  );

  it('calls the parent callback when pressed', async () => {
    const onPress = jest.fn();

    await render(
      <MediaCard media={movieSummary} onPress={onPress} />,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omits unavailable years and provides a missing-poster fallback', async () => {
    await render(
      <MediaCard
        media={{ ...movieSummary, year: null }}
        onPress={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.openMedia(
          movieSummary.title,
          movieSummary.type,
          null,
        ),
      }),
    ).toBeTruthy();

    expect(screen.queryByText('1999')).toBeNull();
    expect(screen.queryByTestId('media-poster')).toBeNull();

    expect(
      screen.getByTestId('poster-fallback', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    expect(screen.queryAllByRole('image')).toHaveLength(0);
    expect(screen.getByTestId('media-type-badge')).toBeTruthy();
  });

  it('uses a cached decorative image and replaces it on load failure', async () => {
    const posterUrl = 'https://example.com/poster.jpg';

    await render(
      <MediaCard
        media={{ ...movieSummary, posterUrl }}
        onPress={jest.fn()}
      />,
    );

    const image = screen.getByTestId('media-poster');

    expect(image.props.source).toEqual({ uri: posterUrl });
    expect(image.props.contentFit).toBe('cover');
    expect(image.props.cachePolicy).toBe('memory-disk');
    expect(image.props.accessible).toBe(false);
    expect(
      screen.queryByTestId('poster-fallback', {
        includeHiddenElements: true,
      }),
    ).toBeNull();

    await fireEvent(image, 'error', { error: 'Image load failed' });

    expect(screen.queryByTestId('media-poster')).toBeNull();

    expect(
      screen.getByTestId('poster-fallback', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    expect(screen.getByTestId('media-type-badge')).toBeTruthy();
  });

  it('resets a failed poster when the image URL changes', async () => {
    const oldPosterUrl = 'https://example.com/old.jpg';
    const newPosterUrl = 'https://example.com/new.jpg';

    const view = await render(
      <MediaCard
        media={{
          ...movieSummary,
          posterUrl: oldPosterUrl,
        }}
        onPress={jest.fn()}
      />,
    );

    await fireEvent(screen.getByTestId('media-poster'), 'error', {
      error: 'Image load failed',
    });

    await view.rerender(
      <MediaCard
        media={{
          ...movieSummary,
          posterUrl: newPosterUrl,
        }}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByTestId('media-poster').props.source).toEqual({
      uri: newPosterUrl,
    });

    expect(
      screen.queryByTestId('poster-fallback', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });

  it('keeps long titles accessible without disabling font scaling', async () => {
    const title = 'A very long title '.repeat(12).trim();
    await render(
      <MediaCard
        media={{ ...movieSummary, title }}
        onPress={jest.fn()}
      />,
    );

    const text = screen.getByText(title);

    expect(text.props.numberOfLines).toBe(2);
    expect(text.props.allowFontScaling).not.toBe(false);

    expect(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.openMedia(
          title,
          movieSummary.type,
          movieSummary.year,
        ),
      }),
    ).toBeTruthy();
  });
});
