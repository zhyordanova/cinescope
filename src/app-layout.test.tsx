import { Children, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it, jest } from '@jest/globals';

import RootLayout from './app/_layout';

jest.mock('@/global.css', () => ({}));

describe('RootLayout screen headers', () => {
  it('hides the Stack header on Home but preserves the Details header', () => {
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
          title: 'Media Details',
          headerBackButtonDisplayMode: 'minimal',
        },
      },
    ]);
  });
});
