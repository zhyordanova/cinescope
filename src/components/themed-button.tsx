import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

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
      <ThemedView type="backgroundElement" style={styles.button}>
        <ThemedText>{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    justifyContent: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
