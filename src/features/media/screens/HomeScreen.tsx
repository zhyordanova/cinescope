import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

import { mockMedia } from '../mockMedia';

export default function HomeScreen() {
  const router = useRouter();
  const [checkCount, setCheckCount] = useState(0);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={styles.container}
      >
        <FlatList
          data={mockMedia}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="subtitle" accessibilityRole="header">
                Movies and series
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                Temporary mock titles for testing navigation. No API
                data is loaded.
              </ThemedText>
              <ThemedButton
                label="Increment check counter"
                onPress={() => setCheckCount((count) => count + 1)}
              />
              <ThemedText accessibilityLiveRegion="polite">
                Navigation checks: {checkCount}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Increment the counter, scroll down, and open a title.
                Back should preserve the counter and scroll position.
              </ThemedText>
            </View>
          }
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          renderItem={({ item }) => {
            const typeLabel =
              item.type === 'movie' ? 'Movie' : 'Series';

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title}, ${typeLabel}`}
                onPress={() =>
                  router.push({
                    pathname: '/media/[id]',
                    params: { id: item.id },
                  })
                }
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedView
                  type="backgroundElement"
                  style={styles.card}
                >
                  <ThemedText
                    type="smallBold"
                    themeColor="textSecondary"
                  >
                    {typeLabel}
                  </ThemedText>
                  <ThemedText>{item.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.id}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          }}
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
    padding: Spacing.three,
  },
  header: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.two,
  },
  separator: {
    height: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
