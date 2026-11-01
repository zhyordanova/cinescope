import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import type { MediaRating } from '../types/media.types';

import type { PlatformSymbolNames } from './platformSymbol.types';

type RatingSource = MediaRating['source'];

const RATING_ICONS = {
  IMDb: {
    ios: 'star.fill',
    android: 'star',
    web: 'star',
  },
  'Rotten Tomatoes': {
    ios: 'rosette',
    android: 'award_star',
    web: 'award_star',
  },
  Metacritic: {
    ios: 'chart.bar',
    android: 'bar_chart',
    web: 'bar_chart',
  },
} as const satisfies Record<RatingSource, PlatformSymbolNames>;

function RatingCard({
  source,
  value,
}: {
  source: RatingSource;
  value: string;
}) {
  const sourceId = source.toLowerCase().replace(/\s+/g, '-');

  return (
    <View
      testID={`details-rating-card-${sourceId}`}
      style={styles.ratingCard}
    >
      <View style={styles.ratingSource}>
        <SymbolView
          testID={`details-rating-icon-${sourceId}`}
          name={RATING_ICONS[source]}
          size={14}
          tintColor={
            source === 'IMDb' ? Colors.ratingStar : Colors.accent
          }
          accessible={false}
          aria-hidden
        />
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.ratingSourceText}
        >
          {source}
        </ThemedText>
      </View>
      <ThemedText
        type="smallBold"
        themeColor="textPrimary"
        style={styles.ratingValue}
      >
        {value}
      </ThemedText>
    </View>
  );
}

export function CriticsRatings({
  ratings,
}: {
  ratings: MediaRating[];
}) {
  if (ratings.length === 0) return null;

  return (
    <View testID="details-critics-ratings" style={styles.section}>
      <ThemedText type="smallBold" accessibilityRole="header">
        {MEDIA_UI_MESSAGES.details.criticsRatingsTitle}
      </ThemedText>
      <View
        testID="details-critic-ratings-list"
        style={styles.ratingsList}
      >
        {ratings.map(({ source, value }) => (
          <RatingCard key={source} source={source} value={value} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    gap: Spacing.sm,
  },
  ratingsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  ratingCard: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '30%',
    minWidth: 88,
    maxWidth: 260,
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radii.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  ratingSource: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.xs,
    width: '100%',
  },
  ratingSourceText: {
    minWidth: 0,
    textAlign: 'center',
  },
  ratingValue: {
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'center',
  },
});
