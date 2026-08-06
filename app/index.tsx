import { Text, View } from 'react-native';

/**
 * Placeholder for the journal route.
 *
 * B6 replaces this with the real screen reading from SQLite. It carries no
 * styling on purpose: there is no `tokens.ts` yet, and hardcoding colours here
 * would be the first crack in the rule the harness exists to hold.
 */
export default function JournalRoute() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <Text style={{ fontSize: 16, textAlign: 'center' }}>
        Foundations only — the journal arrives in batch B6.
      </Text>
    </View>
  );
}
