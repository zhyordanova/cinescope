import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  render,
  within,
} from '@testing-library/react-native/pure';
import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';

import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';

import { BehindTheStory } from './BehindTheStory';

jest.mock('@/global.css', () => ({}));

afterEach(cleanup);

describe('BehindTheStory', () => {
  it('renders available credits as a definition list', async () => {
    const { getByTestId, getByRole } = await render(
      <BehindTheStory
        director="Director Name"
        writer="Writer Name"
        actors="Actor One, Actor Two"
      />,
    );

    expect(
      getByRole('header', {
        name: MEDIA_UI_MESSAGES.details.behindTheStoryTitle,
      }),
    ).toBeTruthy();

    const section = getByTestId('details-behind-the-story');
    const directorRow = getByTestId('details-credit-director');

    const directorLabel = within(directorRow).getByText(
      MEDIA_UI_MESSAGES.details.directorLabel,
    );

    const directorValue =
      within(directorRow).getByText('Director Name');

    expect(within(section).getByText('Writer Name')).toBeTruthy();

    expect(
      within(section).getByText('Actor One, Actor Two'),
    ).toBeTruthy();

    expect(
      StyleSheet.flatten(directorLabel.props.style),
    ).toMatchObject({
      color: Colors.textSecondary,
      width: 96,
    });

    expect(
      StyleSheet.flatten(directorValue.props.style),
    ).toMatchObject({
      color: Colors.textPrimary,
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
    });
  });

  it('hides unavailable credits and the section when all are missing', async () => {
    const { queryByTestId, queryByText, rerender } = await render(
      <BehindTheStory
        director="Director Name"
        writer={null}
        actors="Actor Name"
      />,
    );

    expect(queryByTestId('details-credit-writer')).toBeNull();

    expect(
      queryByText(MEDIA_UI_MESSAGES.details.writerLabel),
    ).toBeNull();

    await rerender(
      <BehindTheStory director={null} writer={null} actors={null} />,
    );

    expect(queryByTestId('details-behind-the-story')).toBeNull();
  });
});
