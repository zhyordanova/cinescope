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
import {
  MEDIA_TYPE_LABELS,
  MEDIA_UI_MESSAGES,
} from '../constants/mediaUiMessages';
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
              ? MEDIA_UI_MESSAGES.details.invalidIdTitle
              : media
                ? media.title
                : error
                  ? MEDIA_UI_MESSAGES.details.errorTitle
                  : MEDIA_UI_MESSAGES.details.loadingTitle}
          </ThemedText>
          {!isValidId ? (
            <ThemedText accessibilityRole="alert">
              {MEDIA_ERROR_MESSAGES.invalidId}
            </ThemedText>
          ) : media ? (
            <>
              <ThemedText type="smallBold">
                {MEDIA_TYPE_LABELS[media.type]}
              </ThemedText>
              <ThemedText>
                {MEDIA_UI_MESSAGES.details.imdbId(media.id)}
              </ThemedText>
              {media.year !== null && (
                <ThemedText>
                  {MEDIA_UI_MESSAGES.details.year(media.year)}
                </ThemedText>
              )}
              {media.genres.length > 0 && (
                <ThemedText>
                  {MEDIA_UI_MESSAGES.details.genres(media.genres)}
                </ThemedText>
              )}
              {media.runtimeMinutes !== null && (
                <ThemedText>
                  {MEDIA_UI_MESSAGES.details.runtime(
                    media.runtimeMinutes,
                  )}
                </ThemedText>
              )}
              {media.imdbRating !== null && (
                <ThemedText>
                  {MEDIA_UI_MESSAGES.details.imdbRating(
                    media.imdbRating,
                  )}
                </ThemedText>
              )}
              {media.type === 'series' &&
                media.totalSeasons !== null && (
                  <ThemedText>
                    {MEDIA_UI_MESSAGES.details.seasons(
                      media.totalSeasons,
                    )}
                  </ThemedText>
                )}
              <ThemedText themeColor="textSecondary">
                {media.plot ??
                  MEDIA_UI_MESSAGES.details.plotUnavailable}
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
                  ? MEDIA_UI_MESSAGES.details.loading
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
                label={
                  isFetching
                    ? MEDIA_UI_MESSAGES.retrying
                    : MEDIA_UI_MESSAGES.retry
                }
                disabled={isFetching}
                onPress={() => void refetch()}
              />
            </>
          )}
          <ThemedButton
            label={
              canGoBack
                ? MEDIA_UI_MESSAGES.goBack
                : MEDIA_UI_MESSAGES.goHome
            }
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
