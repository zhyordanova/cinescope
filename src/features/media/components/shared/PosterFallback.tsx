import { useState } from 'react';
import { Image } from 'expo-image';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Sizing, Spacing } from '@/constants/theme';

import { CINESCOPE_SYMBOL } from '../../constants/mediaAssets';
import { MEDIA_UI_MESSAGES } from '../../constants/mediaUiMessages';

type PosterFallbackProps = {
  accessible?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function PosterFallback({
  accessible = true,
  accessibilityLabel = MEDIA_UI_MESSAGES.posterUnavailable,
  style,
}: PosterFallbackProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [labelHeight, setLabelHeight] = useState(0);
  const showLabel =
    labelHeight > 0 &&
    size.width > Spacing.sm * 2 &&
    size.width * 0.6 + labelHeight + Spacing.sm * 3 <= size.height;

  return (
    <View
      testID="poster-fallback"
      accessible={accessible}
      aria-hidden={!accessible}
      accessibilityElementsHidden={!accessible}
      importantForAccessibility={
        accessible ? 'auto' : 'no-hide-descendants'
      }
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={({ nativeEvent: { layout } }) =>
        setSize({ width: layout.width, height: layout.height })
      }
      style={[
        styles.container,
        style,
        showLabel && { gap: Spacing.sm },
      ]}
    >
      <Image
        testID="poster-fallback-symbol"
        source={CINESCOPE_SYMBOL}
        style={styles.symbol}
        contentFit="contain"
        accessible={false}
        aria-hidden
      />
      <ThemedText
        testID="poster-fallback-label"
        type="small"
        themeColor="textSecondary"
        accessible={false}
        aria-hidden
        pointerEvents="none"
        onLayout={({ nativeEvent: { layout } }) =>
          setLabelHeight(layout.height)
        }
        style={[
          styles.label,
          showLabel ? styles.visibleLabel : styles.hiddenLabel,
        ]}
      >
        {MEDIA_UI_MESSAGES.posterUnavailable}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: Sizing.posterAspectRatio,
    borderRadius: Radii.poster,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  symbol: {
    width: '60%',
    aspectRatio: 1,
  },
  label: {
    width: '100%',
    paddingHorizontal: Spacing.sm,
    textAlign: 'center',
  },
  visibleLabel: {
    flexShrink: 0,
    opacity: 1,
  },
  hiddenLabel: {
    position: 'absolute',
    bottom: Spacing.sm,
    opacity: 0,
  },
});
