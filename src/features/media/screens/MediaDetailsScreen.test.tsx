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
} from '@testing-library/react-native/pure';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  useCanGoBack,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { MEDIA_ERROR_MESSAGES } from '../constants/mediaErrorMessages';
import {
  MEDIA_TYPE_LABELS,
  MEDIA_UI_MESSAGES,
} from '../constants/mediaUiMessages';
import { mediaQueryKeys } from '../queries/media.queries';
import { omdbFailure } from '../test-utils/omdbFixtures';
import { setupOmdbTestEnvironment } from '../test-utils/omdbTestEnvironment';
import { UNEXPECTED_FETCH_MESSAGE } from '../test-utils/testMessages';

import MediaDetailsScreen from './MediaDetailsScreen';

jest.mock('expo-router', () => ({
  useCanGoBack: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/global.css', () => ({}));

jest.mock(
  'react-native-safe-area-context',
  () =>
    jest.requireActual<
      typeof import('react-native-safe-area-context/jest/mock')
    >('react-native-safe-area-context/jest/mock').default,
);

setupOmdbTestEnvironment();

const router = {
  back: jest.fn(),
  replace: jest.fn(),
  canGoBack: jest.fn(() => false),
};

const movie = {
  Response: 'True',
  imdbID: 'tt0133093',
  Title: 'The Matrix',
  Type: 'movie',
  Year: '1999',
  Genre: 'Action, Sci-Fi',
  Runtime: '136 min',
  imdbRating: '8.7',
  Plot: 'A programmer discovers the truth about his world.',
};

let client: QueryClient;

async function renderDetails() {
  return render(
    <QueryClientProvider client={client}>
      <MediaDetailsScreen />
    </QueryClientProvider>,
  );
}

function respond(body: unknown) {
  return new Response(JSON.stringify(body));
}

function deferredResponse() {
  return Promise.withResolvers<Response>();
}

beforeEach(() => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error(UNEXPECTED_FETCH_MESSAGE));

  client = new QueryClient();

  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ id: movie.imdbID });

  jest.mocked(useCanGoBack).mockReturnValue(false);

  jest.mocked(useRouter).mockReturnValue({
    ...jest.requireActual<typeof import('expo-router')>('expo-router')
      .router,
    ...router,
  });

  router.canGoBack.mockReturnValue(false);
});

