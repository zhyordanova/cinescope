import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import {
  getMediaCardWidth,
  MediaCardSizing,
} from './MediaCardSizing';

jest.mock('@/global.css', () => ({}));

afterEach(() => {
  jest.restoreAllMocks();
});

describe('MediaCardSizing', () => {
  it.each([
    { width: 0, expected: 120 },
    { width: 320, expected: 120 },
    { width: 390, expected: 143 },
    { width: 599, expected: 160 },
    { width: 600, expected: 176 },
    { width: 1023, expected: 176 },
    { width: 1024, expected: 190 },
  ])('returns $expected px at $width px', ({ width, expected }) => {
    expect(getMediaCardWidth(width)).toBe(expected);
  });

  it('emits inline Web CSS with the approved widths and breakpoints', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const element = MediaCardSizing();

    expect(element?.type).toBe('style');

    const css = element?.props.dangerouslySetInnerHTML.__html;

    expect(css).toContain(
      'width: clamp(120px, round(nearest, calc((100vw - 32px) * 0.4), 1px), 160px);',
    );

    expect(css).toContain(
      '@media (min-width: 600px) {\n  [data-media-card-sizing] { width: 176px; }',
    );

    expect(css).toContain(
      '@media (min-width: 1024px) {\n  [data-media-card-sizing] { width: 190px; }',
    );
  });

  it.each(['ios', 'android'] as const)(
    'emits no CSS on %s',
    (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);
      expect(MediaCardSizing()).toBeNull();
    },
  );
});
