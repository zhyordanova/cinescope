import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Sizing, Spacing } from '@/constants/theme';

import {
  MEDIA_TYPE_LABELS,
  MEDIA_UI_MESSAGES,
} from '../constants/mediaUiMessages';
import type { MediaSummary } from '../types/media.types';

type MediaCardProps = {
  media: MediaSummary;
  onPress: () => void;
};

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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={MEDIA_UI_MESSAGES.openMedia(
        media.title,
        media.type,
        media.year,
      )}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
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
    width: Sizing.mediaCardWidth,
    maxWidth: '100%',
    gap: Spacing.xs,
    minHeight: Sizing.touchTarget,
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
    left: Spacing.sm,
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
