/**
 * The crisis resource resolves from region, and never from a language pack.
 *
 * These assertions are about safety, not correctness in the usual sense: health
 * rule 3 makes the crisis resource non-negotiable on the screens that carry it,
 * and CLAUDE.md §5 makes it region-dependent. The failure this guards against is
 * a number that is present, plausible, and wrong for the person reading it.
 */

import { LANGUES } from '../../src/i18n/types';
import {
  CRISE_DEFAUT,
  estDialable,
  libelleCrise,
  ressourceCrise,
} from '../../src/region/crisis';

describe('crisis resource resolution', () => {
  describe('the fallback exists from the start (CLAUDE.md §5)', () => {
    it('resolves for an absent region', () => {
      expect(ressourceCrise(null)).toBe(CRISE_DEFAUT);
      expect(ressourceCrise(undefined)).toBe(CRISE_DEFAUT);
      expect(ressourceCrise('')).toBe(CRISE_DEFAUT);
    });

    it('resolves for a region nothing covers yet', () => {
      expect(ressourceCrise('ZZ')).toBe(CRISE_DEFAUT);
      expect(ressourceCrise('CA')).toBe(CRISE_DEFAUT);
    });

    it('is worded in both languages', () => {
      for (const langue of LANGUES) {
        expect(libelleCrise(CRISE_DEFAUT, langue).trim()).not.toBe('');
      }
    });
  });

  describe('the fallback names no number', () => {
    // Defaulting to another country's line would look right on screen and be
    // useless, or dangerous, to whoever dialled it. Naming none is the honest
    // failure.
    it('carries no tel', () => {
      expect(CRISE_DEFAUT.tel).toBeNull();
      expect(estDialable(CRISE_DEFAUT)).toBe(false);
    });

    it('spells no digits in either wording', () => {
      for (const langue of LANGUES) {
        expect(libelleCrise(CRISE_DEFAUT, langue)).not.toMatch(/\d/);
      }
    });
  });

  describe('region matching', () => {
    it('is case-insensitive, because device locales are not consistent', () => {
      expect(ressourceCrise('fr')).toBe(ressourceCrise('FR'));
    });
  });

  describe('B4 will populate FR', () => {
    /**
     * ─────────────────────────────────────────────────────────────────────────
     * THIS TEST IS MEANT TO FAIL ONE DAY. DO NOT DELETE IT WHEN IT DOES.
     * ─────────────────────────────────────────────────────────────────────────
     *
     * It asserts the *current* state — no region is populated — rather than
     * being skipped until B4. That is deliberate. A `it.skip` is invisible: it
     * would sit green forever and nobody would notice the day FR landed.
     *
     * When `content/crisis/FR.json` is written, this assertion goes red. That
     * red is the point: it is the reminder that populating a region is not one
     * file, and it forces four things to be dealt with **in the same batch**,
     * none of which the type system can require:
     *
     *   1. `REGISTRE` in `src/region/crisis.ts` must actually load the file —
     *      an entry that exists on disk and is not registered resolves to the
     *      fallback, which looks like working software and names no line.
     *   2. This expectation must be rewritten to assert the FR resource: its
     *      number, and that it is dialable. A crisis number is the one value in
     *      this app that must be sourced rather than remembered — check it
     *      against the official publication, not against this file's history.
     *   3. `{crise}` must render as a *link* rather than as plain text, which
     *      is a different branch in `RichText` (`estDialable`). Until FR
     *      existed, that branch had nothing to render and was never exercised.
     *   4. The manual region override must be reachable, per CLAUDE.md §5 —
     *      someone travelling has a device region that is wrong for them.
     *
     * Deleting this test to get back to green would remove the only thing
     * connecting those four, and the failure mode is a crisis notice that
     * displays a generic phrase in a country where a real line exists.
     */
    it('has no populated region yet, so everything falls back', () => {
      expect(ressourceCrise('FR')).toBe(CRISE_DEFAUT);
    });
  });
});
