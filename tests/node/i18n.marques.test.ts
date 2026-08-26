/**
 * The mark grammar, parsed without anything that can draw it.
 *
 * Lives in the `node` project on purpose: this is pure string work and has no
 * business loading the React Native module graph. `RichText` gets its own test
 * in `native` for what it renders.
 */

import { analyserMarques, contientHtml, marques, type Noeud } from '../../src/i18n/marques';
import { en } from '../../src/i18n/en';
import { fr } from '../../src/i18n/fr';

/** Flattens back to the visible text, ignoring structure. */
function texteDe(noeuds: Noeud[]): string {
  return noeuds
    .map((n) => {
      switch (n.type) {
        case 'texte':
          return n.texte;
        case 'saut':
          return '\n';
        case 'crise':
          return '•'; // a placeholder: the label comes from content/crisis/
        default:
          return texteDe(n.enfants);
      }
    })
    .join('');
}

describe('mark grammar', () => {
  describe('detection', () => {
    it('reports the marks a string uses, in a stable order', () => {
      expect(marques('a **b** c {num}1{/num}')).toEqual(['gras', 'num']);
      expect(marques('plain')).toEqual([]);
    });

    it('reports a mark once however often it appears', () => {
      expect(marques('**a** and **b**')).toEqual(['gras']);
    });
  });

  describe('parsing', () => {
    it('returns a single text node for an unmarked string', () => {
      expect(analyserMarques('bonjour')).toEqual([{ type: 'texte', texte: 'bonjour' }]);
    });

    it('splits on a line break', () => {
      expect(analyserMarques('a\nb')).toEqual([
        { type: 'texte', texte: 'a' },
        { type: 'saut' },
        { type: 'texte', texte: 'b' },
      ]);
    });

    it('parses the crisis mark as a leaf carrying no text of its own', () => {
      expect(analyserMarques('avant {crise} après')).toEqual([
        { type: 'texte', texte: 'avant ' },
        { type: 'crise' },
        { type: 'texte', texte: ' après' },
      ]);
    });

    it('nests: the crisis resource inside an emphasis', () => {
      // This is `ui.s6C`. A flat tokeniser would have to drop one of the two.
      expect(analyserMarques('**En cas de détresse : {crise}**')).toEqual([
        {
          type: 'gras',
          enfants: [{ type: 'texte', texte: 'En cas de détresse : ' }, { type: 'crise' }],
        },
      ]);
    });

    it('handles a quoted voice followed by a break and a number', () => {
      // This is `tour[2].ex`, the densest string in either pack.
      const n = analyserMarques('{cit}« Il me trouve incompétent. »{/cit}\nJ’y crois à {num}85 %{/num}');
      expect(n.map((x) => x.type)).toEqual(['cit', 'saut', 'texte', 'num']);
    });
  });

  describe('malformed input degrades rather than throws', () => {
    // One of the screens carrying marks is the crisis notice, which health rule
    // 3 says never disappears. Visible braces are a bug someone reports; a
    // thrown error is a blank screen.
    it.each(['{num}unclosed', '**unclosed', '{cit}a{/num}', '{/num}orphan'])(
      'leaves %p as literal text',
      (mauvais) => {
        expect(() => analyserMarques(mauvais)).not.toThrow();
        expect(texteDe(analyserMarques(mauvais))).toBe(mauvais);
      }
    );
  });

  describe('round-trip over the real packs', () => {
    const toutes = (p: typeof fr) => [
      ...Object.values(p.ui),
      ...p.tour.flatMap((t) => [t.n, t.def, t.ex]),
      ...p.steps.flatMap((s) => [s.ey, s.q, s.h, s.ph ?? '']),
    ];

    it.each([
      ['fr', fr],
      ['en', en],
    ])('%s parses every string without loss', (_nom, pack) => {
      for (const s of toutes(pack as typeof fr)) {
        if (!s) continue;
        // Marks are consumed, so compare against the string with marks stripped.
        const attendu = s
          .replace(/\*\*([\s\S]+?)\*\*/g, '$1')
          .replace(/\{cit\}([\s\S]+?)\{\/cit\}/g, '$1')
          .replace(/\{num\}([\s\S]+?)\{\/num\}/g, '$1')
          .replace(/\{crise\}/g, '•');
        expect(texteDe(analyserMarques(s))).toBe(attendu);
      }
    });
  });

  describe('html detection', () => {
    it('recognises the tags the mockup used', () => {
      expect(contientHtml('a <strong>b</strong>')).toBe(true);
      expect(contientHtml('a <br> b')).toBe(true);
      expect(contientHtml('plain — with an em dash')).toBe(false);
    });

    it('does not mistake a comparison for a tag', () => {
      expect(contientHtml('intensité < 50')).toBe(false);
    });
  });
});
