import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { Platform, StyleSheet } from 'react-native';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native/pure';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import { CINESCOPE_SYMBOL } from '../constants/mediaAssets';
import { useResponsiveWidth } from '@/hooks/use-responsive-width';

import {
  CinematicBanner,
  getCinematicBannerArtwork,
} from './CinematicBanner';

jest.mock('@/global.css', () => ({}));
jest.mock('@/hooks/use-responsive-width', () => ({
  useResponsiveWidth: jest.fn(),
}));
jest.mock('expo-image', () => ({
  Image:
    jest.requireActual<typeof import('react-native')>('react-native')
      .View,
}));

beforeEach(() => {
  jest.mocked(useResponsiveWidth).mockReturnValue(390);
});

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

describe('CinematicBanner', () => {
  it('shows branded loading until the artwork is displayed', async () => {
    await render(<CinematicBanner />);

    expect(
      screen.getByRole('progressbar', {
        name: MEDIA_UI_MESSAGES.home.bannerLoading,
      }),
    ).toBeTruthy();

    expect(
      screen.getByTestId('cinematic-banner-symbol', {
        includeHiddenElements: true,
      }).props,
    ).toMatchObject({
      source: CINESCOPE_SYMBOL,
      defaultSource: CINESCOPE_SYMBOL,
      resizeMode: 'contain',
      accessible: false,
    });

    await fireEvent(
      screen.getByTestId('cinematic-banner-artwork', {
        includeHiddenElements: true,
      }),
      'display',
    );

    expect(
      screen.queryByTestId('cinematic-banner-placeholder'),
    ).toBeNull();

    expect(screen.queryByRole('progressbar')).toBeNull();

    expect(
      screen.getByText(MEDIA_UI_MESSAGES.home.bannerHeadline),
    ).toBeTruthy();
  });

  it('keeps branding without an endless loading message on artwork failure', async () => {
    await render(<CinematicBanner />);

    await fireEvent(
      screen.getByTestId('cinematic-banner-artwork', {
        includeHiddenElements: true,
      }),
      'error',
    );

    expect(
      screen.getByTestId('cinematic-banner-placeholder'),
    ).toBeTruthy();

    expect(screen.queryByRole('progressbar')).toBeNull();

    expect(
      screen.queryByText(MEDIA_UI_MESSAGES.home.bannerLoading),
    ).toBeNull();

    expect(
      screen.getByText(MEDIA_UI_MESSAGES.home.bannerSubtitle),
    ).toBeTruthy();
  });

  it('starts loading again when responsive artwork changes', async () => {
    const { rerender } = await render(<CinematicBanner />);

    await fireEvent(
      screen.getByTestId('cinematic-banner-artwork', {
        includeHiddenElements: true,
      }),
      'display',
    );

    jest.mocked(useResponsiveWidth).mockReturnValue(1440);
    await rerender(<CinematicBanner />);

    expect(screen.getByRole('progressbar')).toBeTruthy();

    expect(
      screen.getByTestId('cinematic-banner-artwork', {
        includeHiddenElements: true,
      }).props.source,
    ).toBe(getCinematicBannerArtwork(1440));
  });

  it('uses CSS minimum height on Web even before hydration', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    jest.mocked(useResponsiveWidth).mockReturnValue(0);
    await render(<CinematicBanner />);

    const banner = screen.getByTestId('cinematic-banner');

    expect(banner.props.dataSet).toEqual({ cinematicBanner: '' });

    expect(
      StyleSheet.flatten(banner.props.style).height,
    ).toBeUndefined();
    expect(
      StyleSheet.flatten(banner.props.style).minHeight,
    ).toBeUndefined();

    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it.each(['ios', 'android'] as const)(
    'keeps loading and error branding separate from copy in a growing layout on %s',
    async (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);
      await render(<CinematicBanner />);

      const banner = screen.getByTestId('cinematic-banner');

      expect(StyleSheet.flatten(banner.props.style)).toMatchObject({
        minHeight: 360,
      });

      expect(
        StyleSheet.flatten(banner.props.style).height,
      ).toBeUndefined();

      const expectSeparateLayout = () => {
        const placeholder = screen.getByTestId(
          'cinematic-banner-placeholder',
        );

        const copy = screen.getByTestId('cinematic-banner-copy');

        expect(placeholder.parent).toBe(copy.parent);

        expect(
          StyleSheet.flatten(placeholder.props.style),
        ).toMatchObject({
          flexGrow: 1,
          flexShrink: 0,
        });
        expect(
          StyleSheet.flatten(placeholder.props.style).position,
        ).toBeUndefined();
        expect(StyleSheet.flatten(copy.props.style).flexShrink).toBe(
          0,
        );

        expect(
          screen.getByRole('header', {
            name: MEDIA_UI_MESSAGES.home.bannerHeadline,
          }).props.allowFontScaling,
        ).not.toBe(false);
      };

      expectSeparateLayout();
      await fireEvent(
        screen.getByTestId('cinematic-banner-artwork', {
          includeHiddenElements: true,
        }),
        'error',
      );

      expectSeparateLayout();
      expect(screen.queryByRole('progressbar')).toBeNull();
    },
  );

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

    const expectTopAlignedCopy = () => {
      expect(StyleSheet.flatten(webBanner.props.style)).toMatchObject(
        {
          flexDirection: 'column-reverse',
          justifyContent: 'flex-end',
        },
      );
      expect(
        screen.getByTestId('cinematic-banner-copy'),
      ).toBeTruthy();
    };
    expectTopAlignedCopy();

    await fireEvent(
      screen.getByTestId('cinematic-banner-artwork', {
        includeHiddenElements: true,
      }),
      'error',
    );
    expectTopAlignedCopy();
    await fireEvent(
      screen.getByTestId('cinematic-banner-artwork', {
        includeHiddenElements: true,
      }),
      'display',
    );
    expectTopAlignedCopy();

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
});
