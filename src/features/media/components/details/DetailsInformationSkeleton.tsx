import { Platform, StyleSheet, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';

import { DetailsCreditSectionSkeleton } from './DetailsCreditSectionSkeleton';

export function DetailsInformationSkeleton({
  fontScale,
}: {
  fontScale: number;
}) {
  const isWeb = Platform.OS === 'web';

  return (
    <View
      testID="details-skeleton-information"
      {...(isWeb ? { dataSet: { detailsSkeletonRight: '' } } : {})}
      style={!isWeb && styles.compactInformationColumn}
    >
      {isWeb && (
        <View
          testID="details-skeleton-desktop-title"
          {...{ dataSet: { detailsSkeletonDesktopTitle: '' } }}
          style={[
            styles.title,
            {
              height:
                Typography.lineHeights.title.desktop * fontScale,
            },
          ]}
        />
      )}
      <View style={styles.overview}>
        <View
          style={[
            styles.sectionTitle,
            { height: Typography.lineHeights.small * fontScale },
          ]}
        />
        <View>
          {Array.from({ length: 8 }, (_, index) => (
            <View
              key={index}
              testID="details-skeleton-overview-line"
              style={[
                styles.textLine,
                { height: Typography.lineHeights.body * fontScale },
              ]}
            >
              <View
                style={[
                  styles.line,
                  { height: Typography.fontSizes.body * fontScale },
                  index === 7 && styles.lastLine,
                ]}
              />
            </View>
          ))}
        </View>
      </View>
      <DetailsCreditSectionSkeleton
        testID="details-skeleton-story"
        rows={3}
        fontScale={fontScale}
      />
      <DetailsCreditSectionSkeleton
        testID="details-skeleton-production"
        rows={5}
        fontScale={fontScale}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  compactInformationColumn: { gap: Spacing.xxl },
  title: {
    width: '80%',
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
  },
  sectionTitle: {
    width: '35%',
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  overview: { gap: Spacing.sm },
  line: {
    width: '100%',
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  textLine: { justifyContent: 'center' },
  lastLine: { width: '65%' },
});
