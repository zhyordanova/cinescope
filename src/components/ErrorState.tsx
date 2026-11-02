import { StyleSheet, View } from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';

import { ThemedButton } from './themed-button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function ErrorState({
  title,
  description,
  actionLabel,
  actionAccessibilityLabel,
  onRetry,
  isRetrying,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionAccessibilityLabel?: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <ThemedView type="surface" style={styles.panel}>
      <ThemedText type="smallBold" accessibilityRole="alert">
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        {description}
      </ThemedText>
      <View style={styles.action}>
        <ThemedButton
          label={actionLabel}
          accessibilityLabel={actionAccessibilityLabel}
          disabled={isRetrying}
          onPress={onRetry}
        />
      </View>
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
  action: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Radii.surface,
    maxWidth: '100%',
  },
});
