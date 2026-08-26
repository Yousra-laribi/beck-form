# PLAN — foundations and harness

Status: **approved**. **B0 to B3 complete; B4 is next.** See §8 for the decision log, §9 for what B0
changed, §10 for B1/B2 and the font batch, §11 for the debts currently open, and §12 for B3.

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
its final state under reduced motion. — *`RichText` moved to B3; see §10.*

**B3 — i18n.** Both packs extracted whole, typed so that `en` must structurally match `fr`. Parity
test (keys, emptiness, array lengths, ids, and matching markup marks). `Intl` date formatting +
tests. **Plus `RichText`, inherited from B2.**

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
| Q10 | Download the three OFL fonts into `assets/fonts/`. Build-time egress, permitted. **Done, §10.** |
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

## 10. B1 and B2 — what actually landed

`npm run check` green: typecheck → lint → lint:tokens (19 files, `app.json` cross-checked) → 92 tests
across the two Jest projects.

**B1 and B2 shipped in one commit** (`f521fe3`, PR #1), not two. §5 asks for one atomic commit per
batch and that was not honoured. Recorded rather than tidied away: the two batches are genuinely
coupled — `lint:tokens` has to be green before a primitive exists, and the primitives are what prove
the tokens — but the commit is large enough to be hard to review, and the next batches go back to one
each.

**B1 delivered as planned, plus what Q1/Q5 required.** `tokens.ts` carries both themes, the four
rescued literals as named tokens, the rationalised type and space scales, radius, touch and duration.
Four light-theme values moved for contrast (`encre3`, `placeholder`, `gardeTexte`, `apaiseTexte`) and
one dark (`encre3`); `tensionTexte` was nudged for margin because it passed by 0.01. The whole token
matrix is asserted at AA in both themes, which is the part that stops it recurring.

**B2 delivered, minus `RichText`, plus two things not in §4.**

- **`RichText` moved to B3.** It cannot be written now: three of its four marks are defined by
  content it has no access to yet — `[text]({crisisTel})` resolves against `content/crisis/`, which
  is B4, and the mark set it must render is asserted by the i18n parity test, which is B3. Writing it
  in B2 would have meant inventing a placeholder for the crisis link, which is exactly the
  hardcoded-number failure Q3's amendment exists to prevent. It lands in B3 with the packs.
- **`Chip` was added**, not in §4's list. The mockup's `.dsel` / distortion chips need it and it is a
  primitive by every other criterion.
- **`app/galerie.tsx` was added** — a specimen route rendering every primitive in both themes. Not
  planned, not shipped to users, and the only practical way to review B1/B2 without the seven-step
  flow existing.

### Q10 resolved: the faces are bundled

Five static instances in `assets/fonts/`, with their OFL licences and a provenance README. Only the
weights the mockup's **CSS** actually sets — Newsreader 400, Karla 400/500/600, IBM Plex Mono 400.
The mockup's `<link>` also requests Newsreader 300 and Plex Mono 500; nothing sets either, so neither
ships.

Two decisions worth recording, both forced by the acceptance criterion being **Expo Go**:

- **`useFonts()`, not the `expo-font` config plugin.** The plugin embeds faces into a native build and
  can register one Android family carrying several weights — which would have let `fontWeight: '600'`
  resolve natively. Expo Go loads no natively embedded custom font, so it is unusable here.
- **One family per weight, and `fontWeight` is never set.** `useFonts` keys become the family name on
  both platforms, which is the property CLAUDE.md §8 asks for: nothing for the deferred iOS pass to
  discover. The name records make the alternative unattractive anyway — `Karla_500Medium` declares
  name ID 1 as "Karla Medium", a separate family, while its typographic family (ID 16) is "Karla",
  and Android and CoreText do not agree on which wins.

`Text.tsx` changed accordingly: recipes now select a face by weight rather than setting `fontWeight`.

**Bundling the faces exposed one B2 fidelity defect.** The mockup sets `.btn` at 600 and `.btn.ghost`
at 500, but `Button`'s `discret` variant routed through the same `bouton` recipe, so it rendered at
600. The bug was invisible until now: with no weights loaded, both drew in the platform regular. Added
a `boutonDiscret` recipe at Karla 500. This is applying the mockup's declared value, not re-deciding
one, so it did not need raising — unlike the leading question below.

### Re-verifying the §4.3 type scale against the real metrics

**First, a correction to the premise.** §4.3's rule — *any mapping that moved a value by more than 1px
is raised with the owner* — is about declared px: mockup `font-size: 17px` → `type.large = 16` is a
−1px move whoever renders it. Font metrics do not enter that arithmetic, so re-running the mapping
against the real faces produces **no new deltas on the rule as written**. The six steps and their
mappings stand unchanged.

What the real faces *do* change is everything downstream of the declared number, and there the
measurements are not small. Measured from the TTFs (`head`, `hhea`, `OS/2`, per-glyph `glyf` boxes),
against the Android families `policeSecours` actually resolved to:

| | real face | fallback B1 was built on | delta |
|---|---|---|---|
| x-height, `corps` | Karla 0.48 em | Roboto 0.53 em | **−9.5%** |
| x-height, `titre` | Newsreader 0.43 em | Noto Serif 0.54 em | **−20.5%** |
| x-height, `mono` | IBM Plex Mono 0.52 em | Roboto Mono 0.53 em | −2.3% |
| set width of `n` | Karla 0.60 em | Roboto 0.55 em | **+9.3%** |
| default line box | Newsreader 1.00 em | Noto Serif 1.36 em | **−26%** |

Read as apparent size rather than declared size, several steps move by well over 1px — Newsreader at
`titre` loses 2.20px of x-height, at `hero` max 3.63px. Reported here rather than acted on, because
the fix would be re-deciding the scale, not applying a mapping.

**One finding is a defect, not a difference.** Newsreader declares `sTypoAscender` 0.735 em with zero
line gap and sets `USE_TYPO_METRICS`, so Android honours a 1.00 em box. `É` reaches 0.8695 em above
the baseline. Available space above the baseline is `typoAsc + (leading − 1.00) / 2`, so:

| `Text` variant | size | leading | space | `É` needs | |
|---|---|---|---|---|---|
| `marque` (`.hd-name`) | 20px | `ras` 1.05 | 15.20px | 17.39px | **clips 2.19px** |
| `hero` (`h1`) | 28–33px | `serre` 1.15 | 22.68–26.73px | 24.35–28.69px | **clips 1.67–1.96px** |
| `invite` (`.prompt`) | 27px | `titre` 1.25 | 23.22px | 23.48px | clips 0.26px |
| `titre` | 20px | `titre` 1.25 | 17.20px | 17.39px | clips 0.19px |
| `extrait` | 16px | `titre` 1.25 | 13.76px | 13.91px | clips 0.15px |

`marque` is the app name in the header, on every screen; `hero` is every page heading. On a
French-first app, accented capitals are not an edge case. The bottom three rows are within rounding
and only matter as zero margin.

This was **not** fixed in this batch: `leading.ras` and `leading.serre` come from the mockup's
`line-height: 1.05` and `1.14`, so changing them is re-deciding a design value, which §4.3 and
CLAUDE.md §9.2 say to raise rather than decide. It is the first item in §11.

## 11. Open debts

Carried forward, in the order they should be answered.

1. **Newsreader clips accented capitals at `ras` and `serre`** (§10). Needs an owner decision before
   B6 puts the journal header on screen. Cheapest fix is raising those two leadings to ≈1.28; the
   alternative is a per-face leading correction in `Text.tsx`. Both change how the mockup's headings
   sit, so neither is mine to pick.
2. ~~`RichText` is owed by B3~~ — **done in B3**, with five marks rather than four (§12).
3. **Karla sets 9.3% wider than the face B1 was laid out against.** Every text block gets wider, so
   line wraps and the width of chips and buttons will differ from the B1 screenshots. Nothing is
   known to overflow; it wants an eye on the emulator, which is the point of the galerie pass.
4. **No splash gate.** `useFonts` is async, `expo-splash-screen` is not a dependency, and adding one
   needs raising under health rule 5. Today the root layout renders `null` until the faces load — a
   brief blank frame on cold start, rather than a flash of the wrong font.
5. **ADRs 0003 and 0004** — identifiers vs labels, and no LLM in v1 — are still owed. 0001
   (append-only) and 0002 (no network) are written.
6. **Nothing automated enforces "no dependency opens a socket"** (ADR 0002). `no-console` is a lint
   error; the socket rule is a human reading `package.json`.
7. **B5 must model drafts explicitly.** ADR 0001 hands this over: a record in progress is not yet a
   record, and storing drafts as records with a status flag would reintroduce `UPDATE` everywhere.
8. Unchanged from before: **no export path** (CLAUDE.md §7), **the iOS verification pass** (§8), and
   **F1–F3 unsourced**, which keeps "Comprendre" unbuildable.
9. **`expo-router` bundles a 940 KB Material Symbols icon font**, via `expo-symbols`, into a project
   whose §4.4 says "no icon library". Nothing uses it; it is embedded all the same. Removing it means
   configuring `expo-router`, which was out of scope for the font batch.

## 12. B3 — i18n

`npm run check` green: **169 tests**, up from 126.

### The parity test was written first, and it mattered

Run against **empty** packs it gave **9 red, 14 green**. The fourteen that passed were the symmetric
fr↔en comparisons — empty equals empty — which is exactly the hole the ordering was meant to expose.
It is why the suite now opens with an explicit *are the packs populated at all* guard rather than
relying on the comparisons. Filled packs: all green.

Two facts the test caught that reading would not have:

- **92 `ui` keys, not 94.** `s5MotA`/`s5MotB` are held out entirely (Q6), so the mockup's 94 becomes
  92. The number is pinned in the test rather than derived, so dropping a key fails instead of
  quietly producing a smaller count.
- **Optional fields exist.** `ph` is on 5 of the 7 steps and `fin` on `tour[6]` — §1 had measured the
  5-of-7, but the types, inferred from the first array element, had both wrong. The test now pins
  *which* entries carry them, on both sides.

The packs are generated by script from the mockup, not transcribed: 92 keys × 2 languages by eye is
the drift this batch exists to prevent. The generator refuses to emit if any string still carries
HTML, is empty, or spells a crisis number — and it caught one on its first run.

`dist` and `exemples` stay out of the packs: the eight distortions belong to `content/` under
`refVersion` (CLAUDE.md §3.4, B4's work), and the two examples are seed data for a dev-only script
(Q12).

### Five marks, not four — both departures approved

| Mark | Was | Renders |
|---|---|---|
| `**bold**` | `<strong>` | emphasis |
| `\n` | `<br>` | line break |
| `{num}…{/num}` | `<span class="num">` | tabular numerals |
| `{cit}…{/cit}` | `<em>` | quoted voice, in the serif |
| `{crise}` | `<a href="#">3114</a>` | the crisis resource, label and target both |

**`{cit}`** — the mockup's `<em>` sets `font-style:normal` and switches the face to Newsreader. It is
a register of voice, not emphasis, and cannot fold into `**bold**`.

**`{crise}`** — the approved `[text]({crisisTel})` parameterised the target but left the label
literal, so a pack would have read `[3114]({crisisTel})`: a French number back inside a language
pack, the exact failure CLAUDE.md §5 names. The English strings were worse, carrying `(France)`,
`free, 24/7` and `or your local crisis line` — all claims about a *region*. The owner confirmed the
original formulation was at fault. `CLAUDE.md` §5 is updated.

The grammar lives in `src/i18n/marques.ts`, in one table shared by the renderer and the parity test,
so a string cannot pass parity and then render as literal braces. The parser is recursive because the
marks nest: `s6C` is a crisis resource inside an emphasis, and a flat tokeniser would drop one of
them. Malformed marks degrade to literal text rather than throwing — one of the screens carrying
marks is the crisis notice, and a thrown error there is a blank screen.

### The crisis resource resolves from region, and names nothing it cannot source

`src/region/crisis.ts` is a pure resolver over an **empty** registry: every region falls back to
`content/crisis/default.json`, which carries `tel: null` and no digits at all. B4 populates `FR`.

`RichText` renders a resource with no number as **plain text, not a link** — a link that dials
nothing invites a tap that fails, which is worse in a crisis than a sentence that never invited one.
That branch is the only one exercisable today; the link branch is tested with an injected resource.

`tests/node/region.crisis.test.ts` carries an assertion that is **meant to fail** when `FR` lands,
with a comment saying so and listing the four things it forces to be handled together. Deliberate,
not a bug: an `it.skip` would sit green forever and nobody would notice the day a region was
populated.

### Dates

`new Date('2026-08-25')` parses as midnight **UTC**, so in any timezone behind UTC a record written
on the 25th displays as the 24th. The mockup dodged this with `+"T12:00:00"` at each call site; here
a date-only value is rebuilt through the local-time constructor, so it cannot drift by construction.
`aujourdhuiIso` likewise builds from local components — `toISOString()` would stamp tomorrow's date
for anyone east of UTC late in the evening.

The tests are written to fail on the naive implementation **whatever the machine's timezone**;
otherwise the suite is green in Paris and the bug ships to everyone west of it.

### Wiring

`I18nProvider` resolves language, region and the crisis resource, and sits above `src/ui/` — the
primitives look nothing up (CLAUDE.md §4.5), so `RichText` receives an already-resolved resource.
Language and region come from the device via `src/i18n/appareil.ts`, the only file in `src/i18n/`
that touches a native module. B5 replaces both with stored preferences.

Nothing in this layer can reach a record, which is how CLAUDE.md §3.3 — switching the interface
language never touches a record's text — is kept structurally rather than remembered.
