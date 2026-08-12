import Svg, { Path } from 'react-native-svg';

import { ICONES, type IconeId } from '../icons/registry';
import { icone, type Couleurs } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

/** Icon colour is semantic: it names a role, never a value. */
export type TonIcone = Extract<
  keyof Couleurs,
  'encre' | 'encre2' | 'encre3' | 'surEncre' | 'tension' | 'apaise' | 'garde'
>;

export interface IconProps {
  nom: IconeId;
  /** 16 for inline marks, 20 default, 24 for a heading. */
  taille?: number;
  ton?: TonIcone;
  /** Screen-reader label. Omit for an icon that only repeats adjacent text. */
  label?: string;
}

/**
 * One stroke set for all 22 glyphs: 24-unit box, 1.6 stroke, round joins.
 *
 * The mockup draws these with `stroke: currentColor` and lets CSS inheritance
 * colour them. React Native has no inheritance for SVG, so the role is passed
 * explicitly — the same discipline, made visible at the call site.
 */
export function Icon({ nom, taille = icone.normal, ton = 'encre3', label }: IconProps) {
  const { c } = useTheme();

  return (
    <Svg
      width={taille}
      height={taille}
      viewBox={`0 0 ${icone.viewBox} ${icone.viewBox}`}
      fill="none"
      stroke={c[ton]}
      strokeWidth={icone.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      aria-hidden={label ? undefined : true}
    >
      {ICONES[nom].map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
