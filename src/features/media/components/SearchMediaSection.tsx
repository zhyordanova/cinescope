import { StyleSheet, View } from 'react-native';

import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import { useMediaCollection } from '../hooks/useMediaCollection';
import type { SearchMediaCollection } from '../types/mediaCollection.types';

import { MediaRow } from './MediaRow';

type SearchMediaSectionProps = {
  collection: SearchMediaCollection;
  onMediaPress: (id: string) => void;
};

export function SearchMediaSection({
  collection,
  onMediaPress,
}: SearchMediaSectionProps) {
  const { items, error, isFetching, refetch } =
    useMediaCollection(collection);

  return (
    <View style={styles.container}>
      {items && items.length > 0 ? (
        <MediaRow
          title={collection.title}
          items={items}
          onMediaPress={onMediaPress}
        />
      ) : (
        <View style={styles.status}>
          <ThemedText
            accessibilityRole="header"
            style={styles.heading}
          >
            {collection.title}
          </ThemedText>
          {!error && (
            <ThemedText
              themeColor="textSecondary"
              accessibilityLiveRegion="polite"
            >
              {items
                ? MEDIA_UI_MESSAGES.collection.empty
                : MEDIA_UI_MESSAGES.collection.loading(
                    collection.title,
                  )}
            </ThemedText>
          )}
        </View>
      )}
      {error && (
        <View style={styles.status}>
          <ThemedText accessibilityRole="alert">
            {MEDIA_UI_MESSAGES.collection.error(
              collection.title,
              error.message,
            )}
          </ThemedText>
          <ThemedButton
            label={
              isFetching
                ? MEDIA_UI_MESSAGES.collection.retrying(
                    collection.title,
                  )
                : MEDIA_UI_MESSAGES.collection.retry(collection.title)
            }
            disabled={isFetching}
            onPress={() => void refetch()}
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
