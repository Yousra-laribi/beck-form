/**
 * The test that stops the classic drift: a string added in French, forgotten in
 * English, and the interface shows a raw key in production.
 *
 * Written *before* the packs were extracted, and run red against empty packs
 * first. A parity test written after the content is green on its first run and
 * proves only that it was written last.
 *
 * The types already force the key sets to match (`en` is declared as
 * `typeof fr`). What the types cannot see is a key that exists but is empty,
 * an array that lost an entry, or a `<strong>` that survived extraction — so
 * every assertion here is one the compiler does not already make.
 */

import { EFFECTIFS, EMOTION_IDS, LANGUES } from '../../src/i18n/types';
import { contientHtml, marques } from '../../src/i18n/marques';
import { en } from '../../src/i18n/en';
import { fr } from '../../src/i18n/fr';

const PACKS = { fr, en };

/** Every leaf string in a pack, keyed by a readable path. */
function chaines(pack: unknown, prefixe = ''): Map<string, string> {
  const out = new Map<string, string>();
  const visiter = (valeur: unknown, chemin: string) => {
    if (typeof valeur === 'string') {
      out.set(chemin, valeur);
      return;
    }
    if (Array.isArray(valeur)) {
      valeur.forEach((v, i) => visiter(v, `${chemin}[${i}]`));
      return;
    }
    if (valeur && typeof valeur === 'object') {
      for (const [k, v] of Object.entries(valeur)) visiter(v, chemin ? `${chemin}.${k}` : k);
    }
  };
  visiter(pack, prefixe);
  return out;
}

