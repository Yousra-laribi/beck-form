/**
 * The bundled type faces, and how a role resolves to one.
 *
 * The mockup pulls Newsreader, Karla and IBM Plex Mono from the Google Fonts
 * CDN. Health rule 5 forbids that at runtime, so the faces are bundled into
 * `assets/fonts/` (resolved as Q10). All three are SIL OFL 1.1; the licences
 * ship beside them, which the licence requires.
 *
 * Only the five weights the mockup actually sets are bundled, counted from its
 * CSS rather than from its `<link>`:
 *
 *   Newsreader     400            h1, .prompt, .hd-name, .card-thought, headings
 *   Karla          400, 500, 600  body, .btn.ghost + .dname, .btn + strong
 *   IBM Plex Mono  400            eyebrows, dates, counters, tabular numerals
 *
 * The `<link>` also requests Newsreader 300 and IBM Plex Mono 500. Nothing in
 * the mockup sets either, so neither is bundled — an unused face is bundle
 * weight on a device that never draws it.
 *
 * ---------------------------------------------------------------------------
 * Why one family per weight, rather than one family with `fontWeight`
 * ---------------------------------------------------------------------------
 *
 * `expo-font`'s config plugin can register a single Android family carrying
 * several weights, which would let `fontWeight: '600'` resolve natively. It is
 * not usable here: the plugin embeds fonts into a native build, and the
 * acceptance criterion in CLAUDE.md 8 is **Expo Go**, which loads no natively
 * embedded custom font.
 *
 * `useFonts()` works in Expo Go, and the key it is given becomes the family
 * name on both platforms. That is the property that matters under CLAUDE.md 8:
 * the name is identical on Android and iOS, so the deferred iOS pass has
 * nothing platform-specific to discover. Resolving a weight through the family
 * name instead of `fontWeight` is the cost, and it is paid in this one file.
 *
 * The name records make the alternative unattractive anyway: `Karla_500Medium`
 * declares name ID 1 as "Karla Medium", a *separate* family, while its
 * typographic family (ID 16) is "Karla". Android and CoreText do not agree on
 * which of the two wins, which is exactly the kind of platform-specific
 * assumption CLAUDE.md 8 asks the code to stay free of.
 */

import { police, policeSecours } from './tokens';

export type RolePolice = keyof typeof police;

/** The weights available. Nothing outside this union can be asked for. */
export type Graisse = 400 | 500 | 600;

/**
 * The asset map handed to `useFonts()`. The keys are the family names the rest
 * of the app refers to, so they are the one place the strings are spelled.
 */
export const FACES = {
  Newsreader_400Regular: require('../../assets/fonts/Newsreader_400Regular.ttf'),
  Karla_400Regular: require('../../assets/fonts/Karla_400Regular.ttf'),
  Karla_500Medium: require('../../assets/fonts/Karla_500Medium.ttf'),
  Karla_600SemiBold: require('../../assets/fonts/Karla_600SemiBold.ttf'),
  IBMPlexMono_400Regular: require('../../assets/fonts/IBMPlexMono_400Regular.ttf'),
} as const;

export type NomFace = keyof typeof FACES;

/**
 * Which face carries which role at which weight.
 *
 * A role that has no face at the requested weight falls back to its 400, which
 * is a deliberate near-miss rather than a silent switch to another typeface:
 * asking Newsreader for 600 is a mistake in the caller, and rendering the
 * regular makes it visible without breaking the screen.
 */
const FACES_PAR_ROLE: Record<RolePolice, Partial<Record<Graisse, NomFace>>> = {
  titre: { 400: 'Newsreader_400Regular' },
  corps: {
    400: 'Karla_400Regular',
    500: 'Karla_500Medium',
    600: 'Karla_600SemiBold',
  },
  mono: { 400: 'IBMPlexMono_400Regular' },
};

/**
 * The faces are bundled and loaded by the root layout.
 *
 * This stays a switch rather than an assumption because React Native fails a
 * missing `fontFamily` silently, falling back to the platform sans on Android.
 * If the bundle ever ships without the files, flipping this back to `false`
 * restores the generic serif / sans / mono distinction rather than rendering
 * the serif copy as sans and looking like a design decision.
 */
export const POLICES_EMBARQUEES = true;

/** The family name to hand React Native for a given role and weight. */
export function famille(role: RolePolice, graisse: Graisse = 400): string {
  if (!POLICES_EMBARQUEES) return policeSecours[role];
  return FACES_PAR_ROLE[role][graisse] ?? FACES_PAR_ROLE[role][400] ?? policeSecours[role];
}

/** The design-level name of a role, for documentation and specimens. */
export function nomLisible(role: RolePolice): string {
  return police[role];
}
