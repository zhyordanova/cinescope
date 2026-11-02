import { StyleSheet } from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <ThemedView type="surface" style={styles.panel}>
      <ThemedText type="smallBold" accessibilityRole="header">
        {title}
      </ThemedText>
      <ThemedText
        themeColor="textSecondary"
        accessibilityLiveRegion="polite"
      >
        {description}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: Radii.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
