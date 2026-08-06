# CLAUDE.md

Working notes for anyone — human or agent — touching this repository.

Read this before writing code. The rules below are not style preferences; several of them protect
either the integrity of someone's private records or the safety of health content. Where a rule
looked arbitrary, the reasoning is given, because a rule you understand is one you won't work
around.

**If a rule here blocks something reasonable, say so and stop. Do not route around it.**

---

## 1. What this is

A personal, offline mobile notebook of **cognitive restructuring** thought records — Aaron Beck's
seven columns. Expo + React Native + expo-router + expo-sqlite, strict TypeScript. No account, no
server, no network.

`init/maquette-fiche-beck.html` is a complete working mockup and is **authoritative** on: the screen
sequence, the design system, the copy in both languages, and the eight cognitive distortions. It
contains deliberate decisions. Do not reinvent or "improve" them without asking the owner first.

`PLAN.md` holds the approved plan, the batch order, and the resolved questions.

---

## 2. Commands

| Command | Does |
|---|---|
| `npm run check` | **The gate.** Chains typecheck → lint → lint:tokens → test. |
| `npm run typecheck` | `tsc --noEmit`, strict. |
| `npm run lint` | ESLint. |
| `npm run lint:tokens` | Fails if a colour literal appears outside `src/theme/tokens.ts`. |
| `npm run test` | Jest. Two projects: `node` (logic) and `native` (components). |
| `npm run start` / `android` | Expo dev server. |
| `npm run hooks:install` | Points git at `.githooks/`. **Run once after cloning.** |

`check` runs on every commit via the pre-commit hook and on every push via GitHub Actions.

---

## 3. Data invariants — hard rules

These four govern the persistence layer. Each has a test; the tests are not optional and must not be
weakened to make a change pass.

### 3.1 Append-only

**A completed record is never modified. The only permitted write is appending to `reevaluations`.
There is no `UPDATE` on `croyanceApres`, ever.**

*Why:* a record is a dated snapshot. Rewriting yesterday erases the distance travelled, and that
distance is the app's only indicator of progress.

Enforced structurally, not just by convention:

- `reevaluations` is its **own table**. Appending a re-rating is an `INSERT`, never an `UPDATE` on
  the records table.
- Mutable preferences live in `src/db/prefs.ts`, physically apart from `src/db/records/`, and use
  `INSERT OR REPLACE`.
- Consequently: **the token `UPDATE` appears nowhere in `src/`.** A test greps for it with zero
  allowed exceptions. A rule with no carve-outs cannot quietly erode.

### 3.2 Identifiers, never labels

Store `filtre_negatif`, never `"Negative filter"`. Renaming or translating a label must not
invalidate an existing record. This applies to distortion ids, emotion ids, and language codes.

### 3.3 User content is never translated

`lang` records the language a record was written in and is frozen at creation. Switching the
interface language changes the interface only — it must never touch the text of a record. Records
written in French stay in French inside an English UI.

### 3.4 External, versioned reference set

The eight distortions (definition, impact, questions) live in `content/`, not in code, and carry a
version. `refVersion` is stamped on each record so an old record can always be displayed against the
reference set it was written under.

### The field names are the spec's, not the mockup's

`prompt-init.md`'s TypeScript is normative: `createdAt`, `penseeAuto`, `intensiteAvant`,
`croyanceAvant`, `argumentsPour`, `argumentsContre`, `reevaluations`. The mockup's shorthand
(`date`, `pensee`, `pour`, `contre`, `reeval`…) exists only because it is a single-file demo, and
dies with it. Field names stay in French; **do not rename them** to English.

---

## 4. Design system

### 4.1 One source of colour

**No colour literal outside `src/theme/tokens.ts`** — no hex, no `rgb()`/`rgba()`, no `hsl()`, no
named CSS colour. `npm run lint:tokens` enforces this and is itself covered by tests.

*Why it matters beyond tidiness:* a literal is a colour that cannot follow the dark theme, because
nothing re-evaluates it when the scheme changes.

Colour is **semantic**, never decorative:

| Token | Means |
|---|---|
| `tension` (plum) | observation, intensity — the "before" state |
| `apaise` (green) | work, resolution — the "after" state |
| `garde` (ochre) | limits, safety, crisis resources |

