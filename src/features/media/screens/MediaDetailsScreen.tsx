import { useLocalSearchParams } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breakpoints, Spacing } from '@/constants/theme';
import { useResponsiveWidth } from '@/hooks/use-responsive-width';

import { MEDIA_ERROR_MESSAGES } from '../constants/mediaErrorMessages';
import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import { BehindTheStory } from '../components/BehindTheStory';
import { CriticsRatings } from '../components/CriticsRatings';
import { DetailsPoster } from '../components/DetailsPoster';
import { DetailsTextSection } from '../components/DetailsTextSection';
import { MediaMetadata } from '../components/MediaMetadata';
import { ProductionDetails } from '../components/ProductionDetails';
import { useMediaDetails } from '../hooks/useMediaDetails';
import { isValidMediaId } from '../utils/isValidMediaId';

const DETAILS_MAX_CONTENT_WIDTH = 1080;

export default function MediaDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const isValidId = isValidMediaId(id);
  const {
    data: media,
    error,
    isPending,
    isFetching,
    refetch,
  } = useMediaDetails(isValidId ? id : '');
  const width = useResponsiveWidth();

  const isDesktopWeb =
    Platform.OS === 'web' && width >= Breakpoints.desktop;

  const title = !isValidId
    ? MEDIA_UI_MESSAGES.details.invalidIdTitle
    : media
      ? media.title
      : error
        ? MEDIA_UI_MESSAGES.details.errorTitle
        : MEDIA_UI_MESSAGES.details.loadingTitle;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={styles.container}
      >
        <ScrollView
          testID="details-scroll-view"
          showsVerticalScrollIndicator={Platform.OS !== 'web'}
          contentContainerStyle={[
            styles.content,
            isDesktopWeb && styles.desktopContent,
          ]}
        >
          {(!media || !isDesktopWeb) && (
            <ThemedText
              testID="details-media-title"
              type="subtitle"
              accessibilityRole="header"
            >
              {title}
            </ThemedText>
          )}
          {!isValidId ? (
            <ThemedText accessibilityRole="alert">
              {MEDIA_ERROR_MESSAGES.invalidId}
            </ThemedText>
          ) : media ? (
            <View
              testID="details-layout"
              style={[
                styles.detailsLayout,
                isDesktopWeb
                  ? styles.desktopDetailsLayout
                  : styles.compactDetailsLayout,
              ]}
            >
              <View
                testID="details-poster-column"
                style={[
                  styles.posterColumn,
                  isDesktopWeb
                    ? styles.desktopPosterColumn
                    : styles.compactPosterColumn,
                ]}
              >
                <DetailsPoster
                  key={`${media.id}:${media.posterUrl}`}
                  posterUrl={media.posterUrl}
                  compact={!isDesktopWeb}
                />
                <MediaMetadata
                  mediaType={media.type}
                  year={media.year}
                  runtimeMinutes={media.runtimeMinutes}
                  totalSeasons={media.totalSeasons}
                  genres={media.genres}
                  compact={!isDesktopWeb}
                />
                <CriticsRatings ratings={media.ratings} />
              </View>
              <View
                testID="details-information-column"
                style={[
                  styles.informationColumn,
                  isDesktopWeb
                    ? styles.desktopInformationColumn
                    : styles.compactInformationColumn,
                ]}
              >
                {isDesktopWeb && (
                  <ThemedText
                    testID="details-media-title"
                    type="title"
                    accessibilityRole="header"
                  >
                    {media.title}
                  </ThemedText>
                )}
                <DetailsTextSection
                  testID="details-overview"
                  title={MEDIA_UI_MESSAGES.details.overviewTitle}
                  text={
                    media.plot ??
                    MEDIA_UI_MESSAGES.details.plotUnavailable
                  }
                />
                <BehindTheStory
                  director={media.director}
                  writer={media.writer}
                  actors={media.actors}
                />
                <ProductionDetails
                  mediaType={media.type}
                  released={media.released}
                  rated={media.rated}
                  country={media.country}
                  language={media.language}
                  boxOffice={media.boxOffice}
                />
                {media.awards && (
                  <DetailsTextSection
                    testID="details-awards"
                    title={MEDIA_UI_MESSAGES.details.awardsTitle}
                    text={media.awards}
                  />
                )}
              </View>
            </View>
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
    maxWidth: DETAILS_MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  desktopContent: {
    gap: Spacing.xl,
    paddingTop: Spacing.xxxl,
  },
  detailsLayout: {
    width: '100%',
    flexDirection: 'column',
    gap: Spacing.xl,
  },
  compactDetailsLayout: {
    gap: Spacing.md,
  },
  desktopDetailsLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xxl,
  },
  posterColumn: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  compactPosterColumn: {
    gap: Spacing.md,
  },
  desktopPosterColumn: {
    flex: 4,
    minWidth: 0,
  },
  informationColumn: {
    width: '100%',
    gap: Spacing.xl,
  },
  compactInformationColumn: {
    gap: Spacing.xxl,
  },
  desktopInformationColumn: {
    flex: 6,
    minWidth: 0,
    paddingTop: Spacing.sm,
  },
});
