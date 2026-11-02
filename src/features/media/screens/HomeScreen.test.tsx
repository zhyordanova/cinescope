import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native/pure';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { MEDIA_COLLECTIONS } from '../constants/mediaCollections';
import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import { mediaQueryKeys } from '../queries/media.queries';
import {
  omdbFailure,
  omdbEpisode,
  omdbMovie,
  omdbSeries,
} from '../test-utils/omdbFixtures';
import type { OmdbMediaSummary } from '../types/omdb.types';
import { UNEXPECTED_FETCH_MESSAGE } from '../test-utils/testMessages';
import { setupOmdbTestEnvironment } from '../test-utils/omdbTestEnvironment';

import HomeScreen from './HomeScreen';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('@/global.css', () => ({}));
jest.mock('expo-image', () => ({
  Image:
    jest.requireActual<typeof import('react-native')>('react-native')
      .View,
}));
jest.mock(
  'react-native-safe-area-context',
  () =>
    jest.requireActual<
      typeof import('react-native-safe-area-context/jest/mock')
    >('react-native-safe-area-context/jest/mock').default,
);

setupOmdbTestEnvironment();
const push = jest.fn();
let client: QueryClient;

function searchResponse(
  items: OmdbMediaSummary[] = [omdbMovie, omdbSeries, omdbEpisode],
) {
  return new Response(
    JSON.stringify({
      Response: 'True',
      Search: items,
      totalResults: String(items.length),
    }),
  );
}

function errorResponse() {
  return new Response(JSON.stringify(omdbFailure));
}

async function renderHome() {
  const result = await render(
    <QueryClientProvider client={client}>
      <HomeScreen />
    </QueryClientProvider>,
  );
  await fireEvent(
    screen.getByTestId('cinematic-banner-artwork', {
      includeHiddenElements: true,
    }),
    'display',
  );
  return result;
}

beforeEach(() => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error(UNEXPECTED_FETCH_MESSAGE));

  client = new QueryClient();

  jest.mocked(useRouter).mockReturnValue({
    ...jest.requireActual<typeof import('expo-router')>('expo-router')
      .router,
    push,
  });
});

afterEach(async () => {
  await cleanup();
  client.clear();
  jest.restoreAllMocks();
  push.mockClear();
});

