import {
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import { DetailsInformationSkeleton } from './DetailsInformationSkeleton';
import { DetailsPosterSkeleton } from './DetailsPosterSkeleton';
import { MediaDetailsSkeletonStyles } from './MediaDetailsSkeletonStyles';

export function MediaDetailsSkeleton() {
  const { fontScale } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  return (
    <View
      testID="details-skeleton"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={MEDIA_UI_MESSAGES.details.loading}
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: true }}
    >
      <MediaDetailsSkeletonStyles />
      <View
        testID="details-skeleton-layout"
        accessible={false}
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        {...(isWeb ? { dataSet: { detailsSkeletonLayout: '' } } : {})}
        style={[styles.layout, !isWeb && styles.compactLayout]}
      >
        <DetailsPosterSkeleton fontScale={fontScale} />
        <DetailsInformationSkeleton fontScale={fontScale} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { width: '100%' },
  compactLayout: { flexDirection: 'column', gap: Spacing.md },
});
