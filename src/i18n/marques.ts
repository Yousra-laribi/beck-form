/**
 * The inline-markup convention, and nothing that renders it.
 *
 * React Native has no `innerHTML`, and seven strings in the mockup carry HTML
 * (four `ui` keys, three `tour` entries). Splitting them into several keys each
 * would weaken the parity test, so a string stays one key and carries marks
 * (Q3). This file defines the grammar; `ui/RichText.tsx` renders it.
 *
 * The grammar lands before the renderer on purpose: the parity test asserts
 * that both languages use the *same marks* in a given key, so it needs to
 * recognise a mark without anything being able to draw one.
 *
 * | Mark | Was | Renders |
 * |---|---|---|
 * | `**bold**`            | `<strong>`            | emphasis |
 * | `\n`                  | `<br>`                | line break |
 * | `{num}…{/num}`        | `<span class="num">`  | tabular numerals |
 * | `{cit}…{/cit}`        | `<em>`                | quoted voice — see below |
 * | `{crise}`             | `<a href="#">3114</a>`| the crisis resource, as a link |
 *
 * Two of these depart from the four marks approved under Q3, and both are
 * raised rather than assumed — see `PLAN.md` §12.
 *
 * **`{cit}` is a fifth mark, not in the approved four.** The mockup's `<em>` is
 * not emphasis: `.st-ex em` and `.recap dd em` both set `font-style:normal` and
 * switch the face to Newsreader. It marks a quoted thought — the person's own
 * sentence, set in the serif — which is a distinct thing from `**bold**` and
 * cannot be folded into it without losing the distinction.
 *
 * **`{crise}` replaces `[text]({crisisTel})`.** The approved form parameterises
 * the link *target* but leaves the label literal, so the pack would still read
 * `[3114]({crisisTel})` — a French phone number sitting inside a language pack,
 * which is the exact failure CLAUDE.md §5 describes. Both halves have to come
 * from `content/crisis/`, so the mark carries no text at all.
 */

/** Every mark the grammar knows. Order is the order they are listed above. */
export type Marque = 'gras' | 'saut' | 'num' | 'cit' | 'crise';

export const MARQUES = ['gras', 'saut', 'num', 'cit', 'crise'] as const satisfies readonly Marque[];

/**
 * How each mark is recognised.
 *
 * Kept as one table so the renderer and the parity test cannot drift apart:
 * a mark that the test can see but the renderer cannot draw would let a string
 * pass parity and then render as literal braces.
 */
export const MOTIFS: Record<Marque, RegExp> = {
  gras: /\*\*(.+?)\*\*/g,
  saut: /\n/g,
  num: /\{num\}(.+?)\{\/num\}/g,
  cit: /\{cit\}(.+?)\{\/cit\}/g,
  crise: /\{crise\}/g,
};

/**
 * The set of marks a string uses, in a stable order.
 *
 * This is what the parity test compares between languages. It reports the set,
 * not the count: French and English rarely bold the same number of fragments,
 * but a key that is bold in one language and plain in the other is drift.
 */
export function marques(texte: string): Marque[] {
  return MARQUES.filter((m) => {
    const re = new RegExp(MOTIFS[m].source, 'g');
    return re.test(texte);
  });
}

/**
 * One node of a parsed string.
 *
 * `gras`, `cit` and `num` carry children rather than a flat string, because the
 * marks nest: `s6C` is `**En cas de détresse : {crise}**`, a crisis resource
 * inside an emphasis. A flat tokeniser would have to choose which of the two to
 * honour, and would silently drop the other.
 */
export type Noeud =
  | { type: 'texte'; texte: string }
  | { type: 'saut' }
  | { type: 'crise' }
  | { type: 'gras'; enfants: Noeud[] }
  | { type: 'cit'; enfants: Noeud[] }
  | { type: 'num'; enfants: Noeud[] };

/**
 * One pass over all five marks at once.
 *
 * Alternation order matters only for `**`, which must be tried before a bare
 * character run; the braced marks cannot overlap each other. Containers use
 * `[\s\S]` rather than `.` so a mark that spans a line break still closes.
 */
const COMBINE = /\*\*([\s\S]+?)\*\*|\{cit\}([\s\S]+?)\{\/cit\}|\{num\}([\s\S]+?)\{\/num\}|\{crise\}|\n/g;

/**
 * Parse a marked-up string into nodes.
 *
 * Unmatched or malformed marks are left as literal text rather than throwing.
 * That is the deliberate choice for a health app: a stray `{num}` renders as
 * visible braces — ugly, reported, fixable — whereas throwing would blank a
 * screen, and one of the screens carrying marks is the crisis notice that
 * health rule 3 makes non-negotiable.
 */
export function analyserMarques(texte: string): Noeud[] {
  const noeuds: Noeud[] = [];
  const re = new RegExp(COMBINE.source, 'g');
  let dernier = 0;
  let m: RegExpExecArray | null;

  const pousserTexte = (s: string) => {
    if (s) noeuds.push({ type: 'texte', texte: s });
  };

  while ((m = re.exec(texte)) !== null) {
    pousserTexte(texte.slice(dernier, m.index));
    const [tout, gras, cit, num] = m;

    if (gras !== undefined) noeuds.push({ type: 'gras', enfants: analyserMarques(gras) });
    else if (cit !== undefined) noeuds.push({ type: 'cit', enfants: analyserMarques(cit) });
    else if (num !== undefined) noeuds.push({ type: 'num', enfants: analyserMarques(num) });
    else if (tout === '\n') noeuds.push({ type: 'saut' });
    else noeuds.push({ type: 'crise' });

    dernier = m.index + tout.length;
  }
  pousserTexte(texte.slice(dernier));
  return noeuds;
}

/**
 * Whether a string still contains raw HTML.
 *
 * The packs are extracted from an HTML mockup, so this is the check that the
 * conversion actually happened. A `<strong>` that survived extraction would
 * render as literal angle brackets on a screen, which is the visible half of
 * the failure; the invisible half is that it would never be styled.
 */
export function contientHtml(texte: string): boolean {
  return /<[a-z/][^>]*>/i.test(texte);
}
