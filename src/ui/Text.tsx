import {
  Text as RNText,
  useWindowDimensions,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { famille, type Graisse, type RolePolice } from '../theme/police';
import { fluide } from '../theme/fluide';
import { leading, tracking, type, typeFluide, type Couleurs } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

/** The text roles a caller may set. Graphic colours are not offered here. */
export type Ton = Extract<
  keyof Couleurs,
  'encre' | 'encre2' | 'encre3' | 'surEncre' | 'tensionTexte' | 'apaiseTexte' | 'gardeTexte'
>;

/**
 * The nine typographic roles the mockup actually uses, once its 24 font sizes
 * are collapsed onto the six-step scale in `tokens.ts`.
 */
export type Variante =
  | 'hero'
  | 'invite'
  | 'marque'
  | 'titre'
  | 'extrait'
  | 'corps'
  | 'legende'
  | 'etiquette'
  | 'chiffre'
  | 'bouton'
  | 'boutonDiscret';

export interface TextProps extends RNTextProps {
  variante?: Variante;
  /** Overrides the role's default colour. Text roles only, by construction. */
  ton?: Ton;
  style?: StyleProp<TextStyle>;
}

/**
 * Which face each role is set in.
 *
 * Held apart from `recettes()` because it is the one part of a recipe that does
 * not depend on the window width, and `RichText` needs it: an inline `**bold**`
 * inside a serif heading has to reach for the serif's weight, not the body's.
 */
export const ROLES = {
  hero: 'titre',
  invite: 'titre',
  marque: 'titre',
  titre: 'titre',
  extrait: 'titre',
  corps: 'corps',
  legende: 'corps',
  etiquette: 'mono',
  chiffre: 'mono',
  bouton: 'corps',
  boutonDiscret: 'corps',
} as const satisfies Record<Variante, RolePolice>;

type Recette = {
  role: RolePolice;
  taille: number;
  hauteur: keyof typeof leading;
  ton: Ton;
  /**
   * Selects the face, not a `fontWeight`. The bundled faces are one family per
   * weight (see `theme/police.ts` for why), so weight travels through the
   * family name and `fontWeight` is never set — setting both would ask Android
   * to synthesise a bold on top of an already-bold face.
   */
  graisse?: Graisse;
  suivi?: keyof typeof tracking;
  capitales?: boolean;
};

/**
 * `hero` and `invite` are viewport-relative in the mockup, so their size is
 * resolved per render against the window width rather than frozen at one end
 * of the clamp.
 */
function recettes(largeur: number): Record<Variante, Recette> {
  return {
    // h1
    hero: {
      role: 'titre',
      taille: fluide(typeFluide.hero, largeur),
      hauteur: 'serre',
      ton: 'encre',
      suivi: 'titre',
    },
    // .prompt — the question at the head of a step
    invite: {
      role: 'titre',
      taille: fluide(typeFluide.pensee, largeur),
      hauteur: 'titre',
      ton: 'encre',
    },
    // .hd-name — sits tight above .hd-sub, hence the 1.05 leading
    marque: { role: 'titre', taille: type.titre, hauteur: 'ras', ton: 'encre' },
    // .sec h3, .st-name, .sheet h2
    titre: { role: 'titre', taille: type.titre, hauteur: 'titre', ton: 'encre' },
    // .card-thought — the recorded thought, quoted back
    extrait: { role: 'titre', taille: type.large, hauteur: 'titre', ton: 'encre' },
    // the workhorse: .hint, .sec p, .facts li, .note p, .aide li
    corps: { role: 'corps', taille: type.corps, hauteur: 'lecture', ton: 'encre2' },
    // .safety, .dtell, .caption
    legende: { role: 'corps', taille: type.petit, hauteur: 'normal', ton: 'encre3' },
    // .eyebrow, .card-date, .hd-sub, .recap dt, .st-num
    etiquette: {
      role: 'mono',
      taille: type.micro,
      hauteur: 'normal',
      ton: 'encre3',
      suivi: 'capitales',
      capitales: true,
    },
    // .bascule-lbl .num, .gauge-val
    chiffre: { role: 'mono', taille: type.chiffre, hauteur: 'ras', ton: 'encre' },
    // .btn
    bouton: {
      role: 'corps',
      taille: type.large,
      hauteur: 'compact',
      ton: 'surEncre',
      graisse: 600,
    },
    // .btn.ghost — same size, one weight lighter. The mockup is explicit about
    // the difference; it was invisible until the real faces were bundled,
    // because nothing was loaded to render 500 and 600 differently.
    boutonDiscret: {
      role: 'corps',
      taille: type.large,
      hauteur: 'compact',
      ton: 'encre2',
      graisse: 500,
    },
  };
}

/**
 * Every glyph in the app goes through here.
 *
 * Components never name a font size, a line height or a colour: they name a
 * role. That is what keeps the six-step scale from silently growing back into
 * the mockup's 24 sizes.
 */
export function Text({ variante = 'corps', ton, style, ...rest }: TextProps) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const r = recettes(width)[variante];

  const resolu: TextStyle = {
    fontFamily: famille(r.role, r.graisse),
    fontSize: r.taille,
    // React Native takes an absolute line height; the scale stores multipliers.
    lineHeight: r.taille * leading[r.hauteur],
    color: c[ton ?? r.ton],
    // CSS letter-spacing is in em here; React Native wants px.
    ...(r.suivi ? { letterSpacing: tracking[r.suivi] * r.taille } : {}),
    ...(r.capitales ? { textTransform: 'uppercase' as const } : {}),
    ...(r.role === 'mono' ? { fontVariant: ['tabular-nums' as const] } : {}),
  };

  return <RNText {...rest} style={[resolu, style]} />;
}
