import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface FooterProps {
  children: ReactNode;
}

/**
 * The pinned action bar, with the mockup's fade from `papier` to `papier-0`.
 *
 * The fade matters: content scrolls under the footer, and without it the text
 * is cut by a hard edge. `--papier-0` is `papier` at zero alpha, so the
 * gradient dissolves rather than washing to white — which is why it is a token
 * and not `transparent`.
 */
export function Footer({ children }: FooterProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.pied}>
      <LinearGradient
        colors={[c.papier0, c.papier]}
        locations={[0, 0.32]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.contenu, { paddingBottom: insets.bottom + space.s18 }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  pied: { flexShrink: 0 },
  contenu: { paddingTop: space.s14, paddingHorizontal: space.s22 },
});
