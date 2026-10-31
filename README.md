# CineScope

CineScope is an Expo, React Native, and TypeScript media discovery
app. Home displays curated and live OMDb Search collections in a
vertical list of horizontal media rows. Selecting a card opens live
OMDb Details through the Home → Media Details → Back flow.

## Phase 4 collection foundation

[Collection definitions](./src/features/media/constants/mediaCollections.ts)
configure Beyond Reality, Batman on Screen, Journeys & Discoveries,
and Holiday Magic (OMDb search term `Christmas`) in that order on Home.

Beyond Reality uses eight local
[`MediaSummary` snapshots](./src/features/media/data/beyondRealityMedia.ts) from OMDb
Details responses validated on October 29, 2026, alternating Movie and
Series in the approved order. Only summary fields and remote poster URLs
are stored; images are not bundled. URLs passed format validation, not
image-download verification. These snapshots are static and may need
future maintenance; they must not seed the live Details query cache or
trigger Details requests on Home.

The three Search definitions allow movies and series and cap each row
at ten cards.
[`useMediaCollection`](./src/features/media/hooks/useMediaCollection.ts)
fetches Search collections using page 1 without a type filter, reusing
the existing Search hook, query keys, caching, cancellation, and retries.
It exposes derived `items` alongside the original query state and
`refetch`: items are undefined before data is available, and an empty
array means a successful response has no eligible cards. Selection
does not modify the cached Search result. Each collection has an
independent lifecycle; curated snapshots do not use this hook.
[Selection rules](./src/features/media/utils/selectCollectionItems.ts)
filter allowed types, deduplicate IMDb IDs within a collection (first
eligible occurrence wins), then apply the limit, preserving order.
Missing posters and years do not exclude an otherwise eligible card.
The same title may appear in different collections. These are title-based
collections, not genre, popularity, or trending rankings.

Hook integration tests use mocked Fetch with the real data layer to
verify loading, selection, empty results, errors and manual retry,
shared-cache reuse, and exactly three initial Search requests with no
Details requests. Run
`npm test -- --runInBand src/features/media/hooks/useMediaCollection.test.tsx`.

[`SearchMediaSection`](./src/features/media/components/SearchMediaSection.tsx)
connects each Search collection to a presentational media row with
independent loading, error, empty, and retry states. Cached cards stay
visible if a background refresh fails. With an empty cache and no
retries, mounting all Home sections makes three Search requests and
no Details requests. The temporary navigation counter and mock titles
have been removed.

Home integration tests cover collection order, independent states and
retry, cached-data refresh errors, episode exclusion, request counts,
and ID-only navigation. Run
`npm test -- --runInBand src/features/media/screens/HomeScreen.test.tsx`.
Browser validation with mocked OMDb data confirmed movie and series
Details navigation, the screen Back action, and browser-history Back.
In the tested desktop flow, returning from series Details preserved
Home's vertical offset (772px) and the Holiday Magic row's horizontal
offset (152px). A 390px-wide web viewport showed a partial next card
without page-level horizontal overflow; arrow controls reached the
end and supported keyboard activation.
These checks do not establish native behavior: Android system Back,
iOS swipe-back, native swipe scrolling, font scaling, and scroll
preservation still require device verification.

On web, overflowing media rows offer accessible left/right arrow overlays
at the sides of each list, rather than text buttons beside the heading,
that scroll by one viewport width and disable at the start/end.
Controls are hidden when all cards fit; native rows retain swipe
scrolling without these buttons. Mouse and keyboard control movement
and boundary states have been verified in the browser.

## Current navigation

Media screen/component text and accessibility-label formatters live in
[mediaUiMessages.ts](./src/features/media/constants/mediaUiMessages.ts).
Collection titles remain in collection configuration, and API error
messages remain separate from UI copy.
Component and screen tests reuse these messages for text queries;
colocated message tests use literal expectations to independently verify
dynamic formatting and optional-year accessibility labels.

