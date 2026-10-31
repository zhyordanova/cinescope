import { DarkTheme, Stack, ThemeProvider } from 'expo-router';

import { Colors } from '@/constants/theme';
import { QueryProvider } from '@/providers/QueryProvider';

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.accent,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.error,
  },
};

export default function RootLayout() {
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
