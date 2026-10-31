import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Breakpoints,
  Colors,
  Radii,
  Sizing,
  Spacing,
} from '@/constants/theme';
import { useResponsiveWidth } from '@/hooks/use-responsive-width';

import {
  MEDIA_TYPE_LABELS,
  MEDIA_UI_MESSAGES,
} from '../constants/mediaUiMessages';
import type { MediaSummary } from '../types/media.types';

type MediaCardProps = {
  media: MediaSummary;
  onPress: () => void;
};

export function getMediaCardWidth(width: number) {
  if (width < Breakpoints.tablet) {
    return Math.max(
      120,
      Math.min(160, Math.round((width - 32) * 0.4)),
    );
  }

  return width < Breakpoints.desktop ? 176 : 190;
}

function Poster({
  url,
  typeLabel,
}: {
  url: string | null;
  typeLabel: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <ThemedView type="surface" style={styles.poster}>
      {url && !failed ? (
        <Image
          testID="media-poster"
          source={{ uri: url }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          accessible={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.fallback}
        >
          {MEDIA_UI_MESSAGES.posterUnavailable}
        </ThemedText>
      )}
      <View
        testID="media-type-badge"
        pointerEvents="none"
        style={styles.typeBadge}
      >
        <ThemedText
          type="smallBold"
          themeColor="textPrimary"
          style={styles.typeBadgeText}
        >
          {typeLabel}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

export function MediaCard({ media, onPress }: MediaCardProps) {
  const typeLabel = MEDIA_TYPE_LABELS[media.type];
  const width = useResponsiveWidth();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const webInteractionProps =
    Platform.OS === 'web'
      ? {
          onHoverIn: () => setHovered(true),
          onHoverOut: () => setHovered(false),
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
        }
      : {};

  return (
    <Pressable
      testID="media-card"
      accessibilityRole="button"
      accessibilityLabel={MEDIA_UI_MESSAGES.openMedia(
        media.title,
        media.type,
        media.year,
      )}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width: getMediaCardWidth(width) },
        hovered && styles.hovered,
        pressed && styles.pressed,
      ]}
      {...webInteractionProps}
    >
      {focused && (
        <View
          testID="media-card-focus-ring"
          pointerEvents="none"
          style={styles.focusRing}
        />
      )}
      <Poster
        key={`${media.id}:${media.posterUrl}`}
        url={media.posterUrl}
        typeLabel={typeLabel}
      />
      <ThemedText type="smallBold" numberOfLines={2}>
        {media.title}
      </ThemedText>
      {media.year ? (
        <ThemedText type="small" themeColor="textSecondary">
          {media.year}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    maxWidth: '100%',
    gap: Spacing.xs,
    minHeight: Sizing.touchTarget,
  },
  hovered: {
    opacity: 0.9,
  },
  focusRing: {
    position: 'absolute',
    top: -Spacing.xs,
    right: -Spacing.xs,
    bottom: -Spacing.xs,
    left: -Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: Radii.surface,
  },
  poster: {
    width: '100%',
    aspectRatio: Sizing.posterAspectRatio,
    borderRadius: Radii.poster,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.poster / 2,
    backgroundColor: 'rgba(11, 15, 25, 0.78)',
  },
  typeBadgeText: {
    color: Colors.textPrimary,
  },
  fallback: {
    textAlign: 'center',
    padding: Spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
