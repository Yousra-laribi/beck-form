import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { radius, space } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface CardProps {
  children: ReactNode;
  /** Omit for a static card: it then renders a plain View, not a button. */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** `aide` is the recessed variant — contextual help, examples, notices. */
  fond?: 'carte' | 'aide';
  style?: ViewStyle;
}

export function Card({ children, onPress, accessibilityLabel, fond = 'carte', style }: CardProps) {
  const { c } = useTheme();
  const surface: ViewStyle = { backgroundColor: c[fond], borderColor: c.ligne };

  if (onPress === undefined) {
    return <View style={[styles.base, surface, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.base, surface, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.carte,
    paddingVertical: space.s16,
    paddingHorizontal: space.s16,
  },
});
