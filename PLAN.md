# PLAN — foundations and harness

Status: **approved**. B0 complete. See §8 for the decision log and §9 for what B0 changed.

Written in English to match `init/prompt-init.md`; say the word and I'll switch it and `CLAUDE.md` to French.

---

## 1. What I read, and what I verified

Read in full: `init/prompt-init.md`, `init/maquette-fiche-beck.html` (1466 lines). The repo otherwise
holds one commit, a 3-line `README.md`, and a remote at `github.com/Yousra-laribi/beck-form`.
Node 24.17.0, npm 11.13.0.

Rather than trust my reading of the mockup, I extracted and counted. These numbers are measured,
not estimated, and they become the fixtures the tests assert against:

| Thing | Measured |
|---|---|
| CSS custom properties in `:root` | 18 — 16 colors + `--r` (16px) + `--pad` (22px), redeclared in full for dark |
| Color literals **outside** `:root` | 4 — see §2.1 |
| Icons in the `ICO` registry | 22 (matches the prompt) |
| Distortions | 8, identical ids both languages, each with `nom, tell, def, ex, impact, q[]` |
| Questions per distortion | exactly 3, all 8, both languages |
| Emotions | 7, identical ids both languages |
| `ui` keys | 94 fr / 94 en — **already at parity, no missing key, no empty value** |
| Structured arrays | `facts` 3·3, `choix` 5·5, `tour` 7·7, `steps` 7·7, `exemples` 2·2 |
| Steps carrying a placeholder | 5 of 7, same 5 both languages |
| Strings containing HTML markup | 4 `ui` keys (`s2Intro`, `s6C`, `safety`, `vide`) + 3 `tour` entries |

The mockup's packs being already at parity is good news: the parity test starts green, and its job
becomes keeping it that way.

---

## 2. What I found that the prompt and the mockup disagree on

Flagging these rather than silently picking a side.

### 2.1 The "no hex outside tokens" rule has four pre-existing violations

The mockup itself puts four color literals outside `:root`:

- `#A9B0BD` — `textarea::placeholder`
- `rgba(30,36,56,.09)` — the focus ring on inputs
- `rgba(12,16,28,.4)` and `rgba(12,16,28,.28)` — the device-frame and bottom-sheet shadows

None has a dark-theme counterpart. **Proposal:** promote all four into `tokens.ts` as named
semantic tokens (`placeholder`, `focusRing`, `ombreCadre`, `ombreSheet`) and derive dark values from
the existing dark palette. That keeps the rule literally true instead of carving out exceptions.
The dark values are the only thing I'd be inventing — I'll propose them for your eye before
committing. → **Question Q1**

### 2.2 The data model field names do not actually match the mockup

The prompt says field names "stay aligned with the mockup". They don't:

| `prompt-init.md` | mockup |
|---|---|
| `createdAt` | `date` |
| `penseeAuto` | `pensee` |
| `intensiteAvant` | `intensite` |
| `croyanceAvant` | `croyance` |
| `argumentsPour` / `argumentsContre` | `pour` / `contre` |
| `reevaluations` | `reeval` |

The mockup also has no `id`, `lang` or `refVersion` on its records. **I'm taking the prompt's
TypeScript as normative** — it's the more explicit and better-named of the two, the mockup's
shorthand exists only because it's a single-file demo, and the persisted schema is the thing that's
expensive to change later. The mockup names disappear with the mockup. Flagging in case you meant
the opposite. → **Question Q2**

### 2.3 Four `ui` strings carry HTML, and React Native has no `innerHTML`

`s2Intro` and `s6C` use `<strong>`, `vide` uses `<br>`, `safety` uses `<a>`, and 3 `tour` entries use
`<em>`, `<br>` and `<span class="num">`. Two of these — `safety` and `vide` — are on the journal
screen, which **is** in scope for this phase.

Splitting them into several keys would break the one-string-one-key model and make the parity test
weaker. **Proposal:** keep one key per string and define a tiny inline-markup convention rendered by
a `<RichText>` primitive — `**bold**`, `\n` for the break, `[text](tel:3114)` for the link, and
`{num}` for the tabular-numerals span. Four marks, a ~40-line renderer, no dependency, and the
parity test can additionally assert that both languages use the *same set of marks* in a given key.
→ **Question Q3**