Retry and Back actions share
[ThemedButton](./src/components/themed-button.tsx), which provides
consistent themed styling, button accessibility, and disabled behavior.
Media cards remain separate.

- [Home route](./src/app/index.tsx) renders the feature-owned
  [HomeScreen](./src/features/media/screens/HomeScreen.tsx).
- [Details route](./src/app/media/[id].tsx) renders the shared
  [MediaDetailsScreen](./src/features/media/screens/MediaDetailsScreen.tsx).
- Only the IMDb ID is passed to `/media/[id]`. Details validates the
  format and fetches live metadata through `useMediaDetails`.
- Details supports loading, API errors, and manual retry. Missing
  optional metadata is omitted; absent plots have a text fallback.
  Movie, series, and episode labels are supported, and seasons are
  shown only for series when available.
- Invalid IDs do not trigger requests. Direct entry without Stack
  history offers a Home action. Home cards use cached remote posters
  with a fallback; Details poster UI remains deferred.

## Startup

The native splash screen is configured in [app.json](./app.json)
using `expo-splash-screen` and its existing image. Expo handles its
dismissal automatically; there is no additional animated Expo-logo
overlay or manual startup delay.

## Validation

Run `npm run check` for TypeScript, ESLint, and Prettier validation.

The Phase 4 validation run passed all 219 Jest tests, TypeScript, and
ESLint. The full `npm run check` remains blocked by a Prettier warning
in [themed-button.test.tsx](./src/components/themed-button.test.tsx);
that unrelated file was left unchanged.

## Data contracts and tests

The first data-layer increment adds OMDb response contracts, runtime
validation, domain models in
[types](./src/features/media/types), and pure mappers with colocated
tests in [mappers](./src/features/media/mappers). It does not make API
requests or change the mock navigation screens.

- Search and Details responses are validated from `unknown`.
- Missing/invalid identity fields cause an explicit response error.
- Optional unavailable or malformed metadata is normalized to `null`
  (or an empty genres array). Poster URLs must use HTTP or HTTPS.
- `year` preserves a single year or a complete/open series year range
  as text; unavailable or malformed years become `null`.
- The data layer recognizes movies, series, and episodes without Home
  filtering or any curated collection strategy.
- OMDb failures remain distinct from invalid payloads and successful
  empty searches.

Run `npm test -- --runInBand` for the Jest suite, or
`npm test -- --runInBand src/features/media/mappers/media.mapper.test.ts`
for the validation/mapping tests. Test fixtures require no API key.
`npm run check` does not run tests; run both commands when validating
data-layer changes.

Fetch-using test suites reject unexpected requests by default.
Tests explicitly configure mocked responses; they do not call OMDb.

Details screen integration tests use React Native Testing Library,
the real query/repository/mapper chain, and mocked Fetch and navigation.
They cover route validation, loading, metadata, errors and retry,
cached-data refresh failures, and Back/Home actions without a real key.
Run `npm test -- --runInBand src/features/media/screens/MediaDetailsScreen.test.tsx`.
Jest discovers both `.test.ts` and `.test.tsx` files. Native gestures
and actual navigation history still require device verification.

## OMDb requests and configuration

The [API layer](./src/features/media/api) provides native Fetch
transport and the `searchMedia` / `getMediaDetails` repository
functions. These return mapped domain data, not raw OMDb responses.

1. Obtain a key at https://www.omdbapi.com/apikey.aspx and activate it
   using the email OMDb sends.
2. Copy [.env.example](./.env.example) to `.env.local` and set your own
   `EXPO_PUBLIC_OMDB_API_KEY`. Local environment files are Git-ignored.
3. Restart Expo after changing the value and fully reload the app.

`EXPO_PUBLIC_` values are included in the client bundle and are not
secrets. Never commit a real key or paste it into logs or screenshots.
No key is required for automated tests or the curated Home row.
Live Search collections and Details require a configured key.
Key activation and real API connectivity must be verified separately;
mocked tests do not establish either.

