import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
  within,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

import { DetailsCreditSection } from './DetailsCreditSection';

jest.mock('@/global.css', () => ({}));

afterEach(cleanup);

describe('DetailsCreditSection', () => {
  it('renders the heading and rows with consistent section spacing', async () => {
    await render(
      <DetailsCreditSection
        testID="details-test-section"
        title="Test Details"
        credits={[
          { label: 'First', value: 'Value one' },
          null,
          {
            label: 'Second',
            value: 'Value two',
            mutedValue: true,
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('header', { name: 'Test Details' }),
    ).toBeTruthy();

    const section = screen.getByTestId('details-test-section');
    const list = screen.getByTestId('details-test-section-list');

    expect(StyleSheet.flatten(section.props.style).gap).toBe(
      Spacing.md,
    );

    expect(StyleSheet.flatten(list.props.style).gap).toBe(Spacing.md);
    expect(within(list).getByText('Value one')).toBeTruthy();
    expect(within(list).getByText('Value two')).toBeTruthy();

    expect(
      within(list).getAllByTestId(/^details-credit-/),
    ).toHaveLength(2);
  });

  it('omits the section when no credit rows are available', async () => {
    const { queryByTestId, queryByRole } = await render(
      <DetailsCreditSection
        testID="details-test-section"
        title="Test Details"
        credits={[null, null]}
      />,
    );

    expect(queryByTestId('details-test-section')).toBeNull();

    expect(
      queryByRole('header', { name: 'Test Details' }),
    ).toBeNull();
  });
});
