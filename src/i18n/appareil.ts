import { getLocales } from 'expo-localization';

import { estLangue, type Langue } from './index';

/**
 * Reading language and region off the device.
 *
 * Kept apart from `I18nProvider` so the provider stays a pure function of its
 * props: this is the only file in `src/i18n/` that touches a native module, and
 * it is the only one the `node` test project cannot load.
 *
 * These are *defaults*, not settings. B5 adds stored preferences, and the region
 * override in particular must stay easy to reach (CLAUDE.md §5) — someone
 * travelling has a device region that is wrong for them, and the crisis
 * resource is the thing it is wrong about.
 */

/** The interface language the device asks for, falling back to French. */
export function langueAppareil(): Langue {
  const code = getLocales()[0]?.languageCode ?? '';
  return estLangue(code) ? code : 'fr';
}

/**
 * The region the device reports, or `null`.
 *
 * `null` rather than a guess: an unknown region resolves to the generic crisis
 * entry, which names no number. Guessing a region here would produce a specific,
 * confident and possibly wrong crisis line.
 */
export function regionAppareil(): string | null {
  return getLocales()[0]?.regionCode ?? null;
}
