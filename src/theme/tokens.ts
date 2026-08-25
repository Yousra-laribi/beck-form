/**
 * The single source of colour, type, space and radius.
 *
 * This is the one file in the project allowed to spell a colour out.
 * `npm run lint:tokens` fails the build on a hex, `rgb()`, `hsl()` or named
 * colour anywhere else under `src/` or `app/`. The rule is not tidiness: a
 * literal elsewhere is a colour that cannot follow the dark theme, because
 * nothing re-evaluates it when the scheme changes.
 *
 * Deliberately free of any React Native import. The contrast test runs in the
 * `node` jest project and imports this module directly; pulling in the RN
 * module graph here would force it into `native` for no reason.
 *
 * Provenance: every value is extracted from `init/maquette-fiche-beck.html`.
 * Where a value was changed, the reason is recorded at the point of change and
 * the change was approved by the owner before this file was committed.
 */

export type Scheme = 'light' | 'dark';

export interface Couleurs {
  // ---- Surfaces: anything text is allowed to sit on. ----
  /** The app background. */
  papier: string;
  /** Raised surface: cards, inputs, the sheet. */
  carte: string;
  /** Recessed surface: contextual help, examples, notices. */
  aide: string;

  // ---- Text. Every one of these clears WCAG AA on every surface above. ----
  /** Primary text, and the fill of primary buttons and selected chips. */
  encre: string;
  /** Secondary text: body copy, hints, list items. */
  encre2: string;
  /** Muted text: eyebrows, captions, dates, step counters, the crisis notice. */
  encre3: string;
  /** Placeholder text inside an empty field. */
  placeholder: string;
  /** Text set in the "before" accent. */
  tensionTexte: string;
  /** Text set in the "after" accent. */
  apaiseTexte: string;
  /** Text set in the limits/safety accent — including the crisis-line link. */
  gardeTexte: string;

  // ---- Text that sits on a filled `encre` block, not on a surface. ----
  /** Label of a primary button, a selected chip, a checked box. */
  surEncre: string;

  // ---- Graphic: fills, bars, rules, scrims. Never carries a glyph. ----
  /** Observation, intensity — the "before" state. Bars, gradients, borders. */
  tension: string;
  /** Work, resolution — the "after" state. Bars, gradients. */
  apaise: string;
  /** Limits, safety, crisis resources. The `.note-g` rule. */
  garde: string;
  /** Hairline: card borders, field borders, separators. */
  ligne: string;
  /** The unfilled part of a gauge or mini-delta track. */
  rail: string;
  /** Scrim behind the bottom sheet. */
  voile: string;
  /** `papier` at zero alpha — the far end of the footer fade. */
  papier0: string;
  /** Focus halo on a field. Decorative: the indicator is the `encre` border. */
  focusRing: string;
  /** Ambient shadow under the device frame (web preview at >= 600px only). */
  ombreCadre: string;
  /** Shadow lifting the bottom sheet off the screen. */
  ombreSheet: string;
  /** Backdrop of the web preview scene. Outside the app, never behind text. */
  sceneA: string;
  sceneB: string;
}

/**
 * Light theme.
 *
 * Four values differ from the mockup, all for contrast, all approved before
 * commit. The measured ratios are asserted in `tests/node/tokens.contrast.test.ts`
 * — that test, not this comment, is what stops the values drifting back.
 *
 *   encre3        #8A91A1 -> #616879   was 2.67:1 on papier, 3.08:1 on carte
 *   placeholder   #A9B0BD -> #616879   was 1.84:1 on papier, 2.13:1 on carte
 *   gardeTexte    #94733C -> #7D6132   was 3.71:1 on papier, 4.29:1 on carte
 *   apaiseTexte   #5F8A6B -> #4C7056   was 3.32:1 on papier, 3.84:1 on carte
 *
 * `tension`, `apaise` and `garde` keep their mockup values as *graphic* colours:
 * the bilan bars, the belief slope and the `.note-g` rule are unchanged. Only
 * the text-carrying variants moved. `tensionTexte` is nudged from #8B5E70 to
 * #875B6C purely for margin — the original measured 4.51:1, which passes by
 * 0.01 and would break the moment `papier` was touched.
 */
