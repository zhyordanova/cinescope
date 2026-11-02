import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native/pure';

import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

jest.mock('@/global.css', () => ({}));

afterEach(async () => {
  await cleanup();
});

describe('shared UI states', () => {
  it('renders empty copy without an error or retry action', async () => {
    await render(
      <EmptyState
        title="No titles available"
        description="Nothing to display."
      />,
    );

    expect(
      screen.getByRole('header', { name: 'No titles available' }),
    ).toBeTruthy();

    expect(
      screen.getByText('Nothing to display.').props
        .accessibilityLiveRegion,
    ).toBe('polite');

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('announces an error and supports a contextual retry name with visible copy', async () => {
    const onRetry = jest.fn();

    await render(
      <ErrorState
        title="Couldn't load this collection"
        description="Please try again."
        actionLabel="Try Again"
        actionAccessibilityLabel="Try Again: Batman"
        isRetrying={false}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert').props.children).toBe(
      "Couldn't load this collection",
    );

    expect(screen.getByText('Please try again.')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Try Again: Batman' }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('prevents repeated retries while a request is in flight', async () => {
    const onRetry = jest.fn();

    const props = {
      title: 'Unable to load',
      description: 'Please try again.',
      onRetry,
    };

    const { rerender } = await render(
      <ErrorState
        {...props}
        actionLabel="Trying Again…"
        isRetrying
      />,
    );

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Trying Again…',
        disabled: true,
      }),
    );

    expect(onRetry).not.toHaveBeenCalled();

    await rerender(
      <ErrorState
        {...props}
        actionLabel="Try Again"
        isRetrying={false}
      />,
    );

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Try Again',
        disabled: false,
      }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
