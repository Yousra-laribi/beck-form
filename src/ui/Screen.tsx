import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface ScreenProps {
  children: ReactNode;
  /** Pinned below the scroll area. Gets the footer fade — see `<Footer>`. */
  pied?: ReactNode;
  /** Off for a screen that manages its own scrolling. */
  defilable?: boolean;
  style?: ViewStyle;
}

/**
 * The app frame: `papier` ground, safe-area aware, `--pad` gutters.
 *
 * The mockup's `.screen` sets `padding: calc(env(safe-area-inset-top) + 20px)
 * var(--pad) 0` — the top inset is added to the gutter rather than replacing
 * it, so the same arithmetic is used here.
 */
export function Screen({ children, pied, defilable = true, style }: ScreenProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const contenu = (
    <View style={[styles.gouttiere, { paddingTop: insets.top + space.s20 }, style]}>{children}</View>
  );

  return (
    <View style={[styles.app, { backgroundColor: c.papier }]}>
      {defilable ? (
        <ScrollView
          style={styles.zone}
          contentContainerStyle={styles.contenuDefilant}
          showsVerticalScrollIndicator={false}
        >
          {contenu}
        </ScrollView>
      ) : (
        <View style={styles.zone}>{contenu}</View>
      )}
      {pied}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1 },
  zone: { flex: 1 },
  contenuDefilant: { flexGrow: 1 },
  gouttiere: { flex: 1, paddingHorizontal: space.s22 },
});
