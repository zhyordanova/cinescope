import { StyleSheet, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';

export function DetailsCreditSectionSkeleton({
  testID,
  rows,
  fontScale,
}: {
  testID: string;
  rows: number;
  fontScale: number;
}) {
  return (
    <View testID={testID} style={styles.section}>
      <View
        testID={`${testID}-title`}
        style={[
          styles.sectionTitle,
          { height: Typography.lineHeights.small * fontScale },
        ]}
      />
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} testID={`${testID}-row`} style={styles.row}>
          <View
            style={[
              styles.label,
              { height: Typography.lineHeights.small * fontScale },
            ]}
          />
          <View
            style={[
              styles.value,
              { height: Typography.lineHeights.body * fontScale },
              index % 2 === 0 && styles.shortValue,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.md },
  sectionTitle: {
    width: '35%',
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  row: { flexDirection: 'row', gap: Spacing.sm },
  label: {
    width: 96,
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  value: {
    flex: 1,
    minWidth: 0,
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  shortValue: { flexGrow: 0.65 },
});
