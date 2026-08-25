# 0002 — No network egress

- **Status:** accepted
- **Date:** 2026-08-25
- **Decided in:** the B0 planning round (`PLAN.md` §8, Q8, Q10)
- **Governs:** `CLAUDE.md` §6 rules 5 and 6, §7

## Context

The app's home page states that records never leave the phone. That is not marketing copy; it is the
premise that makes the rest of the product defensible. A thought record contains the sentences
someone tells themselves at their worst — the most sensitive text this app will ever hold, and
material that in most jurisdictions would be treated as health data the moment it were transmitted.

A promise of that kind is not kept by intending to keep it. It is kept by having nothing in the
binary that could break it, because the ways it breaks are all ordinary: an analytics SDK added for a
funnel question, a crash reporter added after a bad release, a web font that was already in the
mockup's `<head>`.

## Decision

**No network egress. No analytics, no telemetry, no third-party crash reporting, no remote font, no
hosted model.**

**Any dependency that opens a socket must be raised with the owner before being added.** Not reviewed
afterwards — raised before, because a dependency is cheapest to refuse on the day it is proposed.

Two dependencies were raised under this rule and approved:

| Dependency | Why it is needed | Why it does not breach this ADR |
|---|---|---|
| `react-native-svg` | the 22 icons, the brand mark, the belief-slope graphic | React Native has no vector primitive; the library renders locally and opens no socket |
| `expo-linear-gradient` | the footer fade (`papier` → `papier0`), the slope gradient | same — a native view, no I/O |

Neither is a component library nor a styling framework. That distinction matters: the objection to a
component library here is not weight, it is that such libraries acquire telemetry over time.

### Build time is not run time

The mockup pulls Newsreader, Karla and IBM Plex Mono from the Google Fonts CDN. That is a runtime
fetch and it is forbidden. Downloading the same files once, into `assets/fonts/`, so they ship inside
the bundle, is a build-time operation and is permitted (Q10, since done — see
`assets/fonts/README.md`).

The line is: **the shipped app makes no request.** What the repository does on a developer's machine
before shipping is a different question, and it is answered by the usual supply-chain caution rather
than by this rule.

### The log is egress too

Health rule 6 is the complement of this ADR and belongs beside it. This rule stops records leaving
over the network; it does nothing about them being written to the device log, where any app with log
access — and any crash dump — can read them.

So: **never log record content**, in any build, including development. And the part that actually
catches people — **error handling never serialises the object it received**. An error boundary that
logs the failing component's props, a redbox showing state, a `JSON.stringify` in a debug helper, a
message built as `` `bad record: ${JSON.stringify(r)}` ``: none of these looks like a
`console.log(record)`, and every one of them puts the text of a thought into the log. Error
boundaries log `error.message` and `componentStack` only. Exception messages cite `record.id`.

Enforced by `no-console: error` in `src/db/` and `src/domain/`.

## Alternatives considered

**Opt-in telemetry.** Rejected. An opt-in toggle still means the code path, the SDK and the endpoint
all exist in the binary, so the promise on the home page becomes conditional and the audit surface
becomes the toggle rather than the absence of the feature. The honest version of "we collect nothing"
is having nothing to switch on.

**Crash reporting only, no analytics.** Genuinely tempting, and rejected with more reluctance than the
others — see the consequence below. Crash reports routinely carry stack-adjacent state, and the
reporting SDKs are exactly the ones that add breadcrumbs over time.

**Remote reference content**, so the eight distortions could be updated without a release. Rejected:
it opens a socket for a payload that changes once a year, and `content/` is versioned in the repo
with `refVersion` stamped per record, which solves the real problem (displaying an old record against
the reference set it was written under) without a request.

## Consequences

**Field failures are invisible.** No crash reporter means a crash on a device the owner does not hold
is not observed at all — no rate, no stack, no signal that a release regressed. This is the sharpest
cost of this ADR and it is accepted. The compensating controls are the `npm run check` gate, the
invariant tests, and a small enough surface that the owner can reproduce on the device in hand.

**No remote kill switch, no forced migration.** A bad release is fixed by shipping another one and
waiting for people to take it.

**No LLM assistance in v1.** Partly this ADR — any hosted model is egress by definition. But the
exclusion in `CLAUDE.md` §9 rests on a second, independent reason: a poorly calibrated suggestion on a
thought like "I'm worthless" can reinforce the belief instead of loosening it. Even a fully on-device
model would still need to clear that bar. That argument deserves its own ADR (0004) rather than
riding along here, because if this one were ever relaxed, the calibration objection must survive it.

**The export debt is the standing tension with this rule.** "We never send anything anywhere" reads
as a trap to someone who has just lost two years of records with a phone. That tension is real and it
is not resolved by restating the rule. It is resolved by a **local, user-initiated export to a file
the user chooses, with no network** — which weakens nothing here. Owed before any public release
(`CLAUDE.md` §7).

**Nothing automated enforces the socket rule yet.** Rules 5 and 6 are enforced unevenly: `no-console`
is a lint error, but "no dependency opens a socket" is currently a human reading `package.json` at
review time. A dependency-manifest check would close that gap and is worth doing before the surface
grows.

## See also

- `CLAUDE.md` §6 rules 5 and 6, §7 (approved dependencies, the export debt)
- `PLAN.md` §8, Q8 (the two dependencies) and Q10 (fonts)
- `assets/fonts/README.md` — what was downloaded, and under which licence
- ADR 0004 (not yet written) — no LLM assistance in v1
