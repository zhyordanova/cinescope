import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { Platform, StyleSheet } from 'react-native';

import { Spacing, Typography } from '@/constants/theme';

import { DetailsInformationSkeleton } from './DetailsInformationSkeleton';

jest.mock('@/global.css', () => ({}));

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

describe('DetailsInformationSkeleton', () => {
  it('composes Story and Production with three and five rows', async () => {
    await render(<DetailsInformationSkeleton fontScale={1} />);

    expect(
      screen.getAllByTestId('details-skeleton-story-row'),
    ).toHaveLength(3);

    expect(
      screen.getAllByTestId('details-skeleton-production-row'),
    ).toHaveLength(5);
  });

  it.each([1, 2])(
    'scales eight overview lines by %i and shortens the last line',
    async (fontScale) => {
      await render(
        <DetailsInformationSkeleton fontScale={fontScale} />,
      );

      const lines = screen.getAllByTestId(
        'details-skeleton-overview-line',
      );

      expect(lines).toHaveLength(8);

      for (const [index, line] of lines.entries()) {
        expect(StyleSheet.flatten(line.props.style)).toMatchObject({
          height: Typography.lineHeights.body * fontScale,
          justifyContent: 'center',
        });

        expect(
          StyleSheet.flatten(line.props.children.props.style),
        ).toMatchObject({
          height: Typography.fontSizes.body * fontScale,
          width: index === 7 ? '65%' : '100%',
        });
      }
    },
  );

  it.each(['ios', 'android'] as const)(
    'uses compact spacing without a desktop title on %s',
    async (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);
      await render(<DetailsInformationSkeleton fontScale={1} />);

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-skeleton-information').props
            .style,
        ),
      ).toEqual({
        gap: Spacing.xxl,
      });

      expect(
        screen.queryByTestId('details-skeleton-desktop-title'),
      ).toBeNull();
    },
  );

  it.each([1, 2])(
    'preserves Web selectors and desktop title scaling at %i',
    async (fontScale) => {
      jest.replaceProperty(Platform, 'OS', 'web');
      await render(
        <DetailsInformationSkeleton fontScale={fontScale} />,
      );

      const information = screen.getByTestId(
        'details-skeleton-information',
      );

      const title = screen.getByTestId(
        'details-skeleton-desktop-title',
      );

      expect(information.props.dataSet).toEqual({
        detailsSkeletonRight: '',
      });

      expect(information.props.style).toBe(false);
      expect(title.props.dataSet).toEqual({
        detailsSkeletonDesktopTitle: '',
      });

      expect(StyleSheet.flatten(title.props.style)).toMatchObject({
        width: '80%',
        height: Typography.lineHeights.title.desktop * fontScale,
      });
    },
  );
});
