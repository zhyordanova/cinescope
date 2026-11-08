import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';

import { DetailsCreditSectionSkeleton } from './DetailsCreditSectionSkeleton';

jest.mock('@/global.css', () => ({}));

afterEach(async () => {
  await cleanup();
});

describe('DetailsCreditSectionSkeleton', () => {
  it.each([
    { testID: 'details-skeleton-story', rows: 3 },
    { testID: 'details-skeleton-production', rows: 5 },
  ])(
    'renders $rows label/value rows for $testID',
    async ({ testID, rows }) => {
      await render(
        <DetailsCreditSectionSkeleton
          testID={testID}
          rows={rows}
          fontScale={1}
        />,
      );

      expect(screen.getAllByTestId(`${testID}-row`)).toHaveLength(
        rows,
      );

      expect(
        StyleSheet.flatten(screen.getByTestId(testID).props.style),
      ).toMatchObject({
        gap: Spacing.md,
      });
    },
  );

  it.each([1, 2])(
    'scales placeholder heights by %i without changing row geometry',
    async (fontScale) => {
      await render(
        <DetailsCreditSectionSkeleton
          testID="credits"
          rows={3}
          fontScale={fontScale}
        />,
      );

      const rows = screen.getAllByTestId('credits-row');

      expect(
        StyleSheet.flatten(
          screen.getByTestId('credits-title').props.style,
        ),
      ).toMatchObject({
        width: '35%',
        height: Typography.lineHeights.small * fontScale,
        backgroundColor: Colors.surface,
      });

      for (const [index, row] of rows.entries()) {
        expect(StyleSheet.flatten(row.props.style)).toMatchObject({
          flexDirection: 'row',
          gap: Spacing.sm,
        });

        const [label, value] = row.props.children;

        expect(StyleSheet.flatten(label.props.style)).toMatchObject({
          width: 96,
          height: Typography.lineHeights.small * fontScale,
          backgroundColor: Colors.surface,
        });

        expect(StyleSheet.flatten(value.props.style)).toMatchObject({
          flex: 1,
          minWidth: 0,
          height: Typography.lineHeights.body * fontScale,
          backgroundColor: Colors.surface,
        });

        expect(StyleSheet.flatten(value.props.style).flexGrow).toBe(
          index % 2 === 0 ? 0.65 : undefined,
        );
      }
    },
  );
});