**Do not introduce a new colour without asking the owner.**

### 4.2 Contrast is a test, not a judgement call

**Every text-colour / background-colour pair declared in `tokens.ts` must meet WCAG AA (4.5:1), in
both themes.** A test asserts this over the token matrix.

*Why this is a hard rule here:* the mockup's `--encre-3` measured **2.67:1** on `--papier` in the
light theme — below AA and below even the large-text floor. It carries `.safety`, the crisis-line
notice that health rule 3 makes non-negotiable. The most important text in the app was the least
legible. Corrected in B1; the test is what stops it recurring.

### 4.3 Type and space scales

`tokens.ts` also holds a rationalised type scale and space scale, derived from the mockup. The mockup
uses 14 distinct font sizes, which is drift rather than intent: they are mapped onto 6–8 steps. Any
mapping that moved a value by more than 1px was raised with the owner rather than decided silently.

### 4.4 Components

- **Icons:** one registry, `src/icons/registry.ts`, 22 SVG paths, `stroke: currentColor`. No images,
  no icon library. Colour comes from context.
- **The non-animated state must always be the final visible state.** A component that disappears
  when animation is reduced is a bug, not a degradation. Respect reduced motion
  (`AccessibilityInfo.isReduceMotionEnabled`); every animated component has a test asserting its
  reduced-motion render.
- **Touch targets:** 44px minimum, 50px for primary actions.
- Theme follows the system (`useColorScheme`). There is no manual toggle — the mockup has none.

### 4.5 Component-splitting convention

- `src/ui/` — presentational primitives only. No data access, no i18n lookups, no navigation. They
  take values and callbacks. This is what makes them testable without a database.
- `app/` — routes. Composition, data fetching, navigation. Thin.
- `src/domain/` — types and pure logic. No React, no SQL.
- `src/db/` — persistence, behind repository functions. Nothing above it writes SQL.
- One component per file, named for the file. A file over ~150 lines is a signal to split, not a
  target to hit.

---

## 5. Internationalisation

French and English at **strict parity from day one**. The packs in the mockup already are at parity
(94 `ui` keys each, no empty values); the test's job is keeping it that way.

The parity test asserts:

- identical key sets on both sides, no empty value;
- identical lengths for structured arrays (`facts`, `choix`, `tour`, `steps`);
- identical distortion and emotion identifiers;
- identical **markup marks** per key (see below).

*Why first:* this is the test that prevents the classic drift — a string added in French, forgotten
in English, and the interface shows a raw key in production.

### Markup inside strings

React Native has no `innerHTML`, and four `ui` strings plus three `tour` entries carry HTML in the
mockup. Strings stay **one key each** (splitting them would weaken the parity test); a `<RichText>`
primitive renders a four-mark subset:

| Mark | Renders |
|---|---|
| `**bold**` | emphasis |
| `\n` | line break |
| `{num}…{/num}` | tabular-numerals span |
| `[text]({crisisTel})` | link to the crisis resource |

**The crisis link takes its target from `content/crisis/`, never from a language pack.** Crisis
resources depend on **region, not language**: an English speaker in Paris needs 3114; a French
speaker in Montreal does not. Hardcoding a number into a language string reintroduces exactly the
bug the region structure exists to avoid.

Region resolves from the device via `expo-localization`, with an explicit user override that must
stay **easy to reach** — someone travelling needs it. Unknown or unpopulated region falls back to a
generic entry. Only `FR` is populated for now; the fallback must exist from the start.

Dates are stored as ISO 8601 and formatted for display via `Intl`. Never store a formatted date.

---

## 6. Content rules — health

**The most important rules in the project.**

1. **No efficacy claim without a source.** Every statement about CBT must be tied to a reference in
   `content/sources.md`. No figure, no rate, no effect size that isn't sourced. A made-up statistic
   in a health app is worse than a cautious formulation. **Never invent or guess a citation**,
   including one marked "unverified" — a plausible-looking reference is the failure mode this rule
   exists to prevent, because it looks finished.
2. **Never cross the medical device threshold.** Describing a method is information. Writing that the
   app *treats*, *cures*, or *reduces* a disorder brings it under EU Regulation 2017/745. The current
   texts sit on the right side of that line. Do not reword them in a more assertive direction.
