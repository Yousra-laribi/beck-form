import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FACES } from '../src/theme/police';
import { ThemeProvider } from '../src/theme/ThemeProvider';

/**
 * Root layout. The theme lands here in B1, the faces in this hygiene batch;
 * i18n and the database follow in B3 and B5.
 *
 * `<ThemeProvider>` takes no `scheme` prop, so it follows `useColorScheme()`.
 * There is no toggle: the mockup has none and CLAUDE.md 4.4 keeps it that way.
 *
 * The render is gated on the faces so no frame is painted in the platform
 * fallback and then reflowed — Karla sets about 9% wider than Roboto at the
 * same size, so that reflow would be visible, not subtle.
 *
 * It is gated on `erreur` too, deliberately. A face that fails to load must
 * degrade to the platform family, never to a screen that stays blank forever:
 * this app holds the only copy of someone's records, and a permanently empty
 * first screen reads as data loss. The error is not logged — health rule 6
 * keeps app-level logging off, and a font failure says nothing a redbox in
 * development would not already say.
 */
export default function RootLayout() {
  const [chargees, erreur] = useFonts(FACES);

  if (!chargees && !erreur) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
