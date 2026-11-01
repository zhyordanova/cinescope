import { useState } from 'react';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Breakpoints, Colors } from '@/constants/theme';

import { CINESCOPE_LOGO } from '../constants/mediaAssets';
import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

export function HomeLogoLink({ width }: { width: number }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Link href="/" replace asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={MEDIA_UI_MESSAGES.details.goHome}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={StyleSheet.flatten([
          styles.link,
          isFocused && styles.focusedLink,
        ])}
      >
        <Image
          testID="home-link-logo"
          source={CINESCOPE_LOGO}
          contentFit="contain"
          accessible={false}
          aria-hidden
          style={[
            styles.logo,
            { width: width < Breakpoints.tablet ? 112 : 144 },
          ]}
        />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focusedLink: {
    borderColor: Colors.accent,
  },
  logo: {
    aspectRatio: 1448 / 1086,
  },
});