3. **The limitations notice and the crisis resource are non-negotiable.** The "what this app is not"
   callout and the emergency number never disappear from a screen for aesthetic or space reasons.
   See also §4.2 — they must be legible, not merely present.
4. **No engagement mechanics.** No notifications, no streaks, no badges, no daily reminders. This is
   a stated stance on the app's home page, not an oversight.
5. **No network egress.** No analytics, no telemetry, no third-party crash reporting, no remote web
   font. The app promises records never leave the phone. **Any dependency that opens a socket must
   be raised with the owner before being added.**

### Blocked content — do not display

Tracked in `content/sources.md`; summarised here so it is not missed:

- **The three `facts` claims (F1–F3)** make efficacy claims with no source. They are extracted into
  the packs but must not be displayed. **The "Comprendre" screen cannot be built until they are
  sourced.**
- **`s5MotA` / `s5MotB`**, the first-person author's note marked `BROUILLON` in the mockup, is held
  out of the packs entirely. It was written by someone other than this app's author.

---

## 7. Known exceptions and standing debts

**Colour literals in `app.json`.** `splash.backgroundColor` and `android.adaptiveIcon.backgroundColor`
hold `#E9ECF1`. Native config is read by the build system and cannot import TypeScript, so this
cannot go through `tokens.ts`. This is the **only** permitted exception. `lint:tokens` cross-checks
that any hex in `app.json` is a value that actually exists in `tokens.ts`, so it can't drift.

**Two dependencies, both justified under health rule 5:**

- `react-native-svg` — the 22 icons, the brand mark, the belief-slope graphic. Unavoidable; RN has no
  vector primitives.
- `expo-linear-gradient` — the footer fade (`--papier` → `--papier-0`) and the slope gradient.

Neither is a component library nor a styling framework. Neither opens a socket. Recorded in the
"no network" ADR.

**Test database.** `node:sqlite` (built into Node ≥ 22.5, used here on 24) rather than
`better-sqlite3`: real SQL in tests with no native module to compile. CI pins Node 24 for this
reason.

---

## 8. Platform reality

**iOS cannot be verified from this machine.** Development happens on Windows, where the iOS
simulator does not exist. The acceptance criterion is therefore:

> Android emulator + Expo Go green, no platform-specific API, CI green.

iOS is deferred to a later verification pass on macOS. **A future session must not treat the absence
of iOS verification as a failure or a gap to fix** — it is a known, accepted constraint. Keep the
code free of platform-specific assumptions so that pass is cheap when it happens.

**"Pixel-accurate" means shared tokens, not identical rendering.** CSS and Yoga disagree about
line-height, font metrics, and sub-pixel text layout; identical tokens will not produce byte-identical
output. The agreed criterion is: shared tokens strictly identical, text blocks visually equivalent.
The evidence is screenshots of the journal in four states (fr/en × light/dark) at 430px, side by side
with the mockup.

---

## 9. Working method

1. Work in **coherent batches** with atomic commits. Run `npm run check` on each.
2. **If a decision is ambiguous, ask. Don't guess.** A silent assumption costs more than a question
   on this project.
3. **If a rule in this file or in `prompt-init.md` looks wrong or self-contradictory, say so before
   writing the code, never after.** The rules are there to be discussed, not ignored. This has
   already paid for itself once: the contrast defect in §4.2 was found this way.

### Batch status

- **B0 — scaffolding** ✅ Expo + strict TS + expo-router + jest, the five scripts, pre-commit hook,
  CI, this file.
- B1 — tokens, both themes, contrast test, `lint:tokens` hardening
- B2 — icon registry and UI primitives
- B3 — i18n packs and parity test
- B4 — versioned reference content and integrity test
- B5 — domain types, SQLite, migrations, the four invariant tests
- B6 — the journal route, reading the database for real
- B7 — ADRs, README, acceptance walkthrough

Out of scope for this phase, deliberately: the seven-step flow, the distortion sheet, the
"Comprendre" page, re-rating UI, export. **Explicitly excluded from v1: any LLM assistance**
(thought rephrasing, distress detection). A poorly calibrated suggestion on a thought like "I'm
worthless" can reinforce the belief instead of loosening it. These arrive only after a dedicated
evaluation harness exists.
