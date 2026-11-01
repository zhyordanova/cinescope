import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Sizing } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

import { DetailsPoster } from './DetailsPoster';

jest.mock('@/global.css', () => ({}));

jest.mock('expo-image', () => ({
  Image:
    jest.requireActual<typeof import('react-native')>('react-native')
      .View,
}));

afterEach(cleanup);

describe('DetailsPoster', () => {
  it('renders decorative blurred artwork, scrim, and accessible-safe poster', async () => {
    await render(
      <DetailsPoster
        posterUrl="https://example.com/poster.jpg"
        compact
      />,
    );

    const background = screen.getByTestId(
      'details-poster-background',
      { includeHiddenElements: true },
    );

    const scrim = screen.getByTestId('details-poster-scrim', {
      includeHiddenElements: true,
    });

    const poster = screen.getByTestId('details-poster', {
      includeHiddenElements: true,
    });

    expect(background.props.source).toEqual({
      uri: 'https://example.com/poster.jpg',
    });

    expect(background.props.blurRadius).toBe(2);
    expect(background.props.contentFit).toBe('cover');
    expect(background.props.cachePolicy).toBe('memory-disk');
    expect(background.props.accessible).toBe(false);
    expect(background.props['aria-hidden']).toBe(true);

    expect(scrim.props.pointerEvents).toBe('none');
    expect(scrim.props.accessibilityElementsHidden).toBe(true);
    expect(scrim.props.importantForAccessibility).toBe('no');

    expect(
      StyleSheet.flatten(scrim.props.style).backgroundColor,
    ).toBe('rgba(11, 15, 25, 0.64)');

    expect(poster.props.source).toEqual({
      uri: 'https://example.com/poster.jpg',
    });

    expect(poster.props.contentFit).toBe('contain');
    expect(poster.props.cachePolicy).toBe('memory-disk');
    expect(poster.props.accessible).toBe(false);
    expect(poster.props['aria-hidden']).toBe(true);
  });

  it.each([
    {
      compact: true,
      frameAspectRatio: 1.2,
      posterWidth: '55%',
    },
    {
      compact: false,
      frameAspectRatio: 1.12,
      posterWidth: 200,
    },
  ])(
    'uses the $compact poster dimensions',
    async ({ compact, frameAspectRatio, posterWidth }) => {
      await render(
        <DetailsPoster
          posterUrl="https://example.com/poster.jpg"
          compact={compact}
        />,
      );

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-poster-frame').props.style,
        ),
      ).toMatchObject({
        width: '100%',
        maxWidth: 400,
        aspectRatio: frameAspectRatio,
      });

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-poster', {
            includeHiddenElements: true,
          }).props.style,
        ),
      ).toMatchObject({
        width: posterWidth,
        aspectRatio: Sizing.posterAspectRatio,
      });
    },
  );

  it('shows a fallback when the poster URL is unavailable', async () => {
    await render(<DetailsPoster posterUrl={null} compact />);

    expect(
      screen.getByText(MEDIA_UI_MESSAGES.posterUnavailable),
    ).toBeTruthy();

    expect(
      screen.queryByTestId('details-poster-background', {
        includeHiddenElements: true,
      }),
    ).toBeNull();

    expect(
      screen.queryByTestId('details-poster', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });

  it('shows a fallback when the poster image fails to load', async () => {
    await render(
      <DetailsPoster
        posterUrl="https://example.com/poster.jpg"
        compact
      />,
    );

    await fireEvent(
      screen.getByTestId('details-poster', {
        includeHiddenElements: true,
      }),
      'error',
      { error: 'Image load failed' },
    );

    expect(
      screen.getByText(MEDIA_UI_MESSAGES.posterUnavailable),
    ).toBeTruthy();

    expect(
      screen.queryByTestId('details-poster-background', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
    
    expect(
      screen.queryByTestId('details-poster', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });
});
