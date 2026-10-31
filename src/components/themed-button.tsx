import { Pressable, StyleSheet } from 'react-native';

import { Radii, Sizing, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type ThemedButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function ThemedButton({
  label,
  onPress,
  disabled = false,
}: ThemedButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView type="surface" style={styles.button}>
        <ThemedText>{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: Sizing.touchTarget,
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radii.surface,
  },
  pressed: {
    opacity: 0.7,
  },
});
