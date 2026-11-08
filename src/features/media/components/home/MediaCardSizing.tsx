import { Platform } from 'react-native';

import { Breakpoints } from '@/constants/theme';

export function getMediaCardWidth(width: number) {
  if (width < Breakpoints.tablet) {
    return Math.max(
      120,
      Math.min(160, Math.round((width - 32) * 0.4)),
    );
  }

  return width < Breakpoints.desktop ? 176 : 190;
}

const WEB_CARD_STYLES = `
[data-media-card-sizing] {
  width: clamp(120px, round(nearest, calc((100vw - 32px) * 0.4), 1px), 160px);
}
@media (min-width: ${Breakpoints.tablet}px) {
  [data-media-card-sizing] { width: ${getMediaCardWidth(Breakpoints.tablet)}px; }
}
@media (min-width: ${Breakpoints.desktop}px) {
  [data-media-card-sizing] { width: ${getMediaCardWidth(Breakpoints.desktop)}px; }
}
`;

export function MediaCardSizing() {
  return Platform.OS === 'web' ? (
    <style dangerouslySetInnerHTML={{ __html: WEB_CARD_STYLES }} />
  ) : null;
}
