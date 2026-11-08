import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';

import { MEDIA_TYPE_LABELS } from '../../constants/mediaUiMessages';
import type { MediaType } from '../../types/media.types';

import { MediaTypeBadge } from './MediaTypeBadge';

jest.mock('@/global.css', () => ({}));

afterEach(cleanup);

describe('MediaTypeBadge', () => {
  it.each(Object.entries(MEDIA_TYPE_LABELS) as [MediaType, string][])(
    'renders the %s label in both variants',
    async (mediaType, label) => {
      const poster = await render(
        <MediaTypeBadge mediaType={mediaType} variant="poster" />,
      );

      expect(screen.getByTestId('media-type-badge')).toBeTruthy();
      expect(screen.getByText(label)).toBeTruthy();

      expect(
        StyleSheet.flatten(
          screen.getByTestId('media-type-badge').props.style,
        ),
      ).toMatchObject({
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        borderRadius: Radii.poster / 2,
        backgroundColor: 'rgba(11, 15, 25, 0.78)',
      });

      expect(
        screen.getByTestId('media-type-badge').props.pointerEvents,
      ).toBe('none');

      await poster.unmount();

      await render(
        <MediaTypeBadge mediaType={mediaType} variant="details" />,
      );

      expect(
        screen.getByTestId('details-media-type-chip'),
      ).toBeTruthy();

      expect(screen.getByText(label)).toBeTruthy();

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-media-type-chip').props.style,
        ),
      ).toMatchObject({
        alignSelf: 'flex-start',
        backgroundColor: Colors.surfaceElevated,
        borderColor: Colors.border,
        borderRadius: Radii.surface,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
      });
    },
  );
});
