import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Sizing, Spacing } from '@/constants/theme';

import {
  MEDIA_TYPE_LABELS,
  MEDIA_UI_MESSAGES,
} from '../constants/mediaUiMessages';
import type { MediaSummary } from '../types/media.types';

type MediaCardProps = {
  media: MediaSummary;
  onPress: () => void;
};

function Poster({ url }: { url: string | null }) {
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
      />
      <ThemedText type="smallBold" themeColor="textSecondary">
        {typeLabel}
      </ThemedText>
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
  fallback: {
    textAlign: 'center',
    padding: Spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
