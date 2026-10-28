import {
  useCanGoBack,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

import { MEDIA_ERROR_MESSAGES } from '../constants/mediaErrorMessages';
import { useMediaDetails } from '../hooks/useMediaDetails';
import { isValidMediaId } from '../utils/isValidMediaId';

export default function MediaDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const router = useRouter();
  const isValidId = isValidMediaId(id);
  const {
    data: media,
    error,
    isPending,
    isFetching,
    refetch,
  } = useMediaDetails(isValidId ? id : '');
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
                : error
                  ? 'Unable to load details'
                  : 'Loading details'}
          </ThemedText>
          {!isValidId ? (
            <ThemedText accessibilityRole="alert">
              {MEDIA_ERROR_MESSAGES.invalidId}
            </ThemedText>
          ) : media ? (
            <>
              <ThemedText type="smallBold">
                {media.type === 'movie'
                  ? 'Movie'
                  : media.type === 'series'
                    ? 'Series'
                    : 'Episode'}
              </ThemedText>
              <ThemedText>IMDb ID: {media.id}</ThemedText>
              {media.year !== null && (
                <ThemedText>Year: {media.year}</ThemedText>
              )}
              {media.genres.length > 0 && (
                <ThemedText>
                  Genres: {media.genres.join(', ')}
                </ThemedText>
              )}
              {media.runtimeMinutes !== null && (
                <ThemedText>
                  Runtime: {media.runtimeMinutes} min
                </ThemedText>
              )}
              {media.imdbRating !== null && (
                <ThemedText>
                  IMDb rating: {media.imdbRating}/10
                </ThemedText>
              )}
              {media.type === 'series' &&
                media.totalSeasons !== null && (
                  <ThemedText>
                    Seasons: {media.totalSeasons}
                  </ThemedText>
                )}
              <ThemedText themeColor="textSecondary">
                {media.plot ?? 'Plot unavailable.'}
              </ThemedText>
            </>
          ) : (
            <ThemedText
              accessibilityLiveRegion="polite"
              accessibilityRole={error ? 'alert' : undefined}
            >
              {error
                ? error.message
                : isPending
                  ? 'Loading media details…'
                  : null}
            </ThemedText>
          )}
          {isValidId && error && (
            <>
              {media && (
                <ThemedText accessibilityRole="alert">
                  {error.message}
                </ThemedText>
              )}
              <ThemedButton
                label={isFetching ? 'Retrying…' : 'Retry'}
                disabled={isFetching}
                onPress={() => void refetch()}
              />
            </>
          )}
          <ThemedButton
            label={canGoBack ? 'Go back' : 'Go to Home'}
            onPress={returnToHome}
          />
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
});