### 2.4 The three research claims have no sources, and health rule 1 forbids that

`facts` asserts "one of the most studied psychotherapies", "hundreds of controlled trials", and
"works less well unsupported than supported". These are exactly the statements rule 1 says must be
tied to `content/sources.md` — which doesn't exist.

They live on the "Comprendre" screen, which is out of scope, but the strings get extracted into the
language packs during this phase, so the problem lands now.

**I will not invent citations.** A fabricated reference in a health app is the failure mode rule 1
exists to prevent, and I'd be guessing at exactly the meta-analyses that support these specific
phrasings. → **Question Q4**

### 2.5 `--encre-3` fails contrast in the light theme, and the crisis notice uses it

Measured contrast ratios:

- light: `#8A91A1` on `#E9ECF1` = **2.67:1** — below WCAG AA for normal text (4.5:1) *and* below
  the large-text floor (3:1)
- dark: `#79808F` on `#161A24` = **4.39:1** — marginally under AA

`--encre-3` carries the eyebrows, captions, card dates, step counters and `.dtell` lines. It also
carries `.safety` at 12px — the crisis-line notice that health rule 3 makes non-negotiable. The most
important text on the journal screen is currently the least legible text in the system.

I'm not touching it: the prompt says don't "improve" the design without asking. But it's a real
finding and I'd rather raise it now than after everything is built on the token. → **Question Q5**

### 2.6 The mockup carries an author's `BROUILLON` note

`s5MotA` / `s5MotB` sit under `<!-- BROUILLON - a reecrire avec vos propres mots, ou a supprimer. -->`.
Out-of-scope screen, but the strings would be extracted now. → **Question Q6**

---

## 3. Technical choices to settle

Recommendations, with reasoning. Objections welcome; silence I'll read as approval.

**Test runner → `jest-expo`.** The prompt allows either. Vitest on React Native means assembling
your own transform and mock stack; `jest-expo` is the maintained preset and handles the RN module
graph. Vitest would cost days for no benefit here.

**SQLite in tests → a thin driver seam.** `expo-sqlite` doesn't run in Node, so it can't be tested
directly. I'll define a ~5-method `SqlDriver` interface, implement it twice (`expo-sqlite` in the
app, `better-sqlite3` as a devDependency in tests), and write every repository against the
interface. This buys real migration and round-trip tests against a real SQL engine, rather than
testing a mock. Cost: one indirection layer.

**`reevaluations` → its own table, not a JSON column.** With a JSON column, appending a re-rating is
an `UPDATE` on the records table — the exact statement invariant 1 forbids. With a child table,
appending is an `INSERT` and the invariant becomes structurally true instead of merely tested. The
`ThoughtRecord` interface keeps its nested array; the mapping layer joins.

**Records and preferences physically separated.** Preferences (language, theme) genuinely mutate.
Keeping them in `src/db/prefs.ts` with `INSERT OR REPLACE`, away from `src/db/records/`, lets
invariant 1's test be the strongest possible version: **the token `UPDATE` appears nowhere in
`src/`**. A grep with zero allowed exceptions is a rule that can't quietly erode. → **Q7**

**Pre-commit hook → plain `.githooks/` + `core.hooksPath`.** No husky, no dependency, nothing that
installs on `npm ci`. One file, one `git config` line, documented in `CLAUDE.md`.

**Theme → follows the system only.** The mockup has `prefers-color-scheme` and no toggle. `useColorScheme()`
mirrors that. No settings screen in this phase.

**`clamp()` → a `fluid(min, vw, max)` helper.** `h1` and `.prompt` use viewport-relative type that RN
can't express. A helper reading `Dimensions` reproduces the same three numbers rather than
hardcoding one end of the range.

**Two dependencies I need, both bundled and offline:** `react-native-svg` (the 22 icons, the mark,
the bilan slope, the loop diagram — unavoidable) and `expo-linear-gradient` (the footer fade
`--papier → --papier-0`, and the bilan gradient). Neither is a component library or a styling
framework, neither opens a socket. Flagging per health rule 5. → **Q8**

**`tokens.ts` scope — a proposal beyond the prompt.** Extracting only `:root` gives you colors plus
two numbers, which leaves every font size, line height and gap as a magic number in components — and
the mockup uses 14 distinct font sizes (10, 10.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 16, 16.5, 17,
19, 20…). I'd like `tokens.ts` to also carry a `type` scale and a `space` scale **enumerated from
the mockup**, not invented. Same discipline, wider coverage. → **Q9**

