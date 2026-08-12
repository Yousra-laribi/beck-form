import { Dimensions } from 'react-native';

import { typeFluide } from './tokens';

export type EchelleFluide = { min: number; vw: number; max: number };

/**
 * Reproduces CSS `clamp(min, Nvw, max)`.
 *
 * The mockup sizes `h1` and `.prompt` against the viewport. React Native has no
 * viewport unit, so the choice was between hardcoding one end of the range —
 * which loses the behaviour on small and large phones alike — and resolving the
 * three numbers at runtime. This does the latter: same three numbers, same
 * curve, read off `Dimensions` instead of the layout engine.
 */
export function fluide({ min, vw, max }: EchelleFluide, largeur?: number): number {
  const w = largeur ?? Dimensions.get('window').width;
  return Math.min(max, Math.max(min, (w * vw) / 100));
}

export const tailleHero = (largeur?: number) => fluide(typeFluide.hero, largeur);
export const tailleInvite = (largeur?: number) => fluide(typeFluide.pensee, largeur);
