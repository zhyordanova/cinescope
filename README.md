# CineScope

CineScope is an Expo, React Native, and TypeScript media discovery
app. The current increment implements Home → Media Details → Back
using temporary movie and series fixtures. OMDb integration and the
production discovery UI are not implemented yet.

## Current navigation

- [Home route](./src/app/index.tsx) renders the feature-owned
  [HomeScreen](./src/features/media/screens/HomeScreen.tsx).
- [Details route](./src/app/media/[id].tsx) renders the shared
  [MediaDetailsScreen](./src/features/media/screens/MediaDetailsScreen.tsx).
- Only the IMDb ID is passed to `/media/[id]`. Details validates the
  format and looks up a local fixture, without making API requests.
- Invalid IDs and valid-format IDs absent from the fixtures have
  separate, recoverable states. Direct entry without Stack history
  offers a Home action.

## Startup

The native splash screen is configured in [app.json](./app.json)
using `expo-splash-screen` and its existing image. Expo handles its
dismissal automatically; there is no additional animated Expo-logo
overlay or manual startup delay.

## Navigation verification

Run `npm run check` for TypeScript, ESLint, and Prettier validation.
There is no automated unit test runner configured yet.

With the app running:

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
   Confirm **Invalid media ID** and **Mock title unavailable**
   respectively, with a working return action in each state.
7. Check a narrow viewport and increased text size for readable
   titles and accessible controls. No API key is needed for this flow.

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
