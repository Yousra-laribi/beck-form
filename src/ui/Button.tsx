import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { radius, space, touch } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  titre: string;
  /** `principal` fills with `encre`; `discret` is the mockup's `.btn.ghost`. */
  variante?: 'principal' | 'discret';
  style?: ViewStyle;
}

export function Button({ titre, variante = 'principal', disabled, style, ...rest }: ButtonProps) {
  const { c } = useTheme();
  const principal = variante === 'principal';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          // 50px for a primary action, 44px otherwise — CLAUDE.md 4.4.
          minHeight: principal ? touch.principal : touch.min,
          paddingVertical: principal ? space.s14 : space.s10,
          backgroundColor: principal ? c.encre : 'transparent',
          borderColor: principal ? c.encre : 'transparent',
        },
        disabled ? styles.desactive : null,
        // The mockup's `transform:scale(.985)` on :active.
        pressed && !disabled ? styles.presse : null,
        style,
      ]}
      {...rest}
    >
      <Text variante="bouton" ton={principal ? 'surEncre' : 'encre2'} style={styles.titre}>
        {titre}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.s16,
    borderRadius: radius.carte,
    borderWidth: 1,
  },
  titre: { textAlign: 'center' },
  desactive: { opacity: 0.32 },
  presse: { transform: [{ scale: 0.985 }] },
});
