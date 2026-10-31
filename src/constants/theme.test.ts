import { describe, expect, it, jest } from '@jest/globals';

import {
  Breakpoints,
  Colors,
  MaxContentWidth,
  Radii,
  Sizing,
  Spacing,
  Typography,
} from './theme';

jest.mock('@/global.css', () => ({}));

describe('theme tokens', () => {
  it('defines the approved Midnight Teal palette', () => {
    expect(Colors).toEqual({
      background: '#0B0F19',
      surface: '#161D2B',
      surfaceElevated: '#202A3B',
      accent: '#00BFA6',
      accentPressed: '#009B88',
      textPrimary: '#F4F6FA',
      textSecondary: '#9DAABD',
      border: '#303A4D',
      error: '#FF8585',
    });
  });

  it('defines the spacing, radius, sizing, and responsive layout scales', () => {
    expect(Object.values(Spacing)).toEqual([
      4, 8, 12, 16, 24, 32, 48,
    ]);
    expect(Radii).toEqual({ poster: 8, surface: 12, banner: 16 });
    expect(Sizing.touchTarget).toBe(48);
    expect(Sizing.posterAspectRatio).toBe(2 / 3);
    expect(Breakpoints).toEqual({ tablet: 600, desktop: 1024 });
    expect(MaxContentWidth).toBe(1440);
  });

  it('defines typography sizes for mobile and desktop', () => {
    expect(Typography.fontWeights).toEqual({
      regular: 500,
      semibold: 600,
      bold: 700,
    });

    expect(Typography.fontSizes.title).toEqual({
      mobile: 36,
      desktop: 48,
    });

    expect(Typography.fontSizes.subtitle).toEqual({
      mobile: 24,
      desktop: 32,
    });
  });
});
