## Context

You are bootstrapping a mobile **cognitive restructuring** (CBT) application: a notebook of
"thought records" following Aaron Beck's seven columns. Personal app, offline, no user account.

The `maquette-fiche-beck.html` file at the root is a **complete working mockup**, written in
vanilla HTML/CSS/JS. It is authoritative on:

- the screen sequence and the seven-step flow;
- the design system (colors, typography, spacing, icons, animations);
- the copy for both languages;
- the reference set of the eight cognitive distortions.

**Read it in full before doing anything else.** It contains deliberate design decisions; do not
reinvent them and do not "improve" them without asking me first.

This project has a double purpose: shipping the application, and serving as my own learning
exercise on Claude Code and harness engineering. The care put into the tooling therefore matters
as much as the application code.

## Stack

- **Expo (recent SDK) + React Native + strict TypeScript**
- **expo-router** for navigation
- **expo-sqlite** for local persistence
- **i18next** (or equivalent) for languages
- **Vitest** or **Jest** for tests

If you have a reasoned objection to one of these choices, say so before starting.
I want neither Redux, nor a third-party component library, nor a styling framework:
the mockup demonstrates that the design is done by hand.

## Scope of this first phase

You are building the **foundations and the harness**, not the screens.

Deliverables:

1. An Expo project that runs on both the iOS and Android simulators.
2. A design system extracted from the mockup (tokens + primitives).
3. A typed data model + SQLite persistence layer + migrations.
4. i18n infrastructure with both language packs extracted from the mockup.
5. The complete harness described below.
6. A single fully working route, end to end, to prove the chain:
   the journal (empty list + populated list) actually reading from the database.

**Out of scope** — do not implement these, but leave room for them:
the seven-step flow screens, the distortion reference sheet, the explanatory home page,
re-rating, export.

**Explicitly excluded from v1**: any LLM assistance (thought rephrasing, distress detection).
These features will only be added once a dedicated evaluation harness has been built. A poorly
calibrated suggestion on a thought such as "I'm worthless" can reinforce the belief instead of
loosening it.

## Data model

```ts
type DistorsionId =
  | 'catastrophisme' | 'tout_ou_rien' | 'lecture_pensee' | 'generalisation'
  | 'personnalisation' | 'filtre_negatif' | 'raisonnement_emotionnel' | 'exigences';

type EmotionId =
  | 'anxiete' | 'tristesse' | 'colere' | 'honte'
  | 'culpabilite' | 'peur' | 'decouragement';

interface Reevaluation {
  date: string;          // ISO 8601, date only
  croyance: number;      // 0..100
}

interface ThoughtRecord {
  id: string;
  createdAt: string;     // ISO 8601
  lang: 'fr' | 'en';     // language the record was written in, frozen at creation
  refVersion: string;    // version of the distortion reference set used

  situation: string;
  emotions: EmotionId[];
  intensiteAvant: number;
  intensiteApres: number;

  penseeAuto: string;
  croyanceAvant: number;
  croyanceApres: number;

  distorsions: DistorsionId[];
  argumentsPour: string;
  argumentsContre: string;
  alternative: string;

  reevaluations: Reevaluation[];
}
```

> Field and identifier names are kept in French so they stay aligned with the mockup and with
> the stored data. Do not rename them.

Glossary for the fields above: `situation` = situation; `emotions` = emotions felt;
`intensiteAvant` / `intensiteApres` = emotion intensity before/after the work;
`penseeAuto` = automatic thought; `croyanceAvant` / `croyanceApres` = degree of belief in that
thought, before/after; `distorsions` = cognitive distortions identified; `argumentsPour` /
`argumentsContre` = evidence for / evidence against the thought; `alternative` = alternative
(balanced) thought; `reevaluations` = later re-ratings of the belief.

### Invariants — to be treated as hard rules

1. **Append-only.** A completed record is never modified. The only write allowed is appending to
   `reevaluations`. No `UPDATE` on `croyanceApres`, ever.
   *Rationale: a record is a dated snapshot. Rewriting yesterday erases the distance travelled,
   and that distance is the app's only indicator of progress.*
2. **Identifiers, never labels.** We store `filtre_negatif`, not `"Negative filter"`. Renaming or
   translating a label must not invalidate any existing record.
3. **User content is never translated.** `lang` records the language of writing. Switching the
   interface language does not touch the text of the records.
4. **External, versioned reference set.** The eight distortions (definition, impact, questions)
   live in content files, not in code, and carry a version number. `refVersion` makes it possible
   to display an old record consistently.

Write one test per invariant. Invariant 1 in particular: a test verifying that no function in the
repository issues an `UPDATE` against the frozen columns.

