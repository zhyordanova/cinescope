import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native/pure';

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
});

describe('MediaCard', () => {
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
      screen.getByText(MEDIA_UI_MESSAGES.posterUnavailable),
    ).toBeTruthy();
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
      screen.queryByText(MEDIA_UI_MESSAGES.posterUnavailable),
    ).toBeNull();

    await fireEvent(image, 'error', { error: 'Image load failed' });

    expect(screen.queryByTestId('media-poster')).toBeNull();
    expect(
      screen.getByText(MEDIA_UI_MESSAGES.posterUnavailable),
    ).toBeTruthy();
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
      screen.queryByText(MEDIA_UI_MESSAGES.posterUnavailable),
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