describe('HomeScreen', () => {
  it('includes card sizing CSS once while loading and after collections load on Web', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const response = Promise.withResolvers<void>();
    jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      await response.promise;
      return searchResponse();
    });

    await renderHome();
    const expectOneCardStyle = () => {
      expect(
        screen.root?.queryAll(
          (node) =>
            node.type === 'style' &&
            node.props.dangerouslySetInnerHTML?.__html.includes(
              'width: clamp(120px',
            ),
        ),
      ).toHaveLength(1);
    };

    expect(screen.getAllByTestId('media-row-skeleton')).toHaveLength(
      3,
    );
    expectOneCardStyle();

    await act(async () => response.resolve());
    await waitFor(() => {
      expect(
        screen.queryAllByTestId('media-row-skeleton'),
      ).toHaveLength(0);
    });
    expectOneCardStyle();
  });

  it('reveals curated metadata after all initial searches settle and keeps it visible during retry', async () => {
    const batman = Promise.withResolvers<Response>();
    const journey = Promise.withResolvers<Response>();
    const retry = Promise.withResolvers<Response>();
    let journeyCalls = 0;
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input) => {
        const query = new URL(String(input)).searchParams.get('s');
        if (query === 'Batman') return batman.promise;
        if (query === 'Journey') {
          journeyCalls += 1;
          return journeyCalls === 1 ? journey.promise : retry.promise;
        }
        if (query === 'Christmas') return searchResponse([omdbMovie]);
        throw new Error(UNEXPECTED_FETCH_MESSAGE);
      });

    await renderHome();
    const title = () =>
      screen.getByText('Inception', { includeHiddenElements: true });
    expect(StyleSheet.flatten(title().props.style).opacity).toBe(0);
    expect(
      StyleSheet.flatten(
        within(
          screen.getByRole('button', {
            name: MEDIA_UI_MESSAGES.openMedia(
              'Inception',
              'movie',
              '2010',
            ),
          }),
        ).getByText('2010', { includeHiddenElements: true }).props
          .style,
      ).opacity,
    ).toBe(0);
    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.openMedia(
          'Inception',
          'movie',
          '2010',
        ),
      }),
    );
    expect(push).toHaveBeenCalledTimes(1);

    await act(async () => batman.resolve(searchResponse([])));
    expect(StyleSheet.flatten(title().props.style).opacity).toBe(0);
    await act(async () => journey.resolve(errorResponse()));
    await waitFor(() => {
      expect(
        StyleSheet.flatten(title().props.style).opacity,
      ).not.toBe(0);
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.collection.retry(
          MEDIA_COLLECTIONS[2].title,
        ),
      }),
    );
    await screen.findByRole('button', {
      name: MEDIA_UI_MESSAGES.collection.retrying(
        MEDIA_COLLECTIONS[2].title,
      ),
      disabled: true,
    });
    expect(StyleSheet.flatten(title().props.style).opacity).not.toBe(
      0,
    );
    await act(async () =>
      retry.resolve(searchResponse([omdbSeries])),
    );
    await screen.findByText(omdbSeries.Title);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('shows independent friendly failures with distinct retry controls when every search fails', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => errorResponse());

    await renderHome();

    await waitFor(() =>
      expect(screen.getAllByRole('alert')).toHaveLength(3),
    );

    for (const collection of MEDIA_COLLECTIONS) {
      expect(
        screen.getByRole('header', { name: collection.title }),
      ).toBeTruthy();

      if (collection.source === 'search') {
        expect(
          screen.getByRole('button', {
            name: MEDIA_UI_MESSAGES.collection.retry(
              collection.title,
            ),
          }),
        ).toBeTruthy();
      }
    }

    expect(
      screen.queryByText(omdbFailure.Error, { exact: false }),
    ).toBeNull();

    expect(
      screen.queryByText(MEDIA_UI_MESSAGES.collection.emptyTitle),
    ).toBeNull();

    expect(screen.queryByTestId('media-row-skeleton')).toBeNull();

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.openMedia(
          'Inception',
          'movie',
          '2010',
        ),
      }),
    );

    expect(push).toHaveBeenCalledWith({
      pathname: '/media/[id]',
      params: { id: 'tt1375666' },
    });
  });

  it('renders the approved order with three Search requests, no Details requests, and ID-only navigation', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () =>
        searchResponse([
          omdbEpisode,
          omdbMovie,
          omdbMovie,
          omdbSeries,
        ]),
      );
    await renderHome();

    await waitFor(() => {
      expect(screen.getAllByText(omdbMovie.Title)).toHaveLength(3);
    });

    expect(
      screen
        .getAllByRole('header')
        .map((header) => header.props.children),
    ).toEqual([
      MEDIA_UI_MESSAGES.home.bannerHeadline,
      ...MEDIA_COLLECTIONS.map((collection) => collection.title),
    ]);

    expect(screen.getByTestId('cinescope-logo').props).toMatchObject({
      accessibilityRole: 'image',
      accessibilityLabel: MEDIA_UI_MESSAGES.home.logoAccessibleLabel,
      contentFit: 'contain',
      source: require('../../../../assets/cinescope-logo.png'),
    });

    expect(screen.getByTestId('cinematic-banner')).toBeTruthy();

    expect(screen.getByText('Inception')).toBeTruthy();
    expect(screen.queryByText(omdbEpisode.Title)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const queries = fetchMock.mock.calls.map(([input]) => {
      const url = new URL(String(input));

      expect(url.searchParams.get('page')).toBe('1');
      expect(url.searchParams.has('type')).toBe(false);
      expect(url.searchParams.has('i')).toBe(false);
      return url.searchParams.get('s');
    });

    expect(queries.sort()).toEqual([
      'Batman',
      'Christmas',
      'Journey',
    ]);

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.openMedia(
          'Inception',
          'movie',
          '2010',
        ),
      }),
    );

    expect(push).toHaveBeenLastCalledWith({
      pathname: '/media/[id]',
      params: { id: 'tt1375666' },
    });

    await fireEvent.press(
      screen.getAllByRole('button', {
        name: MEDIA_UI_MESSAGES.openMedia(
          omdbSeries.Title,
          omdbSeries.Type,
          omdbSeries.Year ?? null,
        ),
      })[0]!,
    );

    expect(push).toHaveBeenLastCalledWith({
      pathname: '/media/[id]',
      params: { id: omdbSeries.imdbID },
    });

    expect(push).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('keeps curated and successful rows usable while other sections load or fail, and retries only the failed section', async () => {
    const batman = Promise.withResolvers<Response>();
    const journeyRetry = Promise.withResolvers<Response>();

    let journeyCalls = 0;

    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input) => {
        const query = new URL(String(input)).searchParams.get('s');
        if (query === 'Batman') return batman.promise;
        if (query === 'Journey') {
          journeyCalls += 1;
          return journeyCalls === 1
            ? errorResponse()
            : journeyRetry.promise;
        }

        if (query === 'Christmas') return searchResponse([omdbMovie]);

        throw new Error(UNEXPECTED_FETCH_MESSAGE);
      });

    await renderHome();

    await waitFor(() => {
      expect(screen.getByRole('alert').props.children).toBe(
        MEDIA_UI_MESSAGES.collection.errorTitle,
      );

      expect(screen.getByText(omdbMovie.Title)).toBeTruthy();
    });

    expect(
      screen.queryByText(omdbFailure.Error, { exact: false }),
    ).toBeNull();

    expect(
      screen.getByText(MEDIA_UI_MESSAGES.collection.errorDescription),
    ).toBeTruthy();

    expect(
      screen.getAllByRole('header', {
        name: MEDIA_COLLECTIONS[2].title,
      }),
    ).toHaveLength(1);

    expect(
      screen.getByRole('progressbar', {
        name: MEDIA_UI_MESSAGES.collection.loading(
          MEDIA_COLLECTIONS[1].title,
        ),
      }),
    ).toBeTruthy();

    expect(screen.getByText('Inception')).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.collection.retry(
          MEDIA_COLLECTIONS[2].title,
        ),
      }),
    );

    const retryButton = await screen.findByRole('button', {
      name: MEDIA_UI_MESSAGES.collection.retrying(
        MEDIA_COLLECTIONS[2].title,
      ),
      disabled: true,
    });

    expect(screen.getByRole('alert')).toBeTruthy();

    expect(
      screen.queryByRole('progressbar', {
        name: MEDIA_UI_MESSAGES.collection.loading(
          MEDIA_COLLECTIONS[2].title,
        ),
      }),
    ).toBeNull();

    await fireEvent.press(retryButton);
    expect(journeyCalls).toBe(2);

    await act(async () => {
      journeyRetry.resolve(searchResponse([omdbSeries]));
    });

    await waitFor(() => {
      expect(screen.getByText(omdbSeries.Title)).toBeTruthy();
    });

    expect(screen.queryByRole('alert')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(journeyCalls).toBe(2);

    expect(
      screen.getByRole('progressbar', {
        name: MEDIA_UI_MESSAGES.collection.loading(
          MEDIA_COLLECTIONS[1].title,
        ),
      }),
    ).toBeTruthy();

    await act(async () => {
      batman.resolve(searchResponse([omdbEpisode]));
    });

    await waitFor(() => {
      expect(
        screen.getByText(MEDIA_UI_MESSAGES.collection.empty),
      ).toBeTruthy();
    });

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByText(omdbEpisode.Title)).toBeNull();

    expect(
      screen.getByRole('header', {
        name: MEDIA_UI_MESSAGES.collection.emptyTitle,
      }),
    ).toBeTruthy();
  });

  it('keeps cached cards visible on refresh failure and disables retry while retrying', async () => {
    const batmanRetry = Promise.withResolvers<Response>();
    let batmanCalls = 0;
    jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input) => {
        const query = new URL(String(input)).searchParams.get('s');

        if (query === 'Batman') {
          batmanCalls += 1;

          if (batmanCalls === 2) return errorResponse();
          if (batmanCalls === 3) return batmanRetry.promise;

          return searchResponse([omdbMovie]);
        }

        if (query === 'Journey' || query === 'Christmas')
          return searchResponse([]);

        throw new Error(UNEXPECTED_FETCH_MESSAGE);
      });

    await renderHome();

    await waitFor(() => {
      expect(screen.getByText(omdbMovie.Title)).toBeTruthy();
    });

    await act(async () => {
      await client.invalidateQueries({
        queryKey: mediaQueryKeys.search('Batman'),
      });
    });

    expect(screen.getByText(omdbMovie.Title)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });

    expect(screen.queryByRole('progressbar')).toBeNull();

    await fireEvent.press(
      screen.getByRole('button', {
        name: MEDIA_UI_MESSAGES.collection.retry(
          MEDIA_COLLECTIONS[1].title,
        ),
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: MEDIA_UI_MESSAGES.collection.retrying(
            MEDIA_COLLECTIONS[1].title,
          ),
          disabled: true,
        }),
      ).toBeTruthy();
    });

    expect(screen.getByText(omdbMovie.Title)).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();

    await act(async () => {
      batmanRetry.resolve(searchResponse([omdbSeries]));
    });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.getByText(omdbSeries.Title)).toBeTruthy();
    });

    expect(screen.queryByText(omdbMovie.Title)).toBeNull();
    expect(batmanCalls).toBe(3);
  });
});
