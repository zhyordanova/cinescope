import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { FlatList, Platform } from 'react-native';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native/pure';

import {
  MEDIA_TYPE_LABELS,
  MEDIA_UI_MESSAGES,
} from '../constants/mediaUiMessages';
import {
  movieSummary,
  seriesSummary,
} from '../test-utils/mediaFixtures';
import type { MediaSummary } from '../types/media.types';

import { MediaRow } from './MediaRow';

const collectionTitle = 'Beyond Reality';

jest.mock('@/global.css', () => ({}));
jest.mock('expo-image', () => ({
  Image:
    jest.requireActual<typeof import('react-native')>('react-native')
      .View,
}));

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

async function renderRow(
  items: readonly MediaSummary[] = [movieSummary, seriesSummary],
  onMediaPress: (id: string) => void = jest.fn(),
) {
  return render(
    <MediaRow
      title={collectionTitle}
      items={items}
      onMediaPress={onMediaPress}
    />,
  );
}

describe('MediaRow web controls', () => {
  it('does not show web controls on native even when content overflows', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    await renderRow();

    const list = screen.getByLabelText(collectionTitle);

    await fireEvent(list, 'layout', {
      nativeEvent: {
        layout: { width: 200, height: 300, x: 0, y: 0 },
      },
    });

    await fireEvent(list, 'contentSizeChange', 600, 300);

    expect(
      screen.queryByRole('button', {
        name: MEDIA_UI_MESSAGES.nextTitles(collectionTitle),
      }),
    ).toBeNull();
  });

  async function renderWebRow() {
    jest.replaceProperty(Platform, 'OS', 'web');
    await renderRow();

    const list = screen.getByLabelText(collectionTitle);

    await fireEvent(list, 'layout', {
      nativeEvent: {
        layout: { width: 200, height: 300, x: 0, y: 0 },
      },
    });

    await fireEvent(list, 'contentSizeChange', 600, 300);

    return list;
  }

  it('scrolls by a viewport width and disables controls at each boundary', async () => {
    const scrollToOffset = jest
      .spyOn(FlatList.prototype, 'scrollToOffset')
      .mockImplementation(() => {});

    const list = await renderWebRow();

    expect(screen.getByText('<')).toBeTruthy();
    expect(screen.getByText('>')).toBeTruthy();

    expect(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.previousTitles(collectionTitle),
        disabled: true,
      }),
    ).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.nextTitles(collectionTitle),
      }),
    );

    expect(scrollToOffset).toHaveBeenLastCalledWith({
      offset: 200,
      animated: true,
    });

    await fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: 350, y: 0 },
        contentSize: { width: 600, height: 300 },
        layoutMeasurement: { width: 200, height: 300 },
      },
    });

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.nextTitles(collectionTitle),
      }),
    );
    expect(scrollToOffset).toHaveBeenLastCalledWith({
      offset: 400,
      animated: true,
    });

    await fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: 400, y: 0 },
        contentSize: { width: 600, height: 300 },
        layoutMeasurement: { width: 200, height: 300 },
      },
    });

    expect(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.nextTitles(collectionTitle),
        disabled: true,
      }),
    ).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.previousTitles(collectionTitle),
      }),
    );

    expect(scrollToOffset).toHaveBeenLastCalledWith({
      offset: 200,
      animated: true,
    });
  });

  it('hides controls when the content fits after resizing', async () => {
    const list = await renderWebRow();

    expect(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.nextTitles(collectionTitle),
      }),
    ).toBeTruthy();

    await fireEvent(list, 'layout', {
      nativeEvent: {
        layout: { width: 700, height: 300, x: 0, y: 0 },
      },
    });

    expect(
      screen.queryByRole('button', {
        name: MEDIA_UI_MESSAGES.nextTitles(collectionTitle),
      }),
    ).toBeNull();

    expect(
      screen.queryByRole('button', {
        name: MEDIA_UI_MESSAGES.previousTitles(collectionTitle),
      }),
    ).toBeNull();
  });
});

describe('MediaRow', () => {
  it('renders the collection heading and real cards in the supplied order', async () => {
    await renderRow([seriesSummary, movieSummary]);

    expect(
      screen.getByRole('header', { name: collectionTitle }),
    ).toBeTruthy();

    expect(
      screen
        .getAllByRole('button')
        .map((card) => card.props.accessibilityLabel),
    ).toEqual([
      MEDIA_UI_MESSAGES.openMedia(
        seriesSummary.title,
        seriesSummary.type,
        seriesSummary.year,
      ),

      MEDIA_UI_MESSAGES.openMedia(
        movieSummary.title,
        movieSummary.type,
        movieSummary.year,
      ),
    ]);

    expect(screen.getByText(MEDIA_TYPE_LABELS.movie)).toBeTruthy();
    expect(screen.getByText(MEDIA_TYPE_LABELS.series)).toBeTruthy();
  });

  it('passes only the selected IMDb ID to the parent', async () => {
    const onMediaPress = jest.fn();

    await renderRow(undefined, onMediaPress);

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.openMedia(
          seriesSummary.title,
          seriesSummary.type,
          seriesSummary.year,
        ),
      }),
    );

    expect(onMediaPress).toHaveBeenCalledTimes(1);
    expect(onMediaPress).toHaveBeenCalledWith(seriesSummary.id);
  });

  it('renders no cards for empty items without triggering an action', async () => {
    const onMediaPress = jest.fn();

    await renderRow([], onMediaPress);

    expect(
      screen.getByRole('header', { name: collectionTitle }),
    ).toBeTruthy();

    expect(screen.queryAllByRole('button')).toEqual([]);
    expect(onMediaPress).not.toHaveBeenCalled();
  });
});