const light: Couleurs = {
  papier: '#E9ECF1',
  carte: '#FCFCFD',
  aide: '#F1F4F8',

  encre: '#1E2438',
  encre2: '#5A6276',
  encre3: '#616879',
  placeholder: '#616879',
  tensionTexte: '#875B6C',
  apaiseTexte: '#4C7056',
  gardeTexte: '#7D6132',

  surEncre: '#FFFFFF',

  tension: '#8B5E70',
  apaise: '#5F8A6B',
  garde: '#94733C',
  ligne: '#D5DAE2',
  rail: '#E6E9EE',
  voile: 'rgba(30,36,56,.34)',
  papier0: 'rgba(233,236,241,0)',
  focusRing: 'rgba(30,36,56,.09)',
  ombreCadre: 'rgba(12,16,28,.4)',
  ombreSheet: 'rgba(12,16,28,.28)',
  sceneA: '#E7EAEF',
  sceneB: '#D2D7DF',
};

/**
 * Dark theme.
 *
 * `encre3` moves #79808F -> #878E9C: the mockup value measured 4.39:1 on
 * papier and 3.96:1 on carte, marginally under AA in both cases.
 *
 * The three accents pass unchanged as text here (5.81:1 to 7.50:1), so the
 * `*Texte` variants take the same value as their graphic counterparts. They
 * still exist as separate keys so a component never has to know which theme it
 * is in to pick the right one.
 *
 * `placeholder`, `focusRing`, `ombreCadre` and `ombreSheet` had no dark
 * counterpart in the mockup — these four are the values proposed to and
 * approved by the owner. The two shadows follow the mockup's own precedent for
 * dark scrims: `--voile` goes from rgba(30,36,56,.34) to rgba(0,0,0,.6), i.e.
 * pure black at roughly 1.75x the alpha. The same treatment is applied here.
 * Note that elevation in this theme is carried mostly by `carte` being lighter
 * than `papier`, not by the shadow — a black shadow on a near-black backdrop
 * does little work whatever its alpha.
 */
const dark: Couleurs = {
  papier: '#161A24',
  carte: '#1E2330',
  aide: '#1B2029',

  encre: '#E8EBF1',
  encre2: '#A4ACBB',
  encre3: '#878E9C',
  placeholder: '#878E9C',
  tensionTexte: '#C58EA3',
  apaiseTexte: '#7FB490',
  gardeTexte: '#CFA35F',

  surEncre: '#161A24',

  tension: '#C58EA3',
  apaise: '#7FB490',
  garde: '#CFA35F',
  ligne: '#2F3644',
  rail: '#272E3B',
  voile: 'rgba(0,0,0,.6)',
  papier0: 'rgba(22,26,36,0)',
  focusRing: 'rgba(232,235,241,.14)',
  ombreCadre: 'rgba(0,0,0,.7)',
  ombreSheet: 'rgba(0,0,0,.5)',
  sceneA: '#1A1E28',
  sceneB: '#0D1016',
};

export const couleurs: Record<Scheme, Couleurs> = { light, dark };

export const SCHEMES = ['light', 'dark'] as const satisfies readonly Scheme[];

// ---------------------------------------------------------------------------
// The contrast contract
// ---------------------------------------------------------------------------
//
// These three lists are what `tests/node/tokens.contrast.test.ts` enumerates.
// They live here, next to the values, so that adding a colour and forgetting to
// classify it is a type error rather than a silently untested token.

/** Every surface a glyph can be painted on. */
export const SURFACES = ['papier', 'carte', 'aide'] as const satisfies readonly (keyof Couleurs)[];

/** Every colour that carries a glyph. Each must clear 4.5:1 on every surface. */
export const TEXTES = [
  'encre',
  'encre2',
  'encre3',
  'placeholder',
  'tensionTexte',
  'apaiseTexte',
  'gardeTexte',
] as const satisfies readonly (keyof Couleurs)[];

/**
 * Text painted on a filled block rather than on a surface — a primary button
 * label, a selected chip, the checkbox tick. Asserted as explicit pairs.
 */
export const TEXTES_INVERSES = [['surEncre', 'encre']] as const satisfies readonly [
  keyof Couleurs,
  keyof Couleurs,
][];

/** The AA threshold for normal-size text. There is no large-text carve-out here. */
export const CONTRASTE_AA = 4.5;

