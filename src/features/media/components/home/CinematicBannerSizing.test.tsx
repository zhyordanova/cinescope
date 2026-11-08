import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import {
  CinematicBannerSizing,
  getCinematicBannerHeight,
} from './CinematicBannerSizing';

jest.mock('@/global.css', () => ({}));

afterEach(() => {
  jest.restoreAllMocks();
});

describe('CinematicBannerSizing', () => {
  it.each([
    { width: 0, expected: 360 },
    { width: 390, expected: 360 },
    { width: 599, expected: 360 },
    { width: 600, expected: 380 },
    { width: 768, expected: 380 },
    { width: 1023, expected: 380 },
    { width: 1024, expected: 600 },
    { width: 1440, expected: 600 },
  ])('returns $expected px at $width px', ({ width, expected }) => {
    expect(getCinematicBannerHeight(width)).toBe(expected);
  });

  it('emits inline Web CSS with minimum heights that allow content to grow', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const element = CinematicBannerSizing();

    expect(element?.type).toBe('style');

    const css = element?.props.dangerouslySetInnerHTML.__html;

    expect(css).toContain(
      '[data-cinematic-banner] { min-height: 360px; }',
    );

    expect(css).toContain(
      '@media (min-width: 600px) {\n  [data-cinematic-banner] { min-height: 380px; }',
    );

    expect(css).toContain(
      '@media (min-width: 1024px) {\n  [data-cinematic-banner] { min-height: 600px; }',
    );
  });

  it.each(['ios', 'android'] as const)(
    'emits no CSS on %s',
    (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);
      expect(CinematicBannerSizing()).toBeNull();
    },
  );
});