## Design system

Extract the mockup's `:root` block into `src/theme/tokens.ts`, for **both** light and dark themes.

- **No hexadecimal literal outside `tokens.ts`.** Write a `lint:tokens` script that fails if a
  `#rrggbb` appears anywhere else in `src/`. This is checkable with grep, so it is automatable —
  do it.
- Color is **semantic**, not decorative:
  `tension` (plum) = observation and intensity; `apaise` (green) = work and resolution;
  `garde` (ochre) = limits and safety. Do not introduce a new color without asking me.
- The mockup's 22 icons are SVG paths held in a single registry. Keep that principle: one module,
  `stroke: currentColor`, no images, no icon library.
- **The non-animated state must always be the final visible state.** A component that vanishes
  when animations are reduced is a bug. Respect `prefers-reduced-motion`.
- Touch targets: 44 px minimum, 50 px for primary actions.

## Internationalization

French and English, at strict parity from day one.

- Extract both packs from the mockup (`I18N.fr` and `I18N.en`), without losing a single string.
- **Write the parity test first**: same keys on both sides, no empty value, same lengths for
  structured arrays, same distortion and emotion identifiers. This is the test that prevents the
  classic drift — a string added in French, forgotten in English, and the interface displays a raw
  key in production.
- Dates stored as ISO, formatted for display via `Intl`.
- **Crisis resources depend on region, not on language.** 3114 is a French line: an English speaker
  in Paris needs it, a French speaker in Montreal does not. Design the structure accordingly, even
  if only one region is populated at first.

## Content rules — health

These are the most important rules in the project.

1. **No efficacy claim without a source.** Every statement about CBT must be tied to a reference
   listed in `content/sources.md`. No figure, no rate, no effect size that isn't sourced — a made-up
   statistic in a health app is worse than a cautious formulation.
2. **Never cross the medical device threshold.** Describing a method is information. Writing that
   the app *treats*, *cures* or *reduces* a disorder brings it under EU Regulation 2017/745. The
   current texts stay on the right side of that line; do not reword them in a more assertive
   direction.
3. **The limitations notice and the crisis resource are non-negotiable.** The "what this app is not"
   callout and the emergency number must never disappear from a screen for aesthetic or
   space reasons.
4. **No engagement mechanics.** No notifications, no streaks, no badges, no daily reminders. This is
   a stated stance on the app's home page.
5. **No network egress.** No analytics, no telemetry, no third-party crash reporting, no remote web
   font. The app promises that records never leave the phone: any dependency that opens a socket
   must be flagged to me before being added.

## The harness

This is the part I want to see done carefully.

**`CLAUDE.md`** — write it from everything above. It must contain at minimum: the four data
invariants, the token rule, the i18n parity rule, the five health content rules, the project
commands, and the component-splitting convention. Write it so that an agent who wasn't part of this
conversation can work without breaking the decisions made here.

**Tests** — set up the runner and write the founding tests:
i18n parity, the append-only invariant, date conversions, SQLite serialization round-trip, absence
of color literals, integrity of the distortion reference set (eight entries, all fields filled, one
existing icon per identifier).

**Scripts** — `test`, `lint`, `lint:tokens`, `typecheck`, `check` (which chains the previous ones).

**Pre-commit hook** — runs `check`. Without it, the rules above are wishful thinking.

**GitHub Actions CI** — `check` on every push.

**`docs/decisions/`** — one short ADR per structural decision already taken (append-only,
identifiers vs labels, no LLM in v1, no network). Free format, but keep it brief.

## Working method

1. Read the mockup and the existing file tree.
2. **Write `PLAN.md`, then stop.** Proposed file tree, task ordering, technical choices to settle,
   and above all the list of questions you have. Do not write a single line of application code
   before I approve that plan.
3. Then move forward in coherent batches with atomic commits, running `check` on each batch.

Two standing instructions:

- **If a decision is ambiguous, ask. Don't guess.** On this project, a silent assumption costs more
  than a question.
- **If you find that a rule in this prompt prevents you from doing something reasonable, tell me
  rather than working around it.** The rules are there to be discussed, not ignored.

## Acceptance criteria for this phase

- [ ] `npm run check` passes in full.
- [ ] The app starts on both the iOS and Android simulators.
- [ ] The journal genuinely reads the SQLite database, in both empty and populated states.
- [ ] Switching FR/EN changes the interface without touching the content of the records.
- [ ] Light and dark themes are correct, with no color literal outside `tokens.ts`.
- [ ] `CLAUDE.md`, `PLAN.md`, `docs/decisions/` and the pre-commit hook are in place.
- [ ] The rendered screen matches the mockup, pixel-accurate on the shared tokens.
