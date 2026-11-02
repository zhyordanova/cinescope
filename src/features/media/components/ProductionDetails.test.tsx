import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  within,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

import { ProductionDetails } from './ProductionDetails';

jest.mock('@/global.css', () => ({}));

afterEach(cleanup);

describe('ProductionDetails', () => {
  it('renders production metadata with Box Office last and secondary', async () => {
    const { getByTestId, getByRole } = await render(
      <ProductionDetails
        mediaType="movie"
        released="31 March 1999"
        rated="R"
        country="United States"
        language="English"
        boxOffice="$171,479,930"
      />,
    );

    expect(
      getByRole('header', {
        name: MEDIA_UI_MESSAGES.details.productionDetailsTitle,
      }),
    ).toBeTruthy();

    const list = getByTestId('details-production-details-list');

    expect(
      within(getByTestId('details-credit-released')).getByText(
        '31 March 1999',
      ),
    ).toBeTruthy();

    expect(
      within(getByTestId('details-credit-rated')).getByText('R'),
    ).toBeTruthy();

    expect(
      within(getByTestId('details-credit-country')).getByText(
        'United States',
      ),
    ).toBeTruthy();

    expect(
      within(getByTestId('details-credit-language')).getByText(
        'English',
      ),
    ).toBeTruthy();

    const boxOfficeRow = getByTestId('details-credit-box office');

    expect(
      within(boxOfficeRow).getByText('$171,479,930'),
    ).toBeTruthy();

    expect(
      StyleSheet.flatten(
        within(boxOfficeRow).getByText('$171,479,930').props.style,
      ).color,
    ).toBe(Colors.textSecondary);

    expect(
      within(list)
        .getAllByTestId(/^details-credit-/)
        .at(-1),
    ).toBe(boxOfficeRow);
  });

  it('hides unavailable rows and hides the section when empty', async () => {
    const { getByTestId, queryByTestId, queryByRole, rerender } =
      await render(
        <ProductionDetails
          mediaType="movie"
          released={null}
          rated="PG-13"
          country={null}
          language="English"
          boxOffice={null}
        />,
      );

    expect(getByTestId('details-credit-rated')).toBeTruthy();
    expect(getByTestId('details-credit-language')).toBeTruthy();
    expect(queryByTestId('details-credit-released')).toBeNull();
    expect(queryByTestId('details-credit-country')).toBeNull();
    expect(queryByTestId('details-credit-box office')).toBeNull();

    await rerender(
      <ProductionDetails
        mediaType="movie"
        released={null}
        rated={null}
        country={null}
        language={null}
        boxOffice={null}
      />,
    );

    expect(queryByTestId('details-production-details')).toBeNull();

    expect(
      queryByRole('header', {
        name: MEDIA_UI_MESSAGES.details.productionDetailsTitle,
      }),
    ).toBeNull();
  });

  it('shows Box Office only for movies', async () => {
    const { getByTestId, queryByTestId, rerender } = await render(
      <ProductionDetails
        mediaType="series"
        released={null}
        rated={null}
        country={null}
        language={null}
        boxOffice="$171,479,930"
      />,
    );

    expect(queryByTestId('details-production-details')).toBeNull();
    expect(queryByTestId('details-credit-box office')).toBeNull();

    await rerender(
      <ProductionDetails
        mediaType="movie"
        released={null}
        rated={null}
        country={null}
        language={null}
        boxOffice="$171,479,930"
      />,
    );

    expect(getByTestId('details-credit-box office')).toBeTruthy();
  });
});
