import { Children, type ReactElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import RootLayout from './app/_layout';

jest.mock('@/global.css', () => ({}));

describe('RootLayout screen headers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    { platform: 'ios', headerShown: true },
    { platform: 'android', headerShown: true },
    { platform: 'web', headerShown: false },
  ] as const)(
    'configures the Details header for $platform',
    ({ platform, headerShown }) => {
      jest.replaceProperty(Platform, 'OS', platform);

      const root = RootLayout() as ReactElement<{
        children: ReactNode;
      }>;

      const queryProvider = Children.only(
        root.props.children,
      ) as ReactElement<{ children: ReactNode }>;

      const stack = Children.only(
        queryProvider.props.children,
      ) as ReactElement<{ children: ReactNode }>;

      const screens = Children.toArray(
        stack.props.children,
      ) as ReactElement<{
        name: string;
        options: Record<string, unknown>;
      }>[];

      expect(screens.map(({ props }) => props)).toEqual([
        { name: 'index', options: { headerShown: false } },
        {
          name: 'media/[id]',
          options: {
            title: '',
            headerShown,
            headerBackButtonDisplayMode: 'minimal',
          },
        },
      ]);
    },
  );
});