---

## 4. Proposed file tree

```
beck-form/
├── app/                              # expo-router
│   ├── _layout.tsx                   # theme + i18n + db providers
│   └── index.tsx                     # journal — the one live route
├── src/
│   ├── theme/
│   │   ├── tokens.ts                 # the ONLY file allowed a color literal
│   │   ├── ThemeProvider.tsx
│   │   └── useTheme.ts
│   ├── ui/                           # primitives, hand-built
│   │   ├── Text.tsx  RichText.tsx  Button.tsx  Card.tsx
│   │   ├── Screen.tsx  Footer.tsx  Track.tsx  Icon.tsx
│   │   └── Mark.tsx                  # the logo, with its reduced-motion final state
│   ├── icons/registry.ts             # 22 paths, stroke=currentColor
│   ├── i18n/
│   │   ├── fr.ts  en.ts  types.ts  index.ts
│   │   └── format.ts                 # Intl date formatting
│   ├── db/
│   │   ├── driver.ts                 # SqlDriver interface
│   │   ├── driver.expo.ts  driver.node.ts
│   │   ├── migrations/001_init.sql
│   │   ├── records/                  # zero UPDATE, statically enforced
│   │   ├── prefs.ts
│   │   └── serialize.ts
│   ├── domain/
│   │   ├── types.ts                  # ThoughtRecord, DistorsionId, EmotionId…
│   │   └── reference.ts              # loads + validates content/, exposes refVersion
│   └── region/crisis.ts
├── content/
│   ├── distorsions/v1/{fr,en}.json   # versioned reference set
│   ├── crisis/{FR,default}.json
│   └── sources.md
├── tests/
│   ├── i18n.parity.test.ts
│   ├── invariants/{append-only,identifiers,no-translation,ref-version}.test.ts
│   ├── tokens.no-literals.test.ts
│   ├── reference.integrity.test.ts
│   ├── db.{migrations,roundtrip}.test.ts
│   └── dates.test.ts
├── scripts/{lint-tokens.mjs, seed-dev.mjs}
├── docs/decisions/000{1..4}-*.md
├── .githooks/pre-commit
├── .github/workflows/check.yml
├── assets/fonts/
├── CLAUDE.md   PLAN.md
└── init/                             # mockup kept as the reference it is
```

---

## 5. Task ordering

Seven batches, one atomic commit each, `npm run check` green at every boundary.

**B0 — scaffolding.** Expo SDK + strict TS + expo-router + jest-expo. The five scripts. The
pre-commit hook. The CI workflow. A first `CLAUDE.md` — written *now*, not last, so the rules govern
the code instead of describing it afterwards. Ends with `check` passing on a placeholder test.

**B1 — design system.** `tokens.ts` (both themes, the four rescued literals, type and space scales),
`ThemeProvider`, `scripts/lint-tokens.mjs` + its test. The lint script is written *before* the
components, so it can never go green retroactively.

**B2 — primitives and icons.** The 22-path registry. `Text`, `RichText`, `Button`, `Card`, `Track`,
`Screen`, `Footer`, `Icon`, `Mark`. Touch targets 44/50. Every animated component asserted to render
its final state under reduced motion.

**B3 — i18n.** Both packs extracted whole, typed so that `en` must structurally match `fr`. Parity
test (keys, emptiness, array lengths, ids, and matching markup marks). `Intl` date formatting +
tests.

**B4 — reference content.** `content/distorsions/v1/{fr,en}.json`, the crisis-resource structure,
`sources.md`. Integrity test: 8 entries, every field non-empty, exactly 3 questions, one existing
icon per id, ids matching the `DistorsionId` union.

**B5 — data layer.** Domain types, driver seam, migration 001, `records/`, `prefs.ts`, serialization.
The four invariant tests, including the repo-wide no-`UPDATE` grep. Round-trip test through real
SQL.

**B6 — the live route.** The journal, reading SQLite for real: empty state and populated state, FR/EN,
light/dark. Dev-only seed script. This is the batch that proves the chain.

**B7 — harness close-out.** Final `CLAUDE.md`, the four ADRs (append-only, identifiers vs labels, no
LLM in v1, no network), README, and the acceptance-criteria walkthrough with screenshots.

