import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';

import {
  Breakpoints,
  Colors,
  Radii,
  Spacing,
} from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useResponsiveWidth } from '@/hooks/use-responsive-width';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

const MOBILE_BANNER = require('../../../../assets/CinematicBanner-mobile.png');
const WEB_BANNER = require('../../../../assets/CinematicBanner-web.png');

export function getCinematicBannerArtwork(width: number) {
  return width < Breakpoints.tablet ? MOBILE_BANNER : WEB_BANNER;
}

export function getCinematicBannerHeight(width: number) {
  return width < Breakpoints.tablet
    ? 360
    : width < Breakpoints.desktop
      ? 380
      : 600;
}

export function CinematicBanner() {
  const width = useResponsiveWidth();

  return (
    <View
      testID="cinematic-banner"
      style={[
        styles.container,
        Platform.OS === 'web' && styles.webContainer,
        { height: getCinematicBannerHeight(width) },
      ]}
    >
      <Image
        testID="cinematic-banner-artwork"
        source={getCinematicBannerArtwork(width)}
        style={styles.artwork}
        contentFit="cover"
        contentPosition={
          Platform.OS === 'web' ? 'right center' : 'right top'
        }
        cachePolicy="memory-disk"
        transition={150}
        accessibilityRole="none"
        accessible={false}
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <View style={styles.copy}>
        <ThemedText
          type="subtitle"
          accessibilityRole="header"
          style={styles.headline}
        >
          {MEDIA_UI_MESSAGES.home.bannerHeadline}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {MEDIA_UI_MESSAGES.home.bannerSubtitle}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: Radii.banner,
    backgroundColor: Colors.background,
  },
  webContainer: {
    justifyContent: 'flex-start',
  },
  artwork: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  copy: {
    gap: Spacing.sm,
    padding: Spacing.xl,
    maxWidth: 680,
  },
  headline: {
    color: Colors.textPrimary,
  },
  subtitle: {
    color: Colors.textPrimary,
  },
});
