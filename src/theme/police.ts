import { police, policeSecours } from './tokens';

export type RolePolice = keyof typeof police;

/**
 * Whether the bundled faces are available.
 *
 * The mockup pulls Newsreader, Karla and IBM Plex Mono from the Google Fonts
 * CDN, which health rule 5 forbids at runtime. All three are SIL OFL 1.1 and
 * are to be bundled into `assets/fonts/` (Q10). Until the .ttf files land, this
 * stays false.
 *
 * It matters that this is a switch rather than an assumption: React Native
 * fails a missing `fontFamily` silently, falling back to the platform sans on
 * Android. Naming "Newsreader" before it exists would render the serif copy as
 * sans and look like a design decision rather than a missing asset.
 */
export const POLICES_EMBARQUEES = false;

/** The family name to hand React Native for a given role. */
export function famille(role: RolePolice): string {
  return POLICES_EMBARQUEES ? police[role] : policeSecours[role];
}
