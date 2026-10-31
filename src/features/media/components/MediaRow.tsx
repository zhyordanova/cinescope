import { useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type FlatListProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  Colors,
  Sizing,
  Spacing,
  Typography,
} from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import type { MediaSummary } from '../types/media.types';

import { MediaCard } from './MediaCard';

type MediaRowProps = {
  title: string;
  items: readonly MediaSummary[];
  onMediaPress: (id: string) => void;
};

type ArrowControlProps = {
  direction: 'previous' | 'next';
  title: string;
  disabled: boolean;
  onPress: () => void;
};

function CardSeparator() {
  return <View style={styles.separator} />;
}

function ArrowControl({
  direction,
  title,
  disabled,
  onPress,
}: ArrowControlProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isWeb = Platform.OS === 'web';
  const isPrevious = direction === 'previous';
  const label = isPrevious
    ? MEDIA_UI_MESSAGES.previousTitles(title)
    : MEDIA_UI_MESSAGES.nextTitles(title);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={isWeb ? () => setHovered(true) : undefined}
      onHoverOut={isWeb ? () => setHovered(false) : undefined}
      onFocus={isWeb ? () => setFocused(true) : undefined}
      onBlur={isWeb ? () => setFocused(false) : undefined}
      style={({ pressed }) => [
        styles.arrow,
        isPrevious ? styles.previous : styles.next,
        disabled && styles.dimmed,
        pressed && styles.controlPressed,
      ]}
    >
      <View
        testID={`media-row-${direction}-control`}
        style={[
          styles.control,
          hovered && styles.controlHovered,
          focused && styles.controlFocused,
        ]}
      >
        <ThemedText accessible={false} style={styles.chevron}>
          {isPrevious ? '<' : '>'}
        </ThemedText>
      </View>
    </Pressable>
  );
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

  const webListEventProps: Pick<
    FlatListProps<MediaSummary>,
    | 'onLayout'
    | 'onContentSizeChange'
    | 'onScroll'
    | 'scrollEventThrottle'
  > = isWeb
    ? {
        onLayout: (event) =>
          setViewportWidth(event.nativeEvent.layout.width),
        onContentSizeChange: (width) => setContentWidth(width),
        onScroll: (event) =>
          setOffset(event.nativeEvent.contentOffset.x),
        scrollEventThrottle: 16,
      }
    : {};

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
          {...webListEventProps}
          renderItem={({ item }) => (
            <MediaCard
              media={item}
              onPress={() => onMediaPress(item.id)}
            />
          )}
        />
        {showControls && (
          <>
            <ArrowControl
              direction="previous"
              title={title}
              disabled={atStart}
              onPress={() => scroll(-1)}
            />
            <ArrowControl
              direction="next"
              title={title}
              disabled={atEnd}
              onPress={() => scroll(1)}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  heading: {
    fontWeight: Typography.fontWeights.bold,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
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
    width: Sizing.touchTarget,
    height: Sizing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizing.touchTarget / 2,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlHovered: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  controlFocused: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  controlPressed: {
    opacity: 0.8,
  },
  chevron: {
    color: Colors.textPrimary,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: Typography.fontWeights.bold,
  },
  dimmed: {
    opacity: 0.5,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  separator: {
    width: Spacing.sm,
  },
});
