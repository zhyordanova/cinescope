import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { Platform, StyleSheet } from 'react-native';

import { Breakpoints, Colors } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

import { HomeLogoLink } from './HomeLogoLink';

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

describe('HomeLogoLink', () => {
  it('links to Home and shows keyboard focus', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    await render(<HomeLogoLink width={1200} />);

    const homeLink = screen.getByRole('link', {
      name: MEDIA_UI_MESSAGES.details.goHome,
    });

    expect(homeLink.props.href).toBe('/');

    await fireEvent(homeLink, 'focus');
    expect(StyleSheet.flatten(homeLink.props.style).borderColor).toBe(
      Colors.accent,
    );

    await fireEvent(homeLink, 'blur');
    expect(StyleSheet.flatten(homeLink.props.style).borderColor).toBe(
      'transparent',
    );
  });

  it.each([
    { width: Breakpoints.tablet - 1, logoWidth: 112 },
    { width: Breakpoints.tablet, logoWidth: 144 },
  ])(
    'uses a $logoWidth px logo at $width px',
    async ({ width, logoWidth }) => {
      jest.replaceProperty(Platform, 'OS', 'web');

      await render(<HomeLogoLink width={width} />);

      const logo = screen.getByTestId('home-link-logo', {
        includeHiddenElements: true,
      });

      expect(StyleSheet.flatten(logo.props.style)).toMatchObject({
        width: logoWidth,
        aspectRatio: 1448 / 1086,
      });

      expect(logo.props.accessible).toBe(false);
      expect(logo.props['aria-hidden']).toBe(true);
    },
  );
});
