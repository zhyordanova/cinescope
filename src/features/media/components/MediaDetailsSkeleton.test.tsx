import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { Platform, StyleSheet } from 'react-native';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import { MediaDetailsSkeleton } from './MediaDetailsSkeleton';

jest.mock('@/global.css', () => ({}));

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

describe('MediaDetailsSkeleton', () => {
  it('announces one loading state and hides decorative content', async () => {
    await render(<MediaDetailsSkeleton />);

    expect(
      screen.getByRole('progressbar', {
        name: MEDIA_UI_MESSAGES.details.loading,
      }).props.accessibilityState,
    ).toEqual({ busy: true });

    expect(
      screen.queryByTestId('details-skeleton-poster'),
    ).toBeNull();

    expect(
      screen.getByTestId('details-skeleton-title', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    expect(
      screen.getByTestId('details-skeleton-ratings', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    expect(
      screen.getByTestId('details-skeleton-information', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    expect(
      screen.getByTestId('details-skeleton-badge', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it.each(['ios', 'android'] as const)(
    'uses a single column on %s',
    async (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);
      await render(<MediaDetailsSkeleton />);

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-skeleton-layout', {
            includeHiddenElements: true,
          }).props.style,
        ),
      ).toMatchObject({
        flexDirection: 'column',
      });
    },
  );

  it('leaves responsive Web geometry to initial HTML CSS', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');

    await render(<MediaDetailsSkeleton />);

    const layout = screen.getByTestId('details-skeleton-layout', {
      includeHiddenElements: true,
    });

    expect(layout.props.dataSet).toEqual({
      detailsSkeletonLayout: '',
    });

    expect(
      StyleSheet.flatten(layout.props.style).flexDirection,
    ).toBeUndefined();
  });
});
