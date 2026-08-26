import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { libelleCrise, ressourceCrise, type RessourceCrise } from '../region/crisis';
import { dateCourte, dateLongue } from './format';
import { PACKS } from './index';
import type { Langue, Pack } from './index';

/**
 * Language, region, and the crisis resource they resolve to.
 *
 * This sits above `src/ui/`, which is presentational and looks nothing up
 * (CLAUDE.md §4.5). Routes read the context and hand primitives values.
 *
 * **Switching the interface language never touches a record.** `lang` is frozen
 * on a record at creation (CLAUDE.md §3.3): a record written in French stays in
 * French inside an English interface. Nothing here can reach a record, which is
 * how that invariant is kept structurally rather than remembered.
 */
export interface I18n {
  langue: Langue;
  /** The active pack. */
  t: Pack;
  /** The device or overridden region, `null` when unknown. */
  region: string | null;
  /** The crisis resource for that region, already worded in `langue`. */
  crise: { libelle: string; tel: string | null; ressource: RessourceCrise };
  /** Day and short month, as on a journal card. */
  dateCourte: (iso: string) => string;
  /** Day, full month and year. */
  dateLongue: (iso: string) => string;
}

const Ctx = createContext<I18n | null>(null);

export interface I18nProviderProps {
  children: ReactNode;
  /**
   * The interface language.
   *
   * Passed in rather than read here, so that the source of the value — a stored
   * preference in B5, the device locale, or a test — is the caller's business.
   */
  langue: Langue;
  /**
   * The region, for the crisis resource only.
   *
   * `null` resolves to the generic fallback, which names no number. Region and
   * language are deliberately separate arguments: an English speaker in Paris
   * needs 3114, and collapsing the two would make that person unreachable.
   */
  region?: string | null;
}

export function I18nProvider({ children, langue, region = null }: I18nProviderProps) {
  const valeur = useMemo<I18n>(() => {
    const ressource = ressourceCrise(region);
    return {
      langue,
      t: PACKS[langue],
      region,
      crise: {
        libelle: libelleCrise(ressource, langue),
        tel: ressource.tel,
        ressource,
      },
      dateCourte: (iso: string) => dateCourte(iso, langue),
      dateLongue: (iso: string) => dateLongue(iso, langue),
    };
  }, [langue, region]);

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

/**
 * The active language context.
 *
 * Throws outside a provider rather than returning a default. A silent fallback
 * to French would render a French interface to an English reader and look like
 * a translation gap rather than a missing provider.
 */
export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n must be used inside <I18nProvider>');
  return v;
}
