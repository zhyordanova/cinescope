import { useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import type { MediaSummary } from '../types/media.types';

import { MediaCard } from './MediaCard';

type MediaRowProps = {
  title: string;
  items: readonly MediaSummary[];
  onMediaPress: (id: string) => void;
};

function CardSeparator() {
  return <View style={styles.separator} />;
}

export function MediaRow({
  title,
  items,
  onMediaPress,
}: MediaRowProps) {
  const listRef = useRef<FlatList<MediaSummary>>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  const isWeb = Platform.OS === 'web';
  const maxOffset = Math.max(0, contentWidth - viewportWidth);
  const showControls = isWeb && viewportWidth > 0 && maxOffset > 1;
  const atStart = offset <= 1;
  const atEnd = offset >= maxOffset - 1;

  function scroll(direction: -1 | 1) {
    listRef.current?.scrollToOffset({
      offset: Math.max(
        0,
        Math.min(maxOffset, offset + direction * viewportWidth),
      ),
      animated: true,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText accessibilityRole="header" style={styles.heading}>
          {title}
        </ThemedText>
      </View>
      <View>
        <FlatList
          ref={listRef}
          horizontal
          accessibilityLabel={title}
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={CardSeparator}
          showsHorizontalScrollIndicator={false}
          onLayout={
            isWeb
              ? (event) =>
                  setViewportWidth(event.nativeEvent.layout.width)
              : undefined
          }
          onContentSizeChange={
            isWeb ? (width) => setContentWidth(width) : undefined
          }
          onScroll={
            isWeb
              ? (event) =>
                  setOffset(event.nativeEvent.contentOffset.x)
              : undefined
          }
          scrollEventThrottle={isWeb ? 16 : undefined}
          renderItem={({ item }) => (
            <MediaCard
              media={item}
              onPress={() => onMediaPress(item.id)}
            />
          )}
        />
        {showControls && (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={MEDIA_UI_MESSAGES.previousTitles(
                title,
              )}
              accessibilityState={{ disabled: atStart }}
              disabled={atStart}
              onPress={() => scroll(-1)}
              style={({ pressed }) => [
                styles.arrow,
                styles.previous,
                (atStart || pressed) && styles.dimmed,
              ]}
            >
              <View style={styles.control}>
                <ThemedText accessible={false} style={styles.chevron}>
                  {'<'}
                </ThemedText>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={MEDIA_UI_MESSAGES.nextTitles(title)}
              accessibilityState={{ disabled: atEnd }}
              disabled={atEnd}
              onPress={() => scroll(1)}
              style={({ pressed }) => [
                styles.arrow,
                styles.next,
                (atEnd || pressed) && styles.dimmed,
              ]}
            >
              <View style={styles.control}>
                <ThemedText accessible={false} style={styles.chevron}>
                  {'>'}
                </ThemedText>
              </View>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  heading: {
    fontWeight: '700',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
  },
  previous: {
    left: 0,
  },
  next: {
    right: 0,
  },
  control: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chevron: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  dimmed: {
    opacity: 0.5,
  },
  content: {
    paddingHorizontal: Spacing.three,
  },
  separator: {
    width: Spacing.two,
  },
});
