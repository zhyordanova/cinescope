import { Platform, StyleSheet, View } from 'react-native';

import { Colors, Radii, Sizing, Spacing } from '@/constants/theme';
import { MediaCardTextSkeleton } from './MediaCardTextSkeleton';

export function MediaCardSkeleton({
  cardWidth,
  lineHeight,
}: {
  cardWidth: number;
  lineHeight: number;
}) {
  return (
    <View
      testID="media-card-skeleton"
      {...(Platform.OS === 'web'
        ? { dataSet: { mediaCardSizing: '' } }
        : {})}
      style={[
        styles.card,
        Platform.OS !== 'web' && { width: cardWidth },
      ]}
    >
      <View
        testID="media-card-skeleton-poster"
        style={styles.poster}
      />
      <MediaCardTextSkeleton
        variant="title"
        lineHeight={lineHeight}
      />
      <MediaCardTextSkeleton variant="year" lineHeight={lineHeight} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexShrink: 0,
    gap: Spacing.xs,
  },
  poster: {
    width: '100%',
    aspectRatio: Sizing.posterAspectRatio,
    borderRadius: Radii.poster,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.xs,
  },
});
