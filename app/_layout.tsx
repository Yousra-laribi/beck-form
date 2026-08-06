import { Stack } from 'expo-router';

/**
 * Root layout. Theme, i18n and database providers land here in later batches
 * (B1, B3, B5). It stays deliberately bare until they exist.
 */
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
