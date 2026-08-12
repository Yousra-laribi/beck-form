/**
 * The icon set: 22 paths, one 24-unit box, one stroke weight, no fill.
 *
 * No image assets and no icon library. Every glyph is a list of `d` attributes
 * drawn with `stroke: currentColor`, so colour arrives from context — which is
 * the only way an icon can follow the theme without becoming a second place
 * colour is decided.
 *
 * Extracted verbatim from the `ICO` registry in `init/maquette-fiche-beck.html`.
 * The path data is not to be "tidied": these were drawn on the 24-unit grid to
 * sit on the same optical baseline, and renumbering them breaks that alignment.
 */
export const ICONES = {
  frame: [
    'M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8',
    'M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8',
    'M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16',
    'M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16',
  ],
  wave: ['M3 12h3.5l2.5-6 4 12 2.5-6H21'],
  bubble: ['M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V6Z'],
  warp: ['M3 16c3 0 3-8 6-8s3 8 6 8 3-8 6-8'],
  balanceL: ['M4 9.5l16-3', 'M12 8V20', 'M8.5 20h7', 'M4 9.5v2.5', 'M20 6.5v2.5'],
  balanceR: ['M4 6.5l16 3', 'M12 8V20', 'M8.5 20h7', 'M4 6.5v2.5', 'M20 9.5v2.5'],
  branch: ['M7 4v7a3 3 0 0 0 3 3h7', 'M14.5 11l3 3-3 3'],
  down: ['M12 4v14', 'M6 13l6 6 6-6'],
  half: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17Z', 'M12 3.5v17'],
  telepathy: [
    'M11 12a3.5 3.5 0 1 0-7 0 3.5 3.5 0 1 0 7 0Z',
    'M14 9a4 4 0 0 1 0 6',
    'M17 6.5a8 8 0 0 1 0 11',
  ],
  expand: ['M8 4H4v4', 'M16 4h4v4', 'M8 20H4v-4', 'M16 20h4v-4'],
  target: ['M12 4a8 8 0 1 0 0 16 8 8 0 1 0 0-16Z', 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7Z'],
  funnel: ['M4 5h16l-6 7v7l-4-2v-5L4 5Z'],
  heart: ['M12 20s-7-4.4-7-9a3.8 3.8 0 0 1 7-2.3A3.8 3.8 0 0 1 19 11c0 4.6-7 9-7 9Z'],
  rule: [
    'M5.5 4h13a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4Z',
    'M12 8v5',
    'M12 16.2v.3',
  ],
  carnet: ['M7 4h11v16H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M9 4v16'],
  bellOff: [
    'M6.5 16V10a5.5 5.5 0 0 1 9-4.2',
    'M17.5 11v5',
    'M4.5 16h15',
    'M10 19.5a2 2 0 0 0 4 0',
    'M4 4l16 16',
  ],
  history: ['M12 4a8 8 0 1 1-8 8', 'M4 8.5V12h3.5', 'M12 8v4.5l3 2'],
  lock: [
    'M7.5 10V8a4.5 4.5 0 0 1 9 0v2',
    'M7.5 10h9A1.5 1.5 0 0 1 18 11.5v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18v-6.5A1.5 1.5 0 0 1 7.5 10Z',
    'M12 14v2',
  ],
  eye: ['M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6Z'],
  check: ['M4.5 12.5l5 5 10-11'],
  alert: ['M12 4 2.5 20.5h19Z', 'M12 10v4', 'M12 17.2v.3'],
} as const;

export type IconeId = keyof typeof ICONES;

export const ICONE_IDS = Object.keys(ICONES) as IconeId[];

/**
 * Which icon stands for which cognitive distortion.
 *
 * Distortion ids, never labels (CLAUDE.md 3.2). The reference set itself lands
 * in `content/` in B4; this map is the presentation half and stays in code.
 */
export const ICONE_PAR_DISTORSION = {
  catastrophisme: 'down',
  tout_ou_rien: 'half',
  lecture_pensee: 'telepathy',
  generalisation: 'expand',
  personnalisation: 'target',
  filtre_negatif: 'funnel',
  raisonnement_emotionnel: 'heart',
  exigences: 'rule',
} as const satisfies Record<string, IconeId>;
