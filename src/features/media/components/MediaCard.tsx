import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Colors,
  Radii,
  Sizing,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useResponsiveWidth } from '@/hooks/use-responsive-width';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import type { MediaSummary } from '../types/media.types';

import { MediaTypeBadge } from './MediaTypeBadge';
import { getMediaCardWidth } from './MediaCardSizing';
import { PosterFallback } from './PosterFallback';
import { MediaCardTextSkeleton } from './MediaCardTextSkeleton';

type MediaCardProps = {
  media: MediaSummary;
  onPress: () => void;
  showMetadata?: boolean;
};

function Poster({
  url,
  mediaType,
  showMetadata,
}: {
  url: string | null;
  mediaType: MediaSummary['type'];
  showMetadata: boolean;
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
        <PosterFallback accessible={false} />
      )}
      {showMetadata && (
        <MediaTypeBadge mediaType={mediaType} variant="poster" />
      )}
    </ThemedView>
  );
}

export function MediaCard({
  media,
  onPress,
  showMetadata = true,
}: MediaCardProps) {
  const width = useResponsiveWidth();
  const { fontScale } = useWindowDimensions();
  const lineHeight = Typography.lineHeights.small * fontScale;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const webInteractionProps =
    Platform.OS === 'web'
      ? {
          onHoverIn: () => setHovered(true),
          onHoverOut: () => setHovered(false),
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
          dataSet: { mediaCardSizing: '' },
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
        Platform.OS !== 'web' && { width: getMediaCardWidth(width) },
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
        mediaType={media.type}
        showMetadata={showMetadata}
      />
      <View>
        <ThemedText
          type="smallBold"
          numberOfLines={2}
          style={!showMetadata && styles.hiddenMetadata}
        >
          {media.title}
        </ThemedText>
        {!showMetadata && (
          <MediaCardTextSkeleton
            variant="title"
            lineHeight={lineHeight}
            overlay
          />
        )}
      </View>
      {media.year ? (
        <View>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={!showMetadata && styles.hiddenMetadata}
          >
            {media.year}
          </ThemedText>
          {!showMetadata && (
            <MediaCardTextSkeleton
              variant="year"
              lineHeight={lineHeight}
              overlay
            />
          )}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hiddenMetadata: {
    opacity: 0,
  },
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
  pressed: {
    opacity: 0.7,
  },
});
