/**
 * The shape of a language pack.
 *
 * `fr` is the source of truth for *which keys exist*: `en` is declared as
 * `typeof fr`, so a key added in French and forgotten in English is a
 * compile error, not a raw key rendered in production. The parity test asserts
 * at runtime what the types assert at compile time, because the types say
 * nothing about a key being present but empty.
 *
 * The eight distortions are deliberately absent. They live in `content/`, are
 * versioned, and are stamped on each record via `refVersion` (CLAUDE.md §3.4) —
 * B4 owns them. The mockup carries them inside its `I18N` object only because
 * it is a single file.
 *
 * The two `exemples` are absent for the same kind of reason: they are seed
 * data for a dev-only script (Q12), not interface copy.
 */

/** The seven emotion identifiers. Stored, never the label (CLAUDE.md §3.2). */
export type EmotionId =
  | 'anxiete'
  | 'tristesse'
  | 'colere'
  | 'honte'
  | 'culpabilite'
  | 'peur'
  | 'decouragement';

export const EMOTION_IDS = [
  'anxiete',
  'tristesse',
  'colere',
  'honte',
  'culpabilite',
  'peur',
  'decouragement',
] as const satisfies readonly EmotionId[];

/** The two language codes. Frozen on a record at creation (CLAUDE.md §3.3). */
export type Langue = 'fr' | 'en';

export const LANGUES = ['fr', 'en'] as const satisfies readonly Langue[];

/**
 * A research claim on the "Comprendre" screen.
 *
 * **Extracted but not displayable.** F1–F3 make efficacy claims with no source,
 * which health rule 1 forbids showing. They are carried here so the packs are
 * complete and the parity test covers them; `content/sources.md` lists them as
 * blocked. The "Comprendre" screen cannot be built until they are sourced.
 */
export interface Fait {
  t: string;
  d: string;
}

/** A stance on the "why this app" screen. `ic` is an icon id in the registry. */
export interface Choix {
  ic: string;
  t: string;
  d: string;
}

/**
 * One of the seven columns, as presented in the guided tour.
 *
 * `fin` marks the last entry — the one the tour stops on. Only `tour[6]` carries
 * it, in both languages. It is a flag, not copy, which is why the parity test
 * compares *which entries* carry it rather than comparing its value.
 */
export interface EntreeTour {
  n: string;
  def: string;
  ex: string;
  fin?: boolean;
}

/**
 * One of the seven steps of the flow: eyebrow, question, hint, placeholder.
 *
 * `ph` is optional and that is intentional, not an oversight: steps 2 and 4
 * (emotion, distortions) are chosen from a list rather than typed into, so they
 * have no placeholder. Five of seven carry one, the same five in both languages
 * — a fact the parity test pins, because a placeholder appearing in one language
 * only is drift that no key-set comparison would catch.
 */
export interface Etape {
  ey: string;
  q: string;
  h: string;
  ph?: string;
}

/** One of the two readings of the same scene, on the opening demonstration. */
export interface Lecture {
  emotion: string;
  niveau: number;
  compo: string;
  suite: string;
}

/**
 * The loose shape a pack must satisfy. `fr` is checked against this; `en` is
 * checked against `typeof fr`, which is stricter — it pins the exact key set.
 */
export interface PackBase {
  ui: Record<string, string>;
  emotions: Record<EmotionId, string>;
  lectures: { a: Lecture; b: Lecture };
  facts: Fait[];
  choix: Choix[];
  tour: EntreeTour[];
  steps: Etape[];
}

/** The counts measured from the mockup. The parity test asserts against these. */
export const EFFECTIFS = {
  emotions: 7,
  facts: 3,
  choix: 5,
  tour: 7,
  steps: 7,
} as const;
