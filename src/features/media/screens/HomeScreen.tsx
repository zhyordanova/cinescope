import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

import { MediaRow } from '../components/MediaRow';
import { SearchMediaSection } from '../components/SearchMediaSection';
import { MEDIA_COLLECTIONS } from '../constants/mediaCollections';
import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import type { MediaCollection } from '../types/mediaCollection.types';

function SectionSeparator() {
  return <View style={styles.separator} />;
}

export default function HomeScreen() {
  const router = useRouter();

  function openMedia(id: string) {
    router.push({
      pathname: '/media/[id]',
      params: { id },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={styles.container}
      >
        <FlatList<MediaCollection>
          data={MEDIA_COLLECTIONS}
          keyExtractor={(collection) => collection.id}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              style={styles.header}
            >
              {MEDIA_UI_MESSAGES.homeTitle}
            </ThemedText>
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
    paddingVertical: Spacing.three,
  },
  header: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.four,
  },
  separator: {
    height: Spacing.four,
  },
});