afterEach(async () => {
  await cleanup();
  client.clear();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('MediaDetailsScreen', () => {
  it.each([undefined, 'invalid', ['tt0133093', 'tt0903747']])(
    'rejects invalid route input without fetching: %p',
    async (id) => {
      jest
        .mocked(useLocalSearchParams)
        .mockReturnValue(id === undefined ? {} : { id });

      const fetchMock = jest.spyOn(globalThis, 'fetch');

      await renderDetails();

      expect(
        screen.getByRole('header', {
          name: MEDIA_UI_MESSAGES.details.invalidIdTitle,
        }),
      ).toBeTruthy();

      expect(screen.getByRole('alert')).toBeTruthy();

      expect(
        screen.getByText(MEDIA_ERROR_MESSAGES.invalidId),
      ).toBeTruthy();

      expect(
        screen.queryByRole('button', {
          name: MEDIA_UI_MESSAGES.retry,
        }),
      ).toBeNull();

      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('renders loading followed by live mapped movie metadata', async () => {
    const response = deferredResponse();

    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(response.promise);

    await renderDetails();

    expect(
      screen.getByText(MEDIA_UI_MESSAGES.details.loading),
    ).toBeTruthy();

    expect(screen.queryByText(movie.Title)).toBeNull();

    await act(async () => response.resolve(respond(movie)));

    expect(
      await screen.findByRole('header', { name: movie.Title }),
    ).toBeTruthy();

    expect(screen.getByText(MEDIA_TYPE_LABELS.movie)).toBeTruthy();
    expect(
      screen.getByText(MEDIA_UI_MESSAGES.details.year(movie.Year)),
    ).toBeTruthy();

    expect(
      screen.getByText(
        MEDIA_UI_MESSAGES.details.genres(['Action', 'Sci-Fi']),
      ),
    ).toBeTruthy();

    expect(
      screen.getByText(MEDIA_UI_MESSAGES.details.runtime(136)),
    ).toBeTruthy();

    expect(
      screen.getByText(MEDIA_UI_MESSAGES.details.imdbRating(8.7)),
    ).toBeTruthy();

    expect(screen.getByText(movie.Plot)).toBeTruthy();

    expect(
      screen.queryByText(MEDIA_UI_MESSAGES.details.loading),
    ).toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));

    expect(url.searchParams.get('i')).toBe(movie.imdbID);
  });

  it.each([
    ['series', MEDIA_TYPE_LABELS.series, true],
    ['movie', MEDIA_TYPE_LABELS.movie, false],
    ['episode', MEDIA_TYPE_LABELS.episode, false],
  ] as const)(
    'shows the %s label and seasons only for a series',
    async (type, label, showsSeasons) => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          respond({ ...movie, Type: type, totalSeasons: '5' }),
        );

      await renderDetails();

      await screen.findByRole('header', { name: movie.Title });

      expect(screen.getByText(label)).toBeTruthy();

      if (showsSeasons) {
        expect(
          screen.getByText(MEDIA_UI_MESSAGES.details.seasons(5)),
        ).toBeTruthy();
      } else {
        expect(
          screen.queryByText(MEDIA_UI_MESSAGES.details.seasons(5)),
        ).toBeNull();
      }
    },
  );

  it('omits unavailable metadata and provides a plot fallback', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      respond({
        ...movie,
        Type: 'series',
        Year: 'N/A',
        Genre: 'N/A',
        Runtime: 'N/A',
        imdbRating: 'N/A',
        Plot: 'N/A',
        totalSeasons: 'N/A',
      }),
    );

    await renderDetails();

    expect(
      await screen.findByText(
        MEDIA_UI_MESSAGES.details.plotUnavailable,
      ),
    ).toBeTruthy();

    expect(
      screen.queryByText(
        /Year:|Genres:|Runtime:|IMDb rating:|Seasons:/,
      ),
    ).toBeNull();

    expect(screen.queryByText(/N\/A/)).toBeNull();
  });

  it('surfaces an API failure and recovers after manual retry', async () => {
    const retryResponse = deferredResponse();

    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(respond(omdbFailure))
      .mockReturnValueOnce(retryResponse.promise);

    await renderDetails();

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(omdbFailure.Error)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await fireEvent.press(
      screen.getByRole('button', { name: MEDIA_UI_MESSAGES.retry }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await act(async () => retryResponse.resolve(respond(movie)));

    await screen.findByRole('header', { name: movie.Title });

    expect(screen.queryByRole('alert')).toBeNull();

    expect(
      screen.queryByRole('button', { name: MEDIA_UI_MESSAGES.retry }),
    ).toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('preserves cached metadata when a background refresh fails', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(respond(movie))
      .mockResolvedValueOnce(
        respond({
          Response: 'False',
          Error: 'Request limit reached!',
        }),
      );

    await renderDetails();
    await screen.findByRole('header', { name: movie.Title });

    await act(async () => {
      await client.invalidateQueries({
        queryKey: mediaQueryKeys.details(movie.imdbID),
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.getByText('Request limit reached!')).toBeTruthy();
    });

    expect(
      screen.getByRole('header', { name: movie.Title }),
    ).toBeTruthy();

    expect(
      screen.getByRole('button', { name: MEDIA_UI_MESSAGES.retry }),
    ).toBeTruthy();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uses Back when history is available', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    jest.mocked(useCanGoBack).mockReturnValue(true);

    router.canGoBack.mockReturnValue(true);

    await renderDetails();

    await fireEvent.press(
      screen.getByRole('button', { name: MEDIA_UI_MESSAGES.goBack }),
    );

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('returns direct entries to Home without adding a route', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    await renderDetails();

    await fireEvent.press(
      screen.getByRole('button', { name: MEDIA_UI_MESSAGES.goHome }),
    );

    expect(router.replace).toHaveBeenCalledWith('/');
    expect(router.back).not.toHaveBeenCalled();
  });

  it('checks current history at press time', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    jest.mocked(useCanGoBack).mockReturnValue(true);

    await renderDetails();

    await fireEvent.press(
      screen.getByRole('button', { name: MEDIA_UI_MESSAGES.goBack }),
    );

    expect(router.replace).toHaveBeenCalledWith('/');
    expect(router.back).not.toHaveBeenCalled();
  });
});
