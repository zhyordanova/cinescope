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
- The starter tab components and Explore route remain in the
  repository but are not part of the primary navigation flow.

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

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
