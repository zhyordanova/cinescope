import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import {
  Breakpoints,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';
import { useResponsiveWidth } from '@/hooks/use-responsive-width';

import { CinematicBanner } from '../components/CinematicBanner';
import { MediaRow } from '../components/MediaRow';
import { SearchMediaSection } from '../components/SearchMediaSection';
import { MEDIA_COLLECTIONS } from '../constants/mediaCollections';
import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import type { MediaCollection } from '../types/mediaCollection.types';

export const CINESCOPE_LOGO = require('../../../../assets/cinescope-logo.png');

function SectionSeparator() {
  return <View style={styles.separator} />;
}

export default function HomeScreen() {
  const router = useRouter();
  const width = useResponsiveWidth();

  function openMedia(id: string) {
    router.push({
      pathname: '/media/[id]',
      params: { id },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['top', 'bottom', 'left', 'right']}
        style={styles.container}
      >
        <FlatList<MediaCollection>
          data={MEDIA_COLLECTIONS}
          keyExtractor={(collection) => collection.id}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={styles.brandHeader}>
                <Image
                  testID="cinescope-logo"
                  accessibilityRole="image"
                  accessibilityLabel={
                    MEDIA_UI_MESSAGES.home.logoAccessibleLabel
                  }
                  source={CINESCOPE_LOGO}
                  contentFit="contain"
                  style={[
                    styles.logo,
                    {
                      width: width < Breakpoints.tablet ? 112 : 144,
                    },
                  ]}
                />
              </View>
              <CinematicBanner />
            </View>
          }
          ItemSeparatorComponent={SectionSeparator}
          renderItem={({ item }) =>
            item.source === 'curated' ? (
              <MediaRow
                title={item.title}
                items={item.items}
                onMediaPress={openMedia}
              />
            ) : (
              <SearchMediaSection
                collection={item}
                onMediaPress={openMedia}
              />
            )
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingVertical: Spacing.lg,
  },
  listHeader: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  brandHeader: {
    paddingHorizontal: Spacing.lg,
  },
  logo: {
    aspectRatio: 1448 / 1086,
  },
  separator: {
    height: Spacing.xl,
  },
});
