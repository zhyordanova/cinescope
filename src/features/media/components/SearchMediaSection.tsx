import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import { useMediaCollection } from '../hooks/useMediaCollection';
import type { SearchMediaCollection } from '../types/mediaCollection.types';

import { MediaRow } from './MediaRow';
import { MediaRowSkeleton } from './MediaRowSkeleton';

type SearchMediaSectionProps = {
  collection: SearchMediaCollection;
  onMediaPress: (id: string) => void;
};

export function SearchMediaSection({
  collection,
  onMediaPress,
}: SearchMediaSectionProps) {
  const { items, error, errorUpdatedAt, isFetching, refetch } =
    useMediaCollection(collection);

  const showError = Boolean(error) || (!items && errorUpdatedAt > 0);

  return (
    <View style={styles.container}>
      {items && items.length > 0 ? (
        <MediaRow
          title={collection.title}
          items={items}
          onMediaPress={onMediaPress}
        />
      ) : !items && !showError ? (
        <MediaRowSkeleton title={collection.title} />
      ) : (
        <View style={styles.status}>
          <ThemedText
            accessibilityRole="header"
            style={styles.heading}
          >
            {collection.title}
          </ThemedText>
          {!showError && (
            <EmptyState
              title={MEDIA_UI_MESSAGES.collection.emptyTitle}
              description={MEDIA_UI_MESSAGES.collection.empty}
            />
          )}
        </View>
      )}
      {showError && (
        <View style={styles.status}>
          <ErrorState
            title={MEDIA_UI_MESSAGES.collection.errorTitle}
            description={
              MEDIA_UI_MESSAGES.collection.errorDescription
            }
            actionLabel={
              isFetching
                ? MEDIA_UI_MESSAGES.collection.retryingLabel
                : MEDIA_UI_MESSAGES.collection.retryLabel
            }
            actionAccessibilityLabel={
              isFetching
                ? MEDIA_UI_MESSAGES.collection.retrying(
                    collection.title,
                  )
                : MEDIA_UI_MESSAGES.collection.retry(collection.title)
            }
            isRetrying={isFetching}
            onRetry={() => void refetch()}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  status: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  heading: {
    fontWeight: Typography.fontWeights.bold,
  },
});
