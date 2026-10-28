import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';
import { useColorScheme } from 'react-native';

import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider value={theme}>
      <QueryProvider>
        <Stack screenOptions={{ headerTransparent: false }}>
          <Stack.Screen
            name="index"
            options={{ title: 'CineScope' }}
          />
          <Stack.Screen
            name="media/[id]"
            options={{ title: 'Media Details' }}
          />
        </Stack>
      </QueryProvider>
    </ThemeProvider>
  );
}