Out of scope and deliberately untouched: the seven-step flow, the distortion sheet, the "Comprendre"
page, re-rating UI, export. The strings and content for them get extracted; the screens don't get
built.

---

## 6. Questions

### Blocking — I'd rather not start B1–B4 without these

**Q1 — the four orphan color literals.** Promote to named tokens and let me propose dark values, or
handle differently?

**Q2 — field names.** Confirm the prompt's TypeScript wins over the mockup's shorthand (§2.2).

**Q3 — HTML inside strings.** Approve the four-mark inline convention + `RichText`, or do you prefer
splitting the strings into multiple keys? (§2.3)

**Q4 — sources for the three research claims.** Three ways forward, pick one:
&nbsp;&nbsp;(a) you supply the references;
&nbsp;&nbsp;(b) I propose candidates, clearly marked unverified, and you validate before they ship;
&nbsp;&nbsp;(c) `sources.md` ships as a stub listing the three claims as *blocked, do not display*, and
the "Comprendre" screen stays unbuildable until it's filled.
I lean (c) now + (b) alongside, so the harness enforces the rule from day one rather than
inheriting a debt.

**Q7 — no `UPDATE` anywhere in `src/`.** Confirm the strict version — records and prefs split, zero
exceptions, grep-enforced. It's stricter than the prompt asks and I want it deliberate, not
accidental.

**Q10 — fonts.** Newsreader, Karla and IBM Plex Mono come from the Google Fonts CDN in the mockup,
which health rule 5 forbids at runtime. All three are SIL OFL 1.1, so bundling them is permitted.
But fetching the `.ttf` files is a network operation — do you want me to download them into
`assets/fonts/`, or will you drop them in yourself? (This is build-time, not app-time egress, but
rule 5 says flag anything that opens a socket.)

**Q11 — crisis resources by region.** Offline, region has to come from somewhere. Proposal: read the
device region via `expo-localization`, allow an explicit override in preferences, and fall back to a
generic "your local crisis line" entry when the region is unknown or unpopulated. Only `FR` gets
populated now, per the prompt. Confirm?

### Non-blocking — answer whenever

**Q5 — `--encre-3` contrast** (2.67:1 light, 4.39:1 dark), including on the crisis notice. Leave
exactly as designed, or do you want to revisit the light value? I'll build it as-is unless you say
otherwise. (§2.5)

**Q6 — the `BROUILLON` note.** Extract `s5MotA`/`s5MotB` as-is into the packs, or hold them out until
you've rewritten them? (§2.6)

**Q8 — `react-native-svg` + `expo-linear-gradient`.** Confirm these two are acceptable. (§3)

**Q9 — type and space scales in `tokens.ts`.** Enumerated from the mockup, beyond what the prompt
asked. Yes or no? (§3)

**Q12 — seed data.** The mockup's 2 `exemples` per language. Dev-only seed script, never shipped
(my recommendation — a first-run app that pre-populates someone's private journal with fiction is
odd), or do you want them visible on a fresh install?

**Q13 — reference-set file format.** `content/distorsions/v1/{fr,en}.json` with `refVersion: "1"`,
both files covered by the parity test as well as the integrity test. Or a different shape?

**Q14 — "pixel-accurate on the shared tokens".** What evidence do you want at review? I propose
screenshots of the journal in the four states (fr/en × light/dark) alongside the mockup rendered at
430px.

---

## 7. Where I think this plan is weakest

Two honest caveats.

**The iOS simulator.** You're on Windows 11. `npm run check`, the Android emulator and Expo Go are
all fine here, but I cannot verify the iOS simulator myself — that needs macOS. I can keep the code
free of platform-specific assumptions and the CI green, but the iOS half of that acceptance
criterion will need you or a Mac to sign off. Better said now than discovered at acceptance.

**"Pixel-accurate" across two rendering models.** CSS and Yoga disagree about line-height, font
metrics and sub-pixel text layout. Identical tokens and identical numbers will not produce
byte-identical output. I'll match every shared token exactly and expect small differences in text
block heights — which is why Q14 asks what evidence actually satisfies you.

---

## 8. Decision log

Approved by the owner, with two corrections to the original brief and one reclassification.

**Acceptance criteria amended.**

