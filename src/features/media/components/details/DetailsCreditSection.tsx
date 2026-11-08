import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import { DetailsCredit } from './DetailsCredit';

type CreditRow = {
  label: string;
  value: string;
  mutedValue?: boolean;
};

export function DetailsCreditSection({
  testID,
  title,
  credits,
}: {
  testID: string;
  title: string;
  credits: readonly (CreditRow | null)[];
}) {
  const availableCredits = credits.filter(
    (credit): credit is CreditRow => credit !== null,
  );

  if (availableCredits.length === 0) return null;

  return (
    <View testID={testID} style={styles.section}>
      <ThemedText type="smallBold" accessibilityRole="header">
        {title}
      </ThemedText>
      <View testID={`${testID}-list`} style={styles.list}>
        {availableCredits.map(({ label, value, mutedValue }) => (
          <DetailsCredit
            key={label}
            label={label}
            value={value}
            mutedValue={mutedValue}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
});
