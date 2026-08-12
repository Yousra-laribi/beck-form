# Sources

Health content rule 1: **no efficacy claim without a source.** Every statement this app makes about
CBT must appear below, tied to a reference. No figure, no rate, no effect size that isn't sourced.

This file is a ledger, not a formality. A claim that isn't here does not ship.

---

## Verified references

*(none yet)*

---

## Blocked claims — extracted, not displayable

These three strings exist in the mockup's `facts` array and will be extracted into the language
packs. They make efficacy claims and **carry no source**, so they are blocked: the "Comprendre"
screen that displays them cannot be built until this section is resolved.

The blocking is deliberate and enforced by the harness rather than by memory — see the
reference-integrity test (B4) and `CLAUDE.md`.

| # | Claim (fr / en) | Needs |
|---|---|---|
| F1 | « La TCC est l'une des psychothérapies les plus étudiées. » — *Son efficacité sur la dépression et les troubles anxieux repose sur des centaines d'essais contrôlés.* / "CBT is one of the most studied psychotherapies." — *Its effectiveness for depression and anxiety disorders rests on hundreds of controlled trials.* | Evidence on CBT efficacy for depression and anxiety |
| F2 | « En autonomie, ça marche moins bien qu'accompagné. » — *Le bénéfice est réel, mais nettement plus grand quand un professionnel suit, même de loin.* / "On your own, it works less well than with support." — *The benefit is real, but markedly larger when a professional follows along, even at a distance.* | Comparison of self-administered vs. guided/supported CBT |
| F3 | « C'est un entraînement, pas une révélation. » — *L'effet vient de la répétition. Les premières fiches sont laborieuses, et c'est normal.* / "It's training, not revelation." — *The effect comes from repetition. The first records are laborious, and that's normal.* | Weaker claim, but still asserts a mechanism — check whether it needs a source or can be reworded as description rather than efficacy |

**Domains the owner will supply references for** (owner's note, PLAN Q4):

1. CBT efficacy for depression and anxiety
2. Self-administered vs. supported CBT
3. HAS or NICE recommendations

No candidate references are proposed here by design. A plausible-looking but unchecked citation in a
health app is the exact failure this rule exists to prevent — it is worse than a visibly empty
section, because it looks finished.

---

## Held-out content (not a sourcing matter)

`s5MotA` / `s5MotB` — the first-person author's note, marked `BROUILLON` in the mockup. Written by
someone other than this app's author, so it must not enter the language packs. Held out, not
extracted. See `CLAUDE.md`, "Content rules — health".
