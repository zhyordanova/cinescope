import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, Radii, Sizing } from '@/constants/theme';

import { PosterFallback } from '../shared/PosterFallback';

export function DetailsPoster({
  posterUrl,
  compact,
}: {
  posterUrl: string | null;
  compact: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <View
      testID="details-poster-frame"
      style={[
        styles.posterFrame,
        compact && styles.compactPosterFrame,
      ]}
    >
      {posterUrl && !failed ? (
        <>
          <Image
            testID="details-poster-background"
            source={{ uri: posterUrl }}
            style={styles.posterBackground}
            contentFit="cover"
            blurRadius={2}
            cachePolicy="memory-disk"
            accessible={false}
            aria-hidden
          />
          <View
            testID="details-poster-scrim"
            pointerEvents="none"
            style={styles.posterScrim}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Image
            testID="details-poster"
            source={{ uri: posterUrl }}
            style={[
              styles.posterForeground,
              compact && styles.compactPosterForeground,
            ]}
            contentFit="contain"
            cachePolicy="memory-disk"
            accessible={false}
            aria-hidden
            onError={() => setFailed(true)}
          />
        </>
      ) : (
        <PosterFallback
          style={[
            styles.posterForeground,
            compact && styles.compactPosterForeground,
            styles.posterFallback,
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  posterFrame: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1.12,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: Radii.banner,
    backgroundColor: Colors.surface,
  },
  compactPosterFrame: {
    aspectRatio: 1.2,
  },
  posterBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  posterScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(11, 15, 25, 0.64)',
  },
  posterForeground: {
    width: 200,
    aspectRatio: Sizing.posterAspectRatio,
    borderRadius: Radii.poster,
    backgroundColor: Colors.background,
  },
  compactPosterForeground: {
    width: '55%',
  },
  posterFallback: {
    backgroundColor: Colors.surface,
  },
});
