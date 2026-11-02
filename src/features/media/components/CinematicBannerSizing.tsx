import { Platform } from 'react-native';

import { Breakpoints } from '@/constants/theme';

export function getCinematicBannerHeight(width: number) {
  return width < Breakpoints.tablet
    ? 360
    : width < Breakpoints.desktop
      ? 380
      : 600;
}

const WEB_BANNER_STYLES = `
[data-cinematic-banner] { height: ${getCinematicBannerHeight(0)}px; }
@media (min-width: ${Breakpoints.tablet}px) {
  [data-cinematic-banner] { height: ${getCinematicBannerHeight(Breakpoints.tablet)}px; }
}
@media (min-width: ${Breakpoints.desktop}px) {
  [data-cinematic-banner] { height: ${getCinematicBannerHeight(Breakpoints.desktop)}px; }
}
`;

export function CinematicBannerSizing() {
  return Platform.OS === 'web' ? (
    <style dangerouslySetInnerHTML={{ __html: WEB_BANNER_STYLES }} />
  ) : null;
}
