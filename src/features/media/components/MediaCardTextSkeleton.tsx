import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export function MediaCardTextSkeleton({
  variant,
  lineHeight,
  overlay = false,
}: {
  variant: 'title' | 'year';
  lineHeight: number;
  overlay?: boolean;
}) {
  return (
    <View
      testID={`media-card-skeleton-${variant}`}
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.line,
        styles[variant],
        { height: lineHeight },
        overlay && styles.overlay,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
  },
  title: { width: '85%' },
  year: { width: '35%' },
  overlay: { position: 'absolute', top: 0, left: 0 },
});
