/**
 * Contrast is a test here, not a judgement call.
 *
 * The mockup's `--encre-3` measured 2.67:1 on `--papier` in the light theme —
 * below AA for normal text and below even the large-text floor. It carries
 * `.safety`, the crisis-line notice that health rule 3 makes non-negotiable.
 * The most important text in the app was the least legible. Three other text
 * colours failed the same way, `garde` among them — the colour of the link to
 * the crisis number itself.
 *
 * Fixing those values was a one-off. This file is what stops them coming back.
 *
 * Scope is CLAUDE.md 4.2 to the letter: text-colour / background-colour pairs.
 * WCAG 1.4.11 (non-text contrast, 3:1 for UI components) is deliberately not
 * asserted here — see PLAN.md for the standing debt on `ligne`, the field
 * border, which measures 1.19:1 against `papier`.
 */
import {
  couleurs,
  CONTRASTE_AA,
  SCHEMES,
  SURFACES,
  TEXTES,
  TEXTES_INVERSES,
  type Couleurs,
} from '../../src/theme/tokens';

// ---------------------------------------------------------------------------
// WCAG 2.1 relative luminance, implemented here rather than imported.
//
// A contrast assertion that trusted a dependency to compute contrast would be
// testing the dependency. These are ~15 lines straight from the spec.
// ---------------------------------------------------------------------------

function toRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const round = (n: number) => Math.round(n * 100) / 100;

describe('the contrast maths itself', () => {
  // If these drift, every assertion below becomes meaningless.
  it('puts black on white at 21:1', () => {
    expect(round(contrast('#000000', '#FFFFFF'))).toBe(21);
  });

  it('puts a colour against itself at 1:1', () => {
    expect(round(contrast('#8B5E70', '#8B5E70'))).toBe(1);
  });

  it('is symmetric', () => {
    expect(contrast('#616879', '#E9ECF1')).toBeCloseTo(contrast('#E9ECF1', '#616879'), 10);
  });

  it('expands three-digit hex', () => {
    expect(contrast('#fff', '#000000')).toBeCloseTo(contrast('#FFFFFF', '#000000'), 10);
  });

  it('reproduces the defect that motivated this file', () => {
    // The mockup's light --encre-3 on --papier. The number in CLAUDE.md 4.2.
    expect(round(contrast('#8A91A1', '#E9ECF1'))).toBe(2.67);
  });
});

describe('every text colour clears WCAG AA on every surface', () => {
  const cases = SCHEMES.flatMap((scheme) =>
    TEXTES.flatMap((texte) => SURFACES.map((surface) => ({ scheme, texte, surface })))
  );

  it.each(cases)('$scheme: $texte on $surface', ({ scheme, texte, surface }) => {
    const palette: Couleurs = couleurs[scheme];
    // Rounded, so a failure reports the ratio a contrast checker would show.
    expect(round(contrast(palette[texte], palette[surface]))).toBeGreaterThanOrEqual(CONTRASTE_AA);
  });
});

describe('text on a filled block clears WCAG AA', () => {
  const cases = SCHEMES.flatMap((scheme) =>
    TEXTES_INVERSES.map(([texte, fond]) => ({ scheme, texte, fond }))
  );

  it.each(cases)('$scheme: $texte on $fond', ({ scheme, texte, fond }) => {
    expect(contrast(couleurs[scheme][texte], couleurs[scheme][fond])).toBeGreaterThanOrEqual(
      CONTRASTE_AA
    );
  });
});

describe('the contract cannot be satisfied by leaving colours unclassified', () => {
  it('classifies every declared colour as surface, text or graphic', () => {
    // A new token that is neither a surface nor text is graphic by omission.
    // This test does not forbid that — it forbids doing it *silently*, by making
    // the graphic list explicit and asserting the three partition the palette.
    const graphiques = [
      'surEncre',
      'tension',
      'apaise',
      'garde',
      'ligne',
      'rail',
      'voile',
      'papier0',
      'focusRing',
      'ombreCadre',
      'ombreSheet',
      'sceneA',
      'sceneB',
    ] as const;

    const classified = new Set<string>([...SURFACES, ...TEXTES, ...graphiques]);
    const declared = Object.keys(couleurs.light);

    expect([...declared].filter((k) => !classified.has(k))).toEqual([]);
    expect([...classified].filter((k) => !declared.includes(k))).toEqual([]);
  });

  it('declares the same keys in both themes', () => {
    expect(Object.keys(couleurs.dark).sort()).toEqual(Object.keys(couleurs.light).sort());
  });

  it('leaves no colour empty in either theme', () => {
    for (const scheme of SCHEMES) {
      for (const [key, value] of Object.entries(couleurs[scheme])) {
        expect(`${scheme}.${key}=${value}`).toMatch(/=(#[0-9A-Fa-f]{3,8}|rgba?\()/);
      }
    }
  });
});

describe('the accents keep the mockup values where they are not text', () => {
  // The split exists so the bilan bars and the belief slope are untouched.
  // If someone "simplifies" it by pointing tension at tensionTexte, this fails.
  it('leaves the light graphic accents exactly as the mockup drew them', () => {
    expect(couleurs.light.tension).toBe('#8B5E70');
    expect(couleurs.light.apaise).toBe('#5F8A6B');
    expect(couleurs.light.garde).toBe('#94733C');
  });

  it('keeps them at or above the 3:1 floor for non-text use', () => {
    for (const scheme of SCHEMES) {
      for (const accent of ['tension', 'apaise', 'garde'] as const) {
        expect(contrast(couleurs[scheme][accent], couleurs[scheme].rail)).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
