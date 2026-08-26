import { en } from './en';
import { fr } from './fr';
import { LANGUES, type Langue } from './types';

export { LANGUES, EMOTION_IDS, EFFECTIFS } from './types';
export type { Langue, EmotionId, Fait, Choix, EntreeTour, Etape, Lecture, PackBase } from './types';
export { MARQUES, MOTIFS, marques, contientHtml, type Marque } from './marques';
export { analyser, dateCourte, dateLongue, aujourdhuiIso } from './format';

/** The two packs, by code. `fr` is the source of truth for the key set. */
export const PACKS = { fr, en } as const satisfies Record<Langue, typeof fr>;

export type Pack = typeof fr;

/** The pack for a language. */
export function pack(langue: Langue): Pack {
  return PACKS[langue];
}

/**
 * Whether a string is one of the two language codes.
 *
 * Used where a value arrives from outside the type system — a stored
 * preference, a device locale — and must not be trusted to be a `Langue`.
 */
export function estLangue(valeur: string): valeur is Langue {
  return (LANGUES as readonly string[]).includes(valeur);
}
