# 0001 — A completed record is append-only

- **Status:** accepted
- **Date:** 2026-08-25
- **Decided in:** the B0 planning round (`PLAN.md` §8, Q7)
- **Governs:** `CLAUDE.md` §3.1, §3.5

## Context

This app is a notebook of dated thought records. Each record is a snapshot: what someone thought on a
particular day, how strongly they believed it, and what they made of it. Later, the same belief gets
re-rated — that is the whole method.

The value of the object is therefore **the distance between two datings**, not its current state. A
record that has been edited to say what the person believes today has lost the only thing that made
it worth keeping: the evidence that they once believed something else. On a screen that exists to
show someone they have moved, an editable past is not a convenience — it silently deletes the
finding.

There is a second, quieter reason. Cognitive restructuring is uncomfortable to reread. The urge to
tidy up an old record, or to soften what one wrote at the worst moment, is precisely the urge the
method asks the person to sit with. A store that cannot be rewritten takes that decision off the
table rather than offering it every time the record is opened.

## Decision

**A completed record is never modified. The only permitted write against it is appending to
`reevaluations`.** There is no `UPDATE` on `croyanceApres`, ever.

This is enforced structurally rather than by convention:

1. **`reevaluations` is its own table.** Appending a re-rating is an `INSERT` into a child table, not
   an `UPDATE` of a JSON column on the records row. The domain type keeps its nested array; the
   mapping layer joins. This is the load-bearing choice — it is what turns the rule from something
   tested into something that has no syntax available to break it.
2. **Mutable preferences live apart.** Language, theme and region genuinely change, and they live in
   `src/db/prefs.ts`, physically outside `src/db/records/`, using `INSERT OR REPLACE`.
3. **Consequently the token `UPDATE` appears nowhere in `src/`.** A test greps for it with zero
   allowed exceptions.
4. **SQL keywords are upper case in `src/db/`,** enforced by lint. This is not cosmetic: it is what
   makes rule 3 sound. Without it a lower-case `update` slips past the grep; with a case-insensitive
   grep instead, every React `updateX` helper fails the build. The casing rule exists to let the
   `UPDATE` grep be both exact and exception-free.
5. **Migrations are immutable once shipped** (`CLAUDE.md` §3.5). This is the same invariant applied to
   the schema instead of the rows: the past is appended to, never rewritten. Editing a migration that
   has already run on a device means fresh installs get a different schema from existing ones — a
   divergence that surfaces months later as corrupt reads on the oldest and most valuable records.

A rule with no carve-outs cannot quietly erode. That is the point of the zero-exception grep, and it
is why the exception people usually ask for — "just for prefs" — was answered by moving prefs out of
reach instead.

## Alternatives considered

**`reevaluations` as a JSON column on the records table.** Simpler schema, one fewer join. Rejected:
appending a re-rating then *is* an `UPDATE` on the records row, so the invariant becomes a convention
that a code review has to catch, rather than a statement the codebase cannot contain.

**Row versioning / soft delete.** Keep every version, mark the current one. Rejected as heavier
without buying anything the child table does not already give: there is exactly one kind of legitimate
mutation here, and it has a name.

**Allow edits for a grace period after creation.** Rejected as a rule with a clock in it, which is the
kind that erodes. See the consequence below for how the real need is met instead.

## Consequences

**A typo in a completed record cannot be fixed.** This is a genuine cost and it is accepted
deliberately, not overlooked. The mitigation is not an edit window but a modelling requirement, and
it lands in B5:

> A record in progress is **not yet a record**. Drafts must be modelled explicitly, as a separate
> mutable thing that becomes an immutable record at completion. If drafts are stored as records with
> a status flag, every screen that touches a draft acquires a reason to `UPDATE`, and the invariant
> is gone.

This is the main open design task this ADR hands to B5.

**The no-export debt gets sharper, not softer.** Records live only in the device's SQLite file
(`CLAUDE.md` §7). Append-only protects a record from its author; it does nothing to protect it from a
lost phone. A local, user-initiated export is owed before any public release, and this ADR is part of
why: an archive that cannot be edited and cannot be copied is not an archive, it is a hostage.

**Testing gets easier.** No mutation means no ordering-dependent state, so repository tests are
setup-and-assert with no teardown between cases.

**A future feature will want to break this.** Deletion of a single record is the likely one, and it is
not settled here — deleting a row is not the same statement as rewriting one, and the argument for
letting someone remove their own writing is strong. When it comes up, it needs its own ADR, and it
must not arrive as a quiet `UPDATE ... SET deleted = 1`.

## See also

- `CLAUDE.md` §3.1 (the invariant), §3.5 (migrations), §7 (the export debt)
- `PLAN.md` §3 and §8, Q7 — where the strict, zero-exception form was confirmed