// ---------------------------------------------------------------------------
// Type scale
// ---------------------------------------------------------------------------
//
// The mockup declares 24 distinct font sizes. That is drift, not intent, so
// they collapse onto six steps plus the two fluid heads. Nothing moved by more
// than 1px:
//
//   micro   10     <- 9 (+1.0)  9.5 (+0.5)  10  10.5 (-0.5)  11 (-1.0)
//   petit   12.5   <- 12 (+0.5)  12.5  13 (-0.5)
//   corps   14.5   <- 13.5 (+1.0)  14 (+0.5)  14.5  15 (-0.5)
//   large   16     <- 16  16.5 (-0.5)  17 (-1.0)
//   titre   20     <- 19 (+1.0)  20  21 (-1.0)
//   chiffre 26     <- 25 (+1.0)  26
//
// `large` deliberately lands on 16 rather than 16.5 so that inputs and buttons
// keep the mockup's exact 16px. 16px is the de facto floor for form text.
export const type = {
  /** Mono capitals: eyebrows, tick labels, step counters, section labels. */
  micro: 10,
  /** Captions, distortion tells, the crisis notice. */
  petit: 12.5,
  /** The workhorse: body copy, list items, hints, chips. */
  corps: 14.5,
  /** Inputs, buttons, pull quotes. */
  large: 16,
  /** Card and section headings, gauge readouts. */
  titre: 20,
  /** The bilan numbers, the sheet heading. */
  chiffre: 26,
} as const;

/**
 * The two sizes the mockup expresses as `clamp(min, vw, max)`. React Native has
 * no viewport unit, so the three numbers are kept and resolved at runtime by
 * `fluide()` in `./fluide.ts` rather than one end being hardcoded.
 */
export const typeFluide = {
  /** `.prompt` — clamp(23px, 6.2vw, 27px) */
  pensee: { min: 23, vw: 6.2, max: 27 },
  /** `h1` — clamp(28px, 7.5vw, 33px) */
  hero: { min: 28, vw: 7.5, max: 33 },
} as const;

/**
 * Line-height multipliers. The mockup uses ten; these six absorb them all
 * within 1px except one — `.sec p` at 1.62 becomes 1.55, which at 14.5px is a
 * 1.02px reduction. Raised with the owner under CLAUDE.md 4.3. That rule is on
 * the "Comprendre" screen, which cannot be built until F1-F3 are sourced.
 */
export const leading = {
  ras: 1.05,
  serre: 1.15,
  titre: 1.25,
  compact: 1.35,
  normal: 1.45,
  lecture: 1.55,
} as const;

/** Letter-spacing, in em. Mono capitals only; body text is never tracked. */
export const tracking = {
  titre: -0.01,
  mono: 0.06,
  monoLarge: 0.08,
  capitales: 0.12,
  capitalesLarge: 0.14,
} as const;

// ---------------------------------------------------------------------------
// Space scale
// ---------------------------------------------------------------------------
//
// Enumerated from the mockup on a 2px grid. Every odd value in the mockup snaps
// to the nearest even one, so nothing moves by more than 1px. `s22` is the
// mockup's `--pad`, the horizontal padding of every screen.
export const space = {
  s2: 2,
  s4: 4,
  s6: 6,
  s8: 8,
  s10: 10,
  s12: 12,
  s14: 14,
  s16: 16,
  s18: 18,
  s20: 20,
  s22: 22,
  s24: 24,
  s26: 26,
  s28: 28,
} as const;

/** `carte` is the mockup's `--r`. */
export const radius = {
  fin: 2,
  petit: 5,
  moyen: 12,
  carte: 16,
  feuille: 24,
  pilule: 999,
} as const;

/** Minimum touch targets, per CLAUDE.md 4.4. */
export const touch = {
  min: 44,
  principal: 50,
} as const;

/** One stroke set for all 22 icons: 24-unit box, 1.6 stroke, currentColor. */
export const icone = {
  petit: 16,
  normal: 20,
  grand: 24,
  stroke: 1.6,
  viewBox: 24,
} as const;

/**
 * Font families, at the design level.
 *
 * The mockup loads Newsreader, Karla and IBM Plex Mono from the Google Fonts
 * CDN, which health rule 5 forbids at runtime. All three are SIL OFL 1.1 and
 * are bundled into `assets/fonts/` with their licences (Q10, done).
 *
 * These are the *design* names. What React Native is actually handed is a
 * per-weight family name resolved by `theme/police.ts` — one family per weight,
 * because the acceptance target is Expo Go. That file carries the reasoning.
 */
export const police = {
  titre: 'Newsreader',
  corps: 'Karla',
  mono: 'IBM Plex Mono',
} as const;

/**
 * Generic stacks, used only if `POLICES_EMBARQUEES` is turned back off. They
 * preserve the serif / sans / mono distinction but not the metrics: measured
 * against the Android faces they resolve to, Karla sets 9.3% wider than Roboto
 * and Newsreader's x-height is 20.5% smaller than Noto Serif's.
 */
export const policeSecours = {
  titre: 'serif',
  corps: 'sans-serif',
  mono: 'monospace',
} as const;

/** Animation durations, in ms. Every one of these is skipped under reduced motion. */
export const duree = {
  instant: 120,
  court: 220,
  moyen: 300,
  long: 550,
  marque: 1400,
} as const;
