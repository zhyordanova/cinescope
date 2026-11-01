import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

import { DetailsTextSection } from './DetailsTextSection';

jest.mock('@/global.css', () => ({}));

afterEach(cleanup);

describe('DetailsTextSection', () => {
  it('renders an accessible heading and body with section spacing', async () => {
    await render(
      <DetailsTextSection
        testID="details-test-section"
        title="Overview"
        text="A complete description."
      />,
    );

    expect(
      screen.getByRole('header', { name: 'Overview' }),
    ).toBeTruthy();

    expect(screen.getByText('A complete description.')).toBeTruthy();
    
    expect(
      StyleSheet.flatten(
        screen.getByTestId('details-test-section').props.style,
      ).gap,
    ).toBe(Spacing.sm);
  });
});
