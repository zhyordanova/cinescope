import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';

import { MEDIA_TYPE_LABELS } from '../constants/mediaUiMessages';
import type { MediaType } from '../types/media.types';

export function MediaTypeBadge({
  mediaType,
  variant,
}: {
  mediaType: MediaType;
  variant: 'poster' | 'details';
}) {
  const label = MEDIA_TYPE_LABELS[mediaType];

  if (variant === 'details') {
    return (
      <ThemedText
        testID="details-media-type-chip"
        type="smallBold"
        style={[styles.chip, styles.detailsChip]}
      >
        {label}
      </ThemedText>
    );
  }

  return (
    <View
      testID="media-type-badge"
      pointerEvents="none"
      style={styles.posterBadge}
    >
      <ThemedText
        type="smallBold"
        themeColor="textPrimary"
        style={styles.posterBadgeText}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  detailsChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  chip: {
    overflow: 'hidden',
    borderRadius: Radii.surface,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  posterBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.poster / 2,
    backgroundColor: 'rgba(11, 15, 25, 0.78)',
  },
  posterBadgeText: {
    color: Colors.textPrimary,
  },
});
