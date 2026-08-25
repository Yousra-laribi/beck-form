# Bundled type faces

Answer to **Q10**. The mockup loads these three families from the Google Fonts CDN; health rule 5
forbids a remote font at runtime, so they are bundled. Downloading them was build-time egress, which
the decision log permits.

All three are **SIL Open Font License 1.1**. The licence requires that it travel with the fonts, so
`OFL-*.txt` sits beside them. Do not delete those files.

## What is here, and why only this

Counted from the mockup's **CSS**, not from its `<link>`. The `<link>` also requests Newsreader 300
and IBM Plex Mono 500; nothing in the mockup sets either weight, so neither is bundled.

| File | Role | Used by |
|---|---|---|
| `Newsreader_400Regular.ttf` | `titre` | `h1`, `.prompt`, `.hd-name`, `.card-thought`, section headings |
| `Karla_400Regular.ttf` | `corps` 400 | body copy, hints, list items |
| `Karla_500Medium.ttf` | `corps` 500 | `.btn.ghost`, `.dname` |
| `Karla_600SemiBold.ttf` | `corps` 600 | `.btn`, `strong`, `.safety a`, `.aide h4` |
| `IBMPlexMono_400Regular.ttf` | `mono` | eyebrows, dates, counters, tabular numerals |

Italics are not bundled. The mockup uses `<em>` in three places and overrides every one of them with
`font-style:normal` — the italic slot is deliberately empty, not forgotten.

## Provenance

Static instances from [`expo/google-fonts`](https://github.com/expo/google-fonts) (`font-packages/`),
instanced from the Google Fonts variable originals. Licences from
[`google/fonts`](https://github.com/google/fonts) (`ofl/{newsreader,karla,ibmplexmono}/OFL.txt`).

Static instances rather than the variable originals because React Native does not expose variable
font axes: a variable TTF renders at its default instance, so Karla 500 and 600 would both come out
as 400.

```
ab08018ccd276b79fb2c636bb95b9c543598f9d50505fe92506fcb4dae7810cd  IBMPlexMono_400Regular.ttf
ca81c0cee5a620bdbe56f15ccb849f69a464dd47ac0bf581157e2ce0fb602b59  Karla_400Regular.ttf
b2a35a3b8ea689fc39a1b7615fb78e2937cc72fb547666b87eb53cde3c58540d  Karla_500Medium.ttf
0280fd26da568cf059da9cd4407de2ae4c7041d5e419eda86d9aa720d00dcc15  Karla_600SemiBold.ttf
da96d8de6be82192c7e6a6dea423167b573da3fae6e418fab3c86a0bafff523e  Newsreader_400Regular.ttf
```

## One known fidelity difference

Newsreader is an optical-size design (`opsz` 6–72). The browser applies optical size automatically
per font size; a static instance freezes it. Newsreader is only ever set between 15px and 33px here,
so one instance covers the range — but it is a real difference from the mockup, not an equivalence.
