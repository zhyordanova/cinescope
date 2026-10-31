import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

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
    <ThemedView type="backgroundElement" style={styles.poster}>
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
    width: 144,
    maxWidth: '100%',
    gap: Spacing.one,
    minHeight: 48,
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    textAlign: 'center',
    padding: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
