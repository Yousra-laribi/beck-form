import { Pressable, StyleSheet } from 'react-native';

import { radius, space, touch, type } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

export interface ChipProps {
  titre: string;
  actif?: boolean;
  onPress?: () => void;
}

/**
 * The emotion selector's pill.
 *
 * The mockup draws these at 8px/13px padding, which lands under the 44px touch
 * floor. The visible pill keeps the mockup's proportions; `hitSlop` carries the
 * target up to 44px without changing a single rendered pixel.
 */
export function Chip({ titre, actif = false, onPress }: ChipProps) {
  const { c } = useTheme();
  const marge = Math.max(0, (touch.min - (type.corps + space.s16)) / 2);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: actif }}
      hitSlop={{ top: marge, bottom: marge, left: 0, right: 0 }}
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: actif ? c.encre : c.carte,
          borderColor: actif ? c.encre : c.ligne,
        },
      ]}
    >
      <Text variante="corps" ton={actif ? 'surEncre' : 'encre2'}>
        {titre}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: space.s8,
    paddingHorizontal: space.s12,
    borderRadius: radius.pilule,
    borderWidth: 1,
  },
});
