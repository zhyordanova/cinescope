import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import type { MediaType } from '../types/media.types';

import { MediaTypeBadge } from './MediaTypeBadge';
import type { PlatformSymbolNames } from './platformSymbol.types';

type MetadataIcon = 'calendar' | 'clock' | 'tv';

const METADATA_ICONS = {
  calendar: {
    ios: 'calendar',
    android: 'calendar_today',
    web: 'calendar_today',
  },
  clock: {
    ios: 'clock',
    android: 'schedule',
    web: 'schedule',
  },
  tv: {
    ios: 'tv',
    android: 'tv',
    web: 'tv',
  },
} as const satisfies Record<MetadataIcon, PlatformSymbolNames>;

function MetadataItem({
  icon,
  accessibilityLabel,
  children,
}: {
  icon: MetadataIcon;
  accessibilityLabel: string;
  children: string;
}) {
  return (
    <View
      testID={`details-metadata-${icon}`}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      style={styles.metadataItem}
    >
      <SymbolView
        testID={`details-metadata-icon-${icon}`}
        name={METADATA_ICONS[icon]}
        size={16}
        tintColor={Colors.textSecondary}
        accessible={false}
        aria-hidden
      />
      <ThemedText
        testID={`details-metadata-value-${icon}`}
        type="small"
        themeColor="textSecondary"
        accessible={false}
      >
        {children}
      </ThemedText>
    </View>
  );
}

export function MediaMetadata({
  mediaType,
  year,
  runtimeMinutes,
  totalSeasons,
  genres,
  compact,
}: {
  mediaType: MediaType;
  year: string | null;
  runtimeMinutes: number | null;
  totalSeasons: number | null;
  genres: string[];
  compact: boolean;
}) {
  const hasMetadata =
    year !== null ||
    runtimeMinutes !== null ||
    (mediaType === 'series' && totalSeasons !== null);

  return (
    <>
      <MediaTypeBadge mediaType={mediaType} variant="details" />
      {hasMetadata && (
        <View
          testID="details-metadata"
          style={[
            styles.metadataList,
            compact && styles.compactMetadataList,
          ]}
        >
          {year !== null && (
            <MetadataItem icon="calendar" accessibilityLabel={year}>
              {MEDIA_UI_MESSAGES.details.year(year)}
            </MetadataItem>
          )}
          {runtimeMinutes !== null && (
            <MetadataItem
              icon="clock"
              accessibilityLabel={MEDIA_UI_MESSAGES.details.runtime(
                runtimeMinutes,
              )}
            >
              {MEDIA_UI_MESSAGES.details.runtime(runtimeMinutes)}
            </MetadataItem>
          )}
          {mediaType === 'series' && totalSeasons !== null && (
            <MetadataItem
              icon="tv"
              accessibilityLabel={MEDIA_UI_MESSAGES.details.seasons(
                totalSeasons,
              )}
            >
              {MEDIA_UI_MESSAGES.details.seasons(totalSeasons)}
            </MetadataItem>
          )}
        </View>
      )}
      {genres.length > 0 && (
        <View testID="details-genres" style={styles.genres}>
          <ThemedText
            testID="details-genres-text"
            type="small"
            themeColor="textSecondary"
            style={styles.genresText}
          >
            {genres.join(' · ')}
          </ThemedText>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  metadataList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.sm,
    width: '100%',
  },
  compactMetadataList: {
    gap: Spacing.md,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  genres: {
    width: '100%',
    alignItems: 'flex-start',
  },
  genresText: {
    textAlign: 'left',
  },
});
