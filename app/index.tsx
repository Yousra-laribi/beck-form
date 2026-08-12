import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { space } from '../src/theme/tokens';
import { Button, Screen, Text } from '../src/ui';

/**
 * Placeholder for the journal route.
 *
 * B6 replaces this with the real screen reading from SQLite. It now renders
 * through the primitives rather than raw React Native, so the theme, the type
 * scale and the safe-area frame are exercised by the one live route as well as
 * by the gallery.
 */
export default function JournalRoute() {
  return (
    <Screen>
      <View style={styles.centre}>
        <Text variante="etiquette">B1 — design system</Text>
        <Text variante="titre" style={styles.bloc}>
          Foundations only
        </Text>
        <Text variante="corps" style={styles.bloc}>
          The journal arrives in batch B6, reading real records from SQLite.
        </Text>
        {__DEV__ ? (
          <Link href="/galerie" asChild style={styles.lien}>
            <Button titre="Galerie des primitives" variante="discret" />
          </Link>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, justifyContent: 'center' },
  bloc: { marginTop: space.s8 },
  lien: { marginTop: space.s24 },
});
