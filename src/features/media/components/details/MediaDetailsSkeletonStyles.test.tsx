import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import { MediaDetailsSkeletonStyles } from './MediaDetailsSkeletonStyles';

jest.mock('@/global.css', () => ({}));

afterEach(() => {
  jest.restoreAllMocks();
});

describe('MediaDetailsSkeletonStyles', () => {
  it('emits inline Web CSS for compact and desktop layouts', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const element = MediaDetailsSkeletonStyles();

    expect(element?.type).toBe('style');
    const css = element?.props.dangerouslySetInnerHTML.__html;
    const [compact, desktop] = css.split(
      '@media (min-width: 1024px)',
    );

    expect(compact).toContain(
      '[data-details-skeleton-layout] { flex-direction: column; gap: 12px; }',
    );
    expect(compact).toContain(
      '[data-details-skeleton-poster] { aspect-ratio: 1.2; }',
    );
    expect(compact).toContain(
      '[data-details-skeleton-foreground] { width: 55%; }',
    );
    expect(compact).toContain(
      '[data-details-skeleton-desktop-title] { display: none; }',
    );
    expect(desktop).toContain(
      '[data-details-skeleton-layout] { flex-direction: row; gap: 32px; align-items: flex-start; }',
    );
    expect(desktop).toContain(
      '[data-details-skeleton-left] { flex: 4; min-width: 0; gap: 16px; }',
    );
    expect(desktop).toContain(
      '[data-details-skeleton-right] { flex: 6; min-width: 0; padding-top: 8px; gap: 24px; }',
    );
    expect(desktop).toContain(
      '[data-details-skeleton-poster] { aspect-ratio: 1.12; }',
    );
    expect(desktop).toContain(
      '[data-details-skeleton-foreground] { width: 200px; }',
    );
    expect(desktop).toContain(
      '[data-details-skeleton-compact-title] { display: none; }',
    );
    expect(desktop).toContain(
      '[data-details-skeleton-desktop-title] { display: flex; }',
    );
  });

  it.each(['ios', 'android'] as const)(
    'emits no CSS on %s',
    (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);
      expect(MediaDetailsSkeletonStyles()).toBeNull();
    },
  );
});