- Search accepts an optional single `type`, a four-digit integer
  `year`, and `page` from 1 to 100. Omitting `type` allows mixed
  results, including episodes; no Home filtering is performed.
- Details accepts an IMDb title ID and requests the full plot.
- Both accept an optional `signal` and preserve cancellation.
- Invalid inputs and missing keys fail before a request is sent.
- Transport errors distinguish HTTP status, network/body-read
  failures, and invalid JSON. Raw URLs and transport error messages
  are not included in the application errors.
- Mappers distinguish OMDb application failures from invalid response
  structures; neither becomes an empty successful result.
- Application-owned data-layer error messages live in
  [mediaErrorMessages.ts](./src/features/media/constants/mediaErrorMessages.ts). OMDb's own
  error text is handled separately.
- The repository itself has no retries or caching and makes no
  per-card detail requests.

Run `npm test -- --runInBand src/features/media/api` for the mocked
request, parameter, failure, and cancellation tests.

## Query lifecycle

[QueryProvider](./src/providers/QueryProvider.tsx) creates a stable
client for the mounted app. The reusable
[hooks](./src/features/media/hooks) use shared
[query options](./src/features/media/queries/media.queries.ts):

- Search keys include trimmed text, type, year, and page. An omitted
  page and page 1 share a cache entry. Details keys use the IMDb ID.
  Neither contains the API key.
- Search results stay fresh for 5 minutes; inactive entries are
  retained for 10 minutes. Details uses 10 and 30 minutes respectively.
  Becoming stale does not itself trigger a request.
- Identical concurrent queries share a request. Query cancellation
  forwards TanStack Query's signal to the repository and Fetch.
- Network/body-read failures and HTTP 5xx responses retry at most
  twice using TanStack Query's default exponential delay. Other HTTP,
  configuration, input, JSON, OMDb, and response validation errors do
  not retry. Unrelated queries default to no retries.
- Empty searches and invalid Details IDs are disabled for automatic
  fetching; callers must render their own input/route validation states.

Run `npm test -- --runInBand src/features/media/queries/media.queries.test.ts`
for query lifecycle tests, which use mocked Fetch without real keys.
Native focus/connectivity integration is not configured in this increment.
Details uses the query hook; Home still uses fixtures. Live Home
integration and collection strategy remain deferred.

## Manual navigation verification

With the app running and an activated OMDb key configured:

1. On Home, increment the navigation-check counter.
2. Open **The Matrix (Movie)** and confirm the title, type, and
   `tt0133093` ID. Use **Go back** and confirm the counter is unchanged.
3. Scroll to **House of the Dragon (Series)** and open it. Confirm
   `tt11198330`, then return using the Stack header Back control.
   Confirm the Home scroll position and counter are preserved.
4. Repeat using Android system Back and iOS swipe-back on a device
   or simulator. Web testing does not verify native Back behavior.
5. In a fresh browser tab, directly open `/media/tt0903747`.
   Confirm **Breaking Bad (Series)** renders and **Go to Home**
   returns to `/` when there is no Stack history.
6. Directly open `/media/invalid` and `/media/tt0000000`.
   Confirm **Invalid media ID** (without an API request) and an OMDb
   error with a **Retry** action respectively. Both retain a working
   return action.
7. Check a narrow viewport and increased text size for readable
   titles and accessible controls.
8. Test Details with a slow connection and then offline. Confirm
   loading and error feedback, restore connectivity, and use **Retry**.
   A fresh cached title may render without a request; use another ID
   or reload with an empty cache to exercise the initial failure state.
9. Verify missing optional metadata does not render `N/A`, a series
   displays seasons when available, and a movie does not.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Routes live in [src/app](./src/app) and screen implementations live
in [src/features/media/screens](./src/features/media/screens).
