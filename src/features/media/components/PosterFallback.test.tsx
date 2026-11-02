import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Colors, Radii, Sizing } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

import { PosterFallback } from './PosterFallback';

jest.mock('@/global.css', () => ({}));
jest.mock('expo-image', () => ({
  Image:
    jest.requireActual<typeof import('react-native')>('react-native')
      .View,
}));

afterEach(cleanup);

describe('PosterFallback', () => {
  it('can be decorative inside an accessible media card', async () => {
    await render(<PosterFallback accessible={false} />);

    expect(screen.queryAllByRole('image')).toHaveLength(0);

    const fallback = screen.getByTestId('poster-fallback', {
      includeHiddenElements: true,
    });

    expect(fallback.props.accessible).toBe(false);
    expect(fallback.props['aria-hidden']).toBe(true);
    expect(fallback.props.accessibilityElementsHidden).toBe(true);
    expect(fallback.props.importantForAccessibility).toBe(
      'no-hide-descendants',
    );
  });

  it('renders the branded symbol in a Midnight Teal 2:3 poster', async () => {
    await render(<PosterFallback />);

    const fallback = screen.getByRole('image', {
      name: MEDIA_UI_MESSAGES.posterUnavailable,
    });

    expect(StyleSheet.flatten(fallback.props.style)).toMatchObject({
      width: '100%',
      aspectRatio: Sizing.posterAspectRatio,
      backgroundColor: Colors.surface,
      borderRadius: Radii.poster,
      alignItems: 'center',
      justifyContent: 'center',
    });

    const symbol = screen.getByTestId('poster-fallback-symbol', {
      includeHiddenElements: true,
    });

    expect(symbol.props.source).toEqual(
      require('../../../../assets/cinescope-symbol.png'),
    );

    expect(symbol.props.contentFit).toBe('contain');
    expect(symbol.props.accessible).toBe(false);
    expect(symbol.props['aria-hidden']).toBe(true);

    expect(StyleSheet.flatten(symbol.props.style)).toMatchObject({
      width: '60%',
      aspectRatio: 1,
    });

    expect(screen.getAllByRole('image')).toHaveLength(1);
  });

  it('accepts a contextual accessible label and caller sizing', async () => {
    await render(
      <PosterFallback
        accessibilityLabel="The Matrix: Poster unavailable"
        style={{ width: 144 }}
      />,
    );

    const fallback = screen.getByRole('image', {
      name: 'The Matrix: Poster unavailable',
    });

    expect(StyleSheet.flatten(fallback.props.style)).toMatchObject({
      width: 144,
      aspectRatio: Sizing.posterAspectRatio,
    });
  });

  it.each([
    { width: 40, height: 60, labelHeight: 60, opacity: 0 },
    { width: 144, height: 216, labelHeight: 40, opacity: 1 },
    { width: 144, height: 216, labelHeight: 120, opacity: 0 },
    { width: 144, height: 216, labelHeight: 105.6, opacity: 1 },
    { width: 144, height: 216, labelHeight: 106, opacity: 0 },
  ])(
    'uses label opacity $opacity for $width x $height with $labelHeight px text',
    async ({ width, height, labelHeight, opacity }) => {
      await render(<PosterFallback />);

      await fireEvent(
        screen.getByTestId('poster-fallback'),
        'layout',
        {
          nativeEvent: { layout: { x: 0, y: 0, width, height } },
        },
      );

      const label = screen.getByTestId('poster-fallback-label', {
        includeHiddenElements: true,
      });

      await fireEvent(label, 'layout', {
        nativeEvent: {
          layout: { x: 0, y: 0, width, height: labelHeight },
        },
      });

      expect(StyleSheet.flatten(label.props.style).opacity).toBe(
        opacity,
      );

      if (opacity === 1) {
        expect(
          StyleSheet.flatten(
            screen.getByTestId('poster-fallback').props.style,
          ),
        ).toMatchObject({
          justifyContent: 'center',
          gap: 8,
        });

        expect(
          StyleSheet.flatten(label.props.style).position,
        ).toBeUndefined();
        expect(StyleSheet.flatten(label.props.style).flexShrink).toBe(
          0,
        );
      }

      expect(StyleSheet.flatten(label.props.style).color).toBe(
        Colors.textSecondary,
      );

      expect(label.props.allowFontScaling).not.toBe(false);
      expect(label.props.numberOfLines).toBeUndefined();
      expect(screen.getAllByRole('image')).toHaveLength(1);
    },
  );

  it('updates label visibility after resizing and text scaling', async () => {
    await render(<PosterFallback />);

    const fallback = screen.getByTestId('poster-fallback');
    const label = screen.getByTestId('poster-fallback-label', {
      includeHiddenElements: true,
    });

    await fireEvent(label, 'layout', {
      nativeEvent: {
        layout: { x: 0, y: 0, width: 128, height: 40 },
      },
    });

    await fireEvent(fallback, 'layout', {
      nativeEvent: {
        layout: { x: 0, y: 0, width: 144, height: 216 },
      },
    });

    expect(StyleSheet.flatten(label.props.style).opacity).toBe(1);

    await fireEvent(label, 'layout', {
      nativeEvent: {
        layout: { x: 0, y: 0, width: 128, height: 120 },
      },
    });

    expect(StyleSheet.flatten(label.props.style).opacity).toBe(0);

    await fireEvent(fallback, 'layout', {
      nativeEvent: {
        layout: { x: 0, y: 0, width: 300, height: 450 },
      },
    });
    
    expect(StyleSheet.flatten(label.props.style).opacity).toBe(1);
  });
});