- "Pixel-accurate rendering" was ill-formed (§7 was right: CSS and Yoga will never agree). It
  becomes: *shared tokens strictly identical, text blocks visually equivalent*, evidenced by
  screenshots of the four states at 430px beside the mockup.
- "Starts on the iOS simulator" is unreachable from Windows. It becomes: *Android emulator +
  Expo Go green, no platform-specific API, CI green*. iOS deferred to a macOS verification pass.
  Recorded in `CLAUDE.md` §8 so no future session reads it as a failure.

**Q5 reclassified to blocking**, and correctly: a 2.67:1 ratio on the crisis notice is an
accessibility defect, not a preference, and fixing it after B1 would mean reworking every component
already built. Handled in the same batch as Q1.

| Q | Resolution |
|---|---|
| Q1 | Promote the four orphan literals to named tokens (`placeholder`, `focusRing`, `ombreCadre`, `ombreSheet`), dark values proposed before commit. No exceptions to the rule. |
| Q2 | Prompt's TypeScript wins over the mockup's shorthand. |
| Q3 | Four-mark convention + `RichText` approved, including the same-marks-per-key parity assertion. **Amended:** the crisis link must take its target from `content/crisis/`, not a language pack — hence a parameterised `[text]({crisisTel})` mark. |
| Q4 | Option (c). `sources.md` lists F1–F3 as blocked, "Comprendre" unbuildable until sourced. **No candidate references proposed, even marked unverified** — the owner supplies them. Domains: CBT efficacy on depression/anxiety, self-administered vs. supported, HAS/NICE. |
| Q5 | **Blocking.** `--encre-3` must reach ≥ 4.5:1 on `--papier` and `--carte`, both themes. Value computed, not estimated, and proposed before commit. Plus a **contrast test over the whole token matrix** — the test is what prevents regression, not the one-off fix. |
| Q6 | `s5MotA`/`s5MotB` held out of the packs entirely. Not extracted. |
| Q7 | Confirmed, strict: zero `UPDATE` in `src/`, `records/` and `prefs.ts` separated. |
| Q8 | `react-native-svg` and `expo-linear-gradient` approved; to be documented in the "no network" ADR with the reason they don't breach rule 5. |
| Q9 | Yes, **but rationalised**: the mockup's 14 font sizes are drift, not intent. Map to 6–8 steps; any mapping moving a value > 1px is raised with the owner. |
| Q10 | Download the three OFL fonts into `assets/fonts/`. Build-time egress, permitted. |
| Q11 | Confirmed. **Added requirement:** the manual region override must stay easy to reach — someone travelling needs it. `FR` populated, generic fallback present from the start. |
| Q12 | Dev-only seed script, never shipped. |
| Q13 | Format validated as proposed. |
| Q14 | Validated, see the amended criterion above. |

## 9. B0 — what actually landed, and what changed from the plan

`npm run check` passes: typecheck → lint → lint:tokens → 11 tests. The Android bundle exports
cleanly, which is the strongest evidence available without an emulator.

Three deviations from §3–§4, all discovered by building rather than by planning:

**`better-sqlite3` dropped for `node:sqlite`.** Node 24.17 ships SQLite built in, no flag needed
(verified). This removes a native dependency, and with it `node-gyp` on Windows and prebuild
availability as a CI risk. CI pins Node 24 for this reason.

**Tests split into `tests/node/` and `tests/native/`** as two Jest projects. Pure logic (harness,
i18n parity, dates, SQL) has no business loading the React Native module graph; components need
`jest-expo`. The split is cheap now and awkward later.

**`app.json` carries two `#E9ECF1` literals** (`splash.backgroundColor`, `adaptiveIcon`). Native
config is read by the build system and cannot import TypeScript, so this is a genuine exception —
the only one. Rather than have `lint:tokens` ignore the file, **B1 will make it cross-check that
every hex in `app.json` exists in `tokens.ts`**, so the exception can't drift into a loophole.

Two dependency fixes worth recording: `react-dom` had to be pinned to 19.2.3 (expo-router's web deps
pull radix/vaul, which hoisted an incompatible 19.2.8 and broke every subsequent `npm install`), and
`babel-preset-expo` had to be declared explicitly because it doesn't hoist to the root where
`babel.config.js` resolves it. Both are real conflicts, resolved rather than papered over with
`--legacy-peer-deps`.
