import { StyleSheet, View } from 'react-native';

import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface TrackProps {
  /** 0-10, the scale the records use. Clamped rather than trusted. */
  valeur: number;
  /** `tension` is the before rating, `apaise` the after. */
  ton: 'tension' | 'apaise';
  /** Read out by assistive tech in place of the bar. */
  label?: string;
}

const MAX = 10;

/**
 * The mini-delta bar on a journal card: how strongly a belief was held, before
 * and after. Two of these stacked are the whole "distance travelled" signal.
 */
export function Track({ valeur, ton, label }: TrackProps) {
  const { c } = useTheme();
  const borne = Math.min(MAX, Math.max(0, valeur));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: MAX, now: borne }}
      style={[styles.piste, { backgroundColor: c.rail }]}
    >
      <View
        style={[styles.remplissage, { width: `${(borne / MAX) * 100}%`, backgroundColor: c[ton] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  piste: { flex: 1, height: 4, borderRadius: radius.fin, overflow: 'hidden' },
  remplissage: { height: '100%', borderRadius: radius.fin },
});
