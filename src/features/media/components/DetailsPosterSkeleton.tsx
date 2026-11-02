import { Platform, StyleSheet, View } from 'react-native';

import {
  Colors,
  Radii,
  Sizing,
  Spacing,
  Typography,
} from '@/constants/theme';

export function DetailsPosterSkeleton({
  fontScale,
}: {
  fontScale: number;
}) {
  const isWeb = Platform.OS === 'web';
  const smallLineHeight = Typography.lineHeights.small * fontScale;

  return (
    <View
      {...(isWeb ? { dataSet: { detailsSkeletonLeft: '' } } : {})}
      style={[
        styles.posterColumn,
        !isWeb && styles.compactPosterColumn,
      ]}
    >
      <View
        testID="details-skeleton-title"
        {...(isWeb
          ? { dataSet: { detailsSkeletonCompactTitle: '' } }
          : {})}
        style={[
          styles.title,
          {
            height:
              Typography.lineHeights.subtitle.mobile * fontScale,
          },
        ]}
      />
      <View
        testID="details-skeleton-poster"
        {...(isWeb ? { dataSet: { detailsSkeletonPoster: '' } } : {})}
        style={[styles.poster, !isWeb && styles.compactPoster]}
      >
        <View
          testID="details-skeleton-foreground"
          {...(isWeb
            ? { dataSet: { detailsSkeletonForeground: '' } }
            : {})}
          style={[
            styles.foreground,
            !isWeb && styles.compactForeground,
          ]}
        />
      </View>
      <View
        testID="details-skeleton-badge"
        style={[
          styles.badge,
          { height: smallLineHeight + Spacing.xs * 2 + 2 },
        ]}
      />
      <View
        testID="details-skeleton-metadata"
        style={styles.metadata}
      >
        <View
          style={[styles.metadataItem, { height: smallLineHeight }]}
        />
        <View
          style={[styles.metadataItem, { height: smallLineHeight }]}
        />
      </View>
      <View style={[styles.genres, { height: smallLineHeight }]} />
      <View
        testID="details-skeleton-ratings"
        style={styles.ratingsSection}
      >
        <View
          style={[styles.sectionTitle, { height: smallLineHeight }]}
        />
        <View style={styles.ratings}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              testID="details-skeleton-rating-card"
              style={styles.rating}
            >
              <View style={styles.ratingIcon} />
              <View
                style={[
                  styles.ratingSource,
                  { height: smallLineHeight * 2 },
                ]}
              />
              <View
                style={[
                  styles.ratingValue,
                  { height: smallLineHeight },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  posterColumn: { alignItems: 'center' },
  compactPosterColumn: { gap: Spacing.md },
  poster: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.surface,
    borderRadius: Radii.banner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactPoster: { aspectRatio: 1.2 },
  foreground: {
    aspectRatio: Sizing.posterAspectRatio,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radii.poster,
  },
  compactForeground: { width: '55%' },
  badge: {
    width: 66,
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radii.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metadata: { width: '100%', flexDirection: 'row', gap: Spacing.sm },
  metadataItem: {
    width: 80,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Spacing.xs,
  },
  genres: {
    width: '85%',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.xs,
  },
  ratingsSection: { width: '100%', gap: Spacing.sm },
  ratings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  rating: {
    flexBasis: '30%',
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 88,
    maxWidth: 260,
    padding: Spacing.sm,
    gap: Spacing.xs,
    alignItems: 'center',
    borderRadius: Radii.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  ratingIcon: {
    width: 14,
    height: 14,
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
  },
  ratingSource: {
    width: '75%',
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
  },
  ratingValue: {
    width: '50%',
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
  },
  title: {
    width: '80%',
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    width: '35%',
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surface,
  },
});
