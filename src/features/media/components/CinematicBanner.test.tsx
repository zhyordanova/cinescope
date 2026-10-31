import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Platform, StyleSheet } from 'react-native';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

import {
  CinematicBanner,
  getCinematicBannerArtwork,
  getCinematicBannerHeight,
} from './CinematicBanner';

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

describe('CinematicBanner', () => {
  it('renders the approved copy as accessible text and hides decorative artwork', async () => {
    await render(<CinematicBanner />);

    expect(
      screen.getByRole('header', {
        name: MEDIA_UI_MESSAGES.home.bannerHeadline,
      }),
    ).toBeTruthy();

    expect(
      screen.getByText(MEDIA_UI_MESSAGES.home.bannerSubtitle),
    ).toBeTruthy();

    const artwork = screen.getByTestId('cinematic-banner-artwork', {
      includeHiddenElements: true,
    });
    expect(artwork.props.accessibilityRole).toBe('none');
    expect(artwork.props.accessible).toBe(false);
    expect(artwork.props['aria-hidden']).toBe(true);
    expect(artwork.props.accessibilityElementsHidden).toBe(true);
    expect(artwork.props.importantForAccessibility).toBe('no');
    expect(artwork.props.contentFit).toBe('cover');
    expect(artwork.props.contentPosition).toBe('right top');
  });

  it('positions banner copy at the top on web and keeps it at the bottom on native', async () => {
    const nativeRender = await render(<CinematicBanner />);
    const nativeBanner = nativeRender.getByTestId('cinematic-banner');

    expect(
      StyleSheet.flatten(nativeBanner.props.style).justifyContent,
    ).toBe('flex-end');

    await cleanup();

    jest.replaceProperty(Platform, 'OS', 'web');

    const webRender = await render(<CinematicBanner />);
    const webBanner = webRender.getByTestId('cinematic-banner');

    expect(
      StyleSheet.flatten(webBanner.props.style).justifyContent,
    ).toBe('flex-start');
    
    expect(
      webRender.getByTestId('cinematic-banner-artwork', {
        includeHiddenElements: true,
      }).props.contentPosition,
    ).toBe('right center');
  });

  it('selects mobile and wide artwork at the approved responsive breakpoint', () => {
    expect(getCinematicBannerArtwork(390)).toBe(
      require('../../../../assets/CinematicBanner-mobile.png'),
    );
    expect(getCinematicBannerArtwork(600)).toBe(
      require('../../../../assets/CinematicBanner-web.png'),
    );
    expect(getCinematicBannerArtwork(1440)).toBe(
      require('../../../../assets/CinematicBanner-web.png'),
    );
  });

  it('keeps mobile and tablet banners compact and gives desktop artwork more height', () => {
    expect(getCinematicBannerHeight(390)).toBe(360);
    expect(getCinematicBannerHeight(768)).toBe(380);
    expect(getCinematicBannerHeight(1440)).toBe(600);
  });
});
