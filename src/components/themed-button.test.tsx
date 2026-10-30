import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native/pure';

import { ThemedButton } from './themed-button';

jest.mock('@/global.css', () => ({}));

afterEach(async () => {
  await cleanup();
});

describe('ThemedButton', () => {
  it('exposes its label as the accessible name and handles presses', async () => {
    const onPress = jest.fn();

    await render(<ThemedButton label="Go back" onPress={onPress} />);

    await fireEvent.press(
      screen.getByRole('button', { name: 'Go back' }),
    );

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes disabled state and prevents presses until enabled', async () => {
    const onPress = jest.fn();
    const view = await render(
      <ThemedButton label="Retry" onPress={onPress} disabled />,
    );
    const disabledButton = screen.getByRole('button', {
      name: 'Retry',
      disabled: true,
    });

    await fireEvent.press(disabledButton);
    expect(onPress).not.toHaveBeenCalled();

    await view.rerender(
      <ThemedButton label="Retry" onPress={onPress} />,
    );

    await fireEvent.press(
      screen.getByRole('button', { name: 'Retry', disabled: false }),
    );

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
