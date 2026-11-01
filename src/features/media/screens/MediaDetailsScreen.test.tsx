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
import { Platform, StyleSheet } from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useCanGoBack, useLocalSearchParams } from 'expo-router';

import { useResponsiveWidth } from '@/hooks/use-responsive-width';
import { Breakpoints, Spacing } from '@/constants/theme';

import { MEDIA_ERROR_MESSAGES } from '../constants/mediaErrorMessages';
import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import { mediaQueryKeys } from '../queries/media.queries';
import {
  omdbFailure,
  omdbMovieDetails as movie,
} from '../test-utils/omdbFixtures';
import { setupOmdbTestEnvironment } from '../test-utils/omdbTestEnvironment';
import { UNEXPECTED_FETCH_MESSAGE } from '../test-utils/testMessages';

import MediaDetailsScreen from './MediaDetailsScreen';

jest.mock('expo-router', () => ({
  ...jest.requireActual<typeof import('expo-router')>('expo-router'),
  useCanGoBack: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/global.css', () => ({}));

jest.mock('@/hooks/use-responsive-width', () => ({
  useResponsiveWidth: jest.fn(),
}));

jest.mock('expo-image', () => ({
  Image:
    jest.requireActual<typeof import('react-native')>('react-native')
      .View,
}));

jest.mock('expo-symbols', () => ({
  SymbolView:
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
  jest.mocked(useCanGoBack).mockReturnValue(true);
  jest.mocked(useResponsiveWidth).mockReturnValue(390);

  jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error(UNEXPECTED_FETCH_MESSAGE));

  client = new QueryClient();

  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ id: movie.imdbID });
});

afterEach(async () => {
  await cleanup();
  client.clear();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('MediaDetailsScreen', () => {
  it.each([
    { platform: 'ios', hasHistory: false },
    { platform: 'ios', hasHistory: true },
    { platform: 'android', hasHistory: false },
    { platform: 'android', hasHistory: true },
  ] as const)(
    'shows the native Home fallback only without history on $platform ($hasHistory)',
    async ({ platform, hasHistory }) => {
      jest.replaceProperty(Platform, 'OS', platform);
      jest.mocked(useCanGoBack).mockReturnValue(hasHistory);
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(respond(movie));

      await renderDetails();
      await screen.findByRole('header', { name: movie.Title });

      const homeLink = screen.queryByRole('link', {
        name: MEDIA_UI_MESSAGES.details.goHome,
      });

      if (hasHistory) {
        expect(homeLink).toBeNull();
      } else {
        expect(homeLink).not.toBeNull();
        expect(homeLink?.props.href).toBe('/');
      }
    },
  );

  it.each(['ios', 'android'] as const)(
    'keeps Home available for an invalid native deep link on %s',
    async (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);
      jest.mocked(useCanGoBack).mockReturnValue(false);
      jest
        .mocked(useLocalSearchParams)
        .mockReturnValue({ id: 'invalid' });

      const fetchMock = jest.spyOn(globalThis, 'fetch');

      await renderDetails();

      expect(screen.getByRole('alert')).toBeTruthy();

      expect(
        screen.getByRole('link', {
          name: MEDIA_UI_MESSAGES.details.goHome,
        }),
      ).toBeTruthy();
      
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each(['ios', 'android'] as const)(
    'keeps Home available after a native deep-link request fails on %s',
    async (platform) => {
      jest.replaceProperty(Platform, 'OS', platform);
      jest.mocked(useCanGoBack).mockReturnValue(false);
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(respond(omdbFailure));

      await renderDetails();
      await screen.findByRole('alert');

      expect(
        screen.getByRole('link', {
          name: MEDIA_UI_MESSAGES.details.goHome,
        }),
      ).toBeTruthy();
    },
  );

  it.each([
    { platform: 'ios', width: 390, direction: 'column' },
    { platform: 'web', width: 800, direction: 'column' },
    { platform: 'web', width: 1200, direction: 'row' },
  ] as const)(
    'uses a $direction details layout at $width px on $platform',
    async ({ platform, width, direction }) => {
      jest.replaceProperty(Platform, 'OS', platform);
      jest.mocked(useResponsiveWidth).mockReturnValue(width);
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(respond(movie));

      await renderDetails();

      await screen.findByRole('header', { name: movie.Title });

      expect(
        screen.getByTestId('details-scroll-view').props
          .showsVerticalScrollIndicator,
      ).toBe(platform !== 'web');

      if (platform === 'web') {
        expect(
          screen.getByRole('link', {
            name: MEDIA_UI_MESSAGES.details.goHome,
          }),
        ).toBeTruthy();
      } else {
        expect(
          screen.queryByRole('link', {
            name: MEDIA_UI_MESSAGES.details.goHome,
          }),
        ).toBeNull();
      }

      const contentStyle = StyleSheet.flatten(
        screen.getByTestId('details-scroll-view').props
          .contentContainerStyle,
      );

      if (platform === 'web' && width >= Breakpoints.desktop) {
        expect(contentStyle.paddingTop).toBe(Spacing.lg);
      } else {
        expect(contentStyle.padding).toBe(Spacing.lg);
      }

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-layout').props.style,
        ).flexDirection,
      ).toBe(direction);

      expect(
        StyleSheet.flatten(
          screen.getByTestId('details-layout').props.style,
        ).gap,
      ).toBe(direction === 'row' ? Spacing.xxl : Spacing.md);

      const informationColumn = screen.getByTestId(
        'details-information-column',
      );

      expect(
        StyleSheet.flatten(informationColumn.props.style).gap,
      ).toBe(direction === 'row' ? Spacing.xl : Spacing.xxl);

      if (direction === 'row') {
        expect(
          within(informationColumn).getByTestId(
            'details-media-title',
          ),
        ).toBeTruthy();
      } else {
        expect(
          screen.getByTestId('details-media-title'),
        ).toBeTruthy();

        expect(
          within(informationColumn).queryByTestId(
            'details-media-title',
          ),
        ).toBeNull();
      }

      const posterColumn = screen.getByTestId(
        'details-poster-column',
      );

      expect(StyleSheet.flatten(posterColumn.props.style).gap).toBe(
        direction === 'row' ? Spacing.lg : Spacing.md,
      );
    },
  );

  it('keeps long mobile titles complete and naturally scalable', async () => {
    const longTitle = 'Homeward Bound: The Incredible Journey';
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respond({ ...movie, Title: longTitle }));

    await renderDetails();

    const title = await screen.findByRole('header', {
      name: longTitle,
    });

    expect(title.props.numberOfLines).toBeUndefined();
    expect(title.props.allowFontScaling).not.toBe(false);
  });

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
    jest.replaceProperty(Platform, 'OS', 'ios');
    jest.mocked(useResponsiveWidth).mockReturnValue(390);

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

    expect(
      within(screen.getByTestId('details-poster-column')).getByTestId(
        'details-poster-frame',
      ),
    ).toBeTruthy();

    expect(
      screen.getByTestId('details-media-type-chip'),
    ).toBeTruthy();

    expect(
      within(screen.getByTestId('details-metadata')).getByText(
        movie.Year,
      ),
    ).toBeTruthy();
    expect(
      within(screen.getByTestId('details-genres')).getByText(
        'Action · Sci-Fi',
      ),
    ).toBeTruthy();

    expect(
      screen.getByRole('header', {
        name: MEDIA_UI_MESSAGES.details.overviewTitle,
      }),
    ).toBeTruthy();

    expect(screen.getByText(movie.Plot)).toBeTruthy();

    const informationColumn = screen.getByTestId(
      'details-information-column',
    );

    const behindTheStory = within(informationColumn).getByTestId(
      'details-behind-the-story',
    );

    const productionDetails = within(informationColumn).getByTestId(
      'details-production-details',
    );
    expect(behindTheStory).toBeTruthy();
    expect(productionDetails).toBeTruthy();

    const informationHeaders = within(informationColumn)
      .getAllByRole('header')
      .map(({ props }) => props.children);

    expect(
      informationHeaders.indexOf(
        MEDIA_UI_MESSAGES.details.overviewTitle,
      ),
    ).toBeLessThan(
      informationHeaders.indexOf(
        MEDIA_UI_MESSAGES.details.behindTheStoryTitle,
      ),
    );

    expect(
      informationHeaders.indexOf(
        MEDIA_UI_MESSAGES.details.behindTheStoryTitle,
      ),
    ).toBeLessThan(
      informationHeaders.indexOf(
        MEDIA_UI_MESSAGES.details.productionDetailsTitle,
      ),
    );

    expect(
      informationHeaders.indexOf(
        MEDIA_UI_MESSAGES.details.productionDetailsTitle,
      ),
    ).toBeLessThan(
      informationHeaders.indexOf(
        MEDIA_UI_MESSAGES.details.awardsTitle,
      ),
    );

    expect(
      screen.getByRole('header', {
        name: MEDIA_UI_MESSAGES.details.awardsTitle,
      }),
    ).toBeTruthy();

    expect(
      screen.getByText(
        'Won 4 Oscars. 42 wins & 51 nominations total',
      ),
    ).toBeTruthy();

    expect(
      screen.getByRole('header', {
        name: MEDIA_UI_MESSAGES.details.criticsRatingsTitle,
      }),
    ).toBeTruthy();

    const ratingsSection = screen.getByTestId(
      'details-critics-ratings',
    );

    expect(
      within(screen.getByTestId('details-poster-column')).getByTestId(
        'details-critics-ratings',
      ),
    ).toBe(ratingsSection);

    const headerNames = screen
      .getAllByRole('header')
      .map(({ props }) => props.children);

    expect(
      headerNames.indexOf(
        MEDIA_UI_MESSAGES.details.criticsRatingsTitle,
      ),
    ).toBeLessThan(
      headerNames.indexOf(MEDIA_UI_MESSAGES.details.overviewTitle),
    );
    expect(
      screen.queryByText(MEDIA_UI_MESSAGES.details.loading),
    ).toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));

    expect(url.searchParams.get('i')).toBe(movie.imdbID);
  });

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
        Director: 'N/A',
        Writer: 'N/A',
        Actors: 'N/A',
        Released: 'N/A',
        Rated: 'N/A',
        Country: 'N/A',
        Language: 'N/A',
        Awards: 'N/A',
        Ratings: 'N/A',
        Metascore: 'N/A',
        BoxOffice: 'N/A',
      }),
    );

    await renderDetails();

    expect(
      await screen.findByText(
        MEDIA_UI_MESSAGES.details.plotUnavailable,
      ),
    ).toBeTruthy();

    expect(
      screen.getByRole('header', {
        name: MEDIA_UI_MESSAGES.details.overviewTitle,
      }),
    ).toBeTruthy();

    expect(screen.queryByTestId('details-metadata')).toBeNull();
    expect(screen.queryByTestId('details-awards')).toBeNull();

    expect(
      screen.queryByTestId('details-critics-ratings'),
    ).toBeNull();
    expect(screen.queryByText(/N\/A/)).toBeNull();
  });

  it('hides unavailable production rows and awards independently', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      respond({
        ...movie,
        Released: 'N/A',
        Rated: 'PG-13',
        Country: 'N/A',
        Language: 'English',
        Awards: 'N/A',
      }),
    );

    await renderDetails();

    await screen.findByRole('header', { name: movie.Title });

    expect(screen.queryByTestId('details-awards')).toBeNull();
  });

  it('hides the critics section when no supported ratings are available', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      respond({
        ...movie,
        imdbRating: 'N/A',
        Ratings: [{ Source: 'Unknown Source', Value: '99%' }],
        Metascore: 'N/A',
      }),
    );

    await renderDetails();

    await screen.findByRole('header', { name: movie.Title });

    expect(
      screen.queryByTestId('details-critics-ratings'),
    ).toBeNull();
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
});