describe('i18n parity', () => {
  describe('the packs are populated at all', () => {
    // Guards the case this whole file exists to rule out: a pack that is
    // structurally perfect and empty passes every comparison below, because
    // "" matches "" on both sides.
    // 94 in the mockup, minus `s5MotA` and `s5MotB` — the author's BROUILLON
    // note, held out of the packs entirely under Q6. The number is pinned rather
    // than derived so that dropping a key is a failure, not a smaller count.
    it.each(LANGUES)('%s carries 92 ui keys: the mockup 94, less the 2 held out', (langue) => {
      expect(Object.keys(PACKS[langue].ui)).toHaveLength(92);
    });

    it.each(LANGUES)('%s has no empty value anywhere', (langue) => {
      const vides = [...chaines(PACKS[langue])]
        .filter(([, v]) => v.trim() === '')
        .map(([k]) => k);
      expect(vides).toEqual([]);
    });
  });

  describe('key sets', () => {
    it('ui keys are identical, in both directions', () => {
      expect(Object.keys(en.ui).sort()).toEqual(Object.keys(fr.ui).sort());
    });

    it('every leaf path is identical, in both directions', () => {
      expect([...chaines(en).keys()].sort()).toEqual([...chaines(fr).keys()].sort());
    });
  });

  describe('identifiers, never labels (CLAUDE.md §3.2)', () => {
    it('emotion ids are identical and match the declared union', () => {
      expect(Object.keys(fr.emotions).sort()).toEqual([...EMOTION_IDS].sort());
      expect(Object.keys(en.emotions).sort()).toEqual([...EMOTION_IDS].sort());
    });
  });

  describe('structured arrays keep the same length', () => {
    const sections = ['facts', 'choix', 'tour', 'steps'] as const;

    it.each(sections)('%s has the same length in both packs', (section) => {
      expect(en[section]).toHaveLength(fr[section].length);
    });

    it.each(sections)('%s matches the count measured from the mockup', (section) => {
      expect(fr[section]).toHaveLength(EFFECTIFS[section]);
    });

    it('emotions match the count measured from the mockup', () => {
      expect(Object.keys(fr.emotions)).toHaveLength(EFFECTIFS.emotions);
    });
  });

  describe('optional fields appear on the same entries in both languages', () => {
    // The key-set comparison above walks leaf paths, so a missing optional field
    // would already surface there. These two are stated separately because they
    // are the specific facts measured from the mockup in PLAN.md §1, and naming
    // them makes a regression legible instead of arriving as a path diff.
    const porteurs = <T,>(xs: T[], f: (x: T) => boolean) =>
      xs.map((x, i) => (f(x) ? i : -1)).filter((i) => i >= 0);

    it('exactly 5 of the 7 steps carry a placeholder, the same 5 on both sides', () => {
      const a = porteurs(fr.steps, (s) => s.ph !== undefined);
      const b = porteurs(en.steps, (s) => s.ph !== undefined);
      expect(a).toHaveLength(5);
      expect(b).toEqual(a);
    });

    it('exactly the last tour entry is marked as the end, on both sides', () => {
      const a = porteurs(fr.tour, (t) => t.fin === true);
      const b = porteurs(en.tour, (t) => t.fin === true);
      expect(a).toEqual([fr.tour.length - 1]);
      expect(b).toEqual(a);
    });
  });

  describe('markup', () => {
    it.each(LANGUES)('%s contains no raw HTML — extraction converted it', (langue) => {
      const restes = [...chaines(PACKS[langue])]
        .filter(([, v]) => contientHtml(v))
        .map(([k, v]) => `${k}: ${v}`);
      expect(restes).toEqual([]);
    });

    it('both languages use the same marks in a given key', () => {
      const fra = chaines(fr);
      const ang = chaines(en);
      const divergences: string[] = [];
      for (const [chemin, texte] of fra) {
        const a = marques(texte);
        const b = marques(ang.get(chemin) ?? '');
        if (a.join(',') !== b.join(',')) {
          divergences.push(`${chemin}: fr=[${a.join(',')}] en=[${b.join(',')}]`);
        }
      }
      expect(divergences).toEqual([]);
    });
  });

  describe('the crisis resource never sits in a language pack (CLAUDE.md §5)', () => {
    // Crisis resources depend on region, not language. A number written into a
    // pack is unreachable for an English speaker in Paris and wrong for a French
    // speaker in Montreal — the bug the region structure exists to avoid.
    //
    // Asserted as a named list rather than a "looks like a phone number" regex.
    // The regex version flagged "from 0 to 100" on its first run: a heuristic
    // that cries wolf gets relaxed, and a relaxed guard on the crisis resource
    // is worse than none, because it still reads as protection.
    const NUMEROS = ['3114', '3919', '988', '116123', '116 123', '0800235236'];

    it.each(LANGUES)('%s spells out no crisis number', (langue) => {
      const suspects = [...chaines(PACKS[langue])]
        .filter(([, v]) => NUMEROS.some((n) => v.includes(n)))
        .map(([k, v]) => `${k}: ${v}`);
      expect(suspects).toEqual([]);
    });

    it.each(LANGUES)('%s reaches the resource through the {crise} mark instead', (langue) => {
      // The two strings health rule 3 makes non-negotiable. If either stops
      // carrying the mark, the crisis resource has silently left the screen.
      expect(marques(PACKS[langue].ui.safety)).toContain('crise');
      expect(marques(PACKS[langue].ui.s6C)).toContain('crise');
    });
  });

  describe('blocked content (CLAUDE.md §6)', () => {
    it("the author's BROUILLON note is not extracted at all", () => {
      for (const langue of LANGUES) {
        expect(PACKS[langue].ui).not.toHaveProperty('s5MotA');
        expect(PACKS[langue].ui).not.toHaveProperty('s5MotB');
      }
    });

    it('F1-F3 are extracted, so that sourcing them is the only thing left to do', () => {
      // Extracted but not displayable. `content/sources.md` lists them as
      // blocked; the "Comprendre" screen cannot be built until they are sourced.
      expect(fr.facts).toHaveLength(3);
      expect(en.facts).toHaveLength(3);
    });
  });
});
