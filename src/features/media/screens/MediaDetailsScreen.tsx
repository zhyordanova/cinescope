import {
  useCanGoBack,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

import { mockMedia } from '../mockMedia';

export default function MediaDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const router = useRouter();
  const isValidId = typeof id === 'string' && /^tt\d{7,}$/.test(id);
  const media = isValidId
    ? mockMedia.find((item) => item.id === id)
    : undefined;
  const canGoBack = useCanGoBack();

  function returnToHome() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" accessibilityRole="header">
            {!isValidId
              ? 'Invalid media ID'
              : media
                ? media.title
                : 'Mock title unavailable'}
          </ThemedText>
          {!isValidId ? (
            <ThemedText accessibilityRole="alert">
              A single IMDb title ID is required, starting with tt
              followed by at least seven digits.
            </ThemedText>
          ) : media ? (
            <>
              <ThemedText type="smallBold">
                {media.type === 'movie' ? 'Movie' : 'Series'}
              </ThemedText>
              <ThemedText>IMDb ID: {media.id}</ThemedText>
              <ThemedText themeColor="textSecondary">
                Temporary mock details for navigation testing. Real
                metadata will come from OMDb in a later increment.
              </ThemedText>
            </>
          ) : (
            <ThemedText accessibilityRole="alert">
              The ID {id} has a valid format, but no temporary mock
              title matches it. No API request was made.
            </ThemedText>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={returnToHome}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView
              type="backgroundElement"
              style={styles.button}
            >
              <ThemedText>
                {canGoBack ? 'Go back' : 'Go to Home'}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ScrollView>
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
    gap: Spacing.three,
  },
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
