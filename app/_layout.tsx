import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '../src/theme/ThemeProvider';

/**
 * Root layout. The theme lands here in B1; i18n and the database follow in B3
 * and B5.
 *
 * `<ThemeProvider>` takes no `scheme` prop, so it follows `useColorScheme()`.
 * There is no toggle: the mockup has none and CLAUDE.md 4.4 keeps it that way.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
