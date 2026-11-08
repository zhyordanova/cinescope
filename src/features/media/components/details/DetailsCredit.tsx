import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function DetailsCredit({
  label,
  value,
  mutedValue = false,
}: {
  label: string;
  value: string;
  mutedValue?: boolean;
}) {
  return (
    <View
      testID={`details-credit-${label.toLowerCase()}`}
      style={styles.row}
    >
      <ThemedText
        type="smallBold"
        themeColor="textSecondary"
        style={styles.label}
      >
        {label}
      </ThemedText>
      <ThemedText
        themeColor={mutedValue ? 'textSecondary' : 'textPrimary'}
        style={styles.value}
      >
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  label: {
    width: 96,
  },
  value: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
});
