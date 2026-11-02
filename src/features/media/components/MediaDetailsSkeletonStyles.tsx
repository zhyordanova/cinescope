import { Platform } from 'react-native';

import { Breakpoints, Spacing } from '@/constants/theme';

const WEB_STYLES = `
[data-details-skeleton-layout] { flex-direction: column; gap: ${Spacing.md}px; }
[data-details-skeleton-poster] { aspect-ratio: 1.2; }
[data-details-skeleton-desktop-title] { display: none; }
[data-details-skeleton-left] { gap: ${Spacing.md}px; }
[data-details-skeleton-right] { gap: ${Spacing.xxl}px; }
[data-details-skeleton-foreground] { width: 55%; }
@media (min-width: ${Breakpoints.desktop}px) {
  [data-details-skeleton-layout] { flex-direction: row; gap: ${Spacing.xxl}px; align-items: flex-start; }
  [data-details-skeleton-left] { flex: 4; min-width: 0; gap: ${Spacing.lg}px; }
  [data-details-skeleton-right] { flex: 6; min-width: 0; padding-top: ${Spacing.sm}px; gap: ${Spacing.xl}px; }
  [data-details-skeleton-poster] { aspect-ratio: 1.12; }
  [data-details-skeleton-foreground] { width: 200px; }
  [data-details-skeleton-compact-title] { display: none; }
  [data-details-skeleton-desktop-title] { display: flex; }
}
`;

export function MediaDetailsSkeletonStyles() {
  return Platform.OS === 'web' ? (
    <style dangerouslySetInnerHTML={{ __html: WEB_STYLES }} />
  ) : null;
}
