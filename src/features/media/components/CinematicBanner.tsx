import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Image as NativeImage,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import {
  Breakpoints,
  Colors,
  Radii,
  Spacing,
} from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useResponsiveWidth } from '@/hooks/use-responsive-width';

import {
  CINESCOPE_SYMBOL,
  MOBILE_BANNER,
  WEB_BANNER,
} from '../constants/mediaAssets';
import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import {
  CinematicBannerSizing,
  getCinematicBannerHeight,
} from './CinematicBannerSizing';

export function getCinematicBannerArtwork(width: number) {
  return width < Breakpoints.tablet ? MOBILE_BANNER : WEB_BANNER;
}

function BannerArtwork({ width }: { width: number }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  return (
    <>
      {status !== 'ready' && (
        <View
          testID="cinematic-banner-placeholder"
          style={styles.placeholder}
          accessible={status === 'loading'}
          accessibilityRole={
            status === 'loading' ? 'progressbar' : undefined
          }
          accessibilityLabel={
            status === 'loading'
              ? MEDIA_UI_MESSAGES.home.bannerLoading
              : undefined
          }
          accessibilityLiveRegion="polite"
          accessibilityState={{ busy: status === 'loading' }}
        >
          <NativeImage
            testID="cinematic-banner-symbol"
            source={CINESCOPE_SYMBOL}
            defaultSource={CINESCOPE_SYMBOL}
            style={styles.symbol}
            resizeMode="contain"
            accessible={false}
            aria-hidden
          />
          {status === 'loading' && (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              accessible={false}
            >
              {MEDIA_UI_MESSAGES.home.bannerLoading}
            </ThemedText>
          )}
        </View>
      )}
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
        onDisplay={() => setStatus('ready')}
        onError={() => setStatus('error')}
        accessibilityRole="none"
        accessible={false}
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </>
  );
}

export function CinematicBanner() {
  const width = useResponsiveWidth();

  return (
    <View
      testID="cinematic-banner"
      {...(Platform.OS === 'web'
        ? { dataSet: { cinematicBanner: '' } }
        : {})}
      style={[
        styles.container,
        Platform.OS === 'web' && styles.webContainer,
        Platform.OS !== 'web' && {
          height: getCinematicBannerHeight(width),
        },
      ]}
    >
      <CinematicBannerSizing />
      <BannerArtwork
        key={width < Breakpoints.tablet ? 'mobile' : 'wide'}
        width={width}
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
  placeholder: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  symbol: {
    width: 96,
    height: 96,
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
