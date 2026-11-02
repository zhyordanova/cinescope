import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import { useResponsiveWidth } from '@/hooks/use-responsive-width';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

import { getMediaCardWidth } from './MediaCardSizing';
import { MediaCardSkeleton } from './MediaCardSkeleton';

const SKELETON_CARD_COUNT = 8;

export function MediaRowSkeleton({ title }: { title: string }) {
  const width = useResponsiveWidth();
  const { fontScale } = useWindowDimensions();
  const cardWidth = getMediaCardWidth(width);
  const lineHeight = Typography.lineHeights.small * fontScale;

  return (
    <View style={styles.container}>
      <ThemedText accessibilityRole="header" style={styles.heading}>
        {title}
      </ThemedText>
      <View
        testID="media-row-skeleton"
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={MEDIA_UI_MESSAGES.collection.loading(
          title,
        )}
        accessibilityState={{ busy: true }}
        accessibilityLiveRegion="polite"
        style={styles.viewport}
      >
        <View
          accessible={false}
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.row}
        >
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            <MediaCardSkeleton
              key={index}
              cardWidth={cardWidth}
              lineHeight={lineHeight}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.sm,
  },
  heading: {
    paddingHorizontal: Spacing.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  viewport: {
    width: '100%',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
});
