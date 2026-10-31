import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  background: '#0B0F19',
  surface: '#161D2B',
  surfaceElevated: '#202A3B',
  accent: '#00BFA6',
  accentPressed: '#009B88',
  textPrimary: '#F4F6FA',
  textSecondary: '#9DAABD',
  border: '#303A4D',
  error: '#FF8585',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-rounded',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radii = {
  poster: 8,
  surface: 12,
  banner: 16,
} as const;

export const Sizing = {
  touchTarget: 48,
  mediaCardWidth: 144,
  posterAspectRatio: 2 / 3,
} as const;

export const Breakpoints = {
  tablet: 600,
  desktop: 1024,
} as const;

export const Typography = {
  fontWeights: {
    regular: 500,
    semibold: 600,
    bold: 700,
  },
  fontSizes: {
    small: 14,
    body: 16,
    title: { mobile: 36, desktop: 48 },
    subtitle: { mobile: 24, desktop: 32 },
    link: 14,
    code: 12,
  },
  lineHeights: {
    small: 20,
    body: 24,
    title: { mobile: 40, desktop: 52 },
    subtitle: { mobile: 32, desktop: 44 },
    link: 30,
  },
} as const;

export const MaxContentWidth = 1440;
