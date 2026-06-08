# Quettamorphosis

A linguistic evolution simulator that traces how words transform through historical sound changes in Tolkien's Elvish languages:

**Primitive Elvish → Ancient Telerin → Old Sindarin → Sindarin**

Live at [quettamorphosis.elvish.nz](https://quettamorphosis.elvish.nz)

## Overview

Quettamorphosis applies hundreds of phonetic rules—each sourced from Tolkien's linguistic writings and David Salo's *A Gateway to Sindarin*—to evolve Primitive Elvish roots into their Sindarin descendants step by step.

### Features

- **Step-by-step evolution** — type a Primitive Elvish word and watch it transform through each language stage
- **Toggleable rules** — enable or disable individual rules or entire language stages to experiment with different evolutionary paths
- **Morpheme tracking** — handles compound words with morpheme boundaries (marked with `+`) and applies sandhi rules at junctions
- **Shareable URLs** — generate links encoding specific inputs and rule configurations
- **Debug console** — browser helpers like `debug('word')` and `rules.enable('pe100')`

## Getting started

### Prerequisites

- Node.js (for running tests and scripts)

### Run locally

This is a static site with no build step. Just serve it locally:

```bash
npx serve .
```

### Run tests

```bash
npm install
npm test
```

Watch mode:

```bash
npm run test:watch
```

### Trace a word (CLI)

Trace a word's evolution from the command line:

```bash
node scripts/trace-word.mjs <word> [stopBeforeOrderId] [startFromStage]
```

Examples:

```bash
node scripts/trace-word.mjs kundō              # full evolution
node scripts/trace-word.mjs kundō 03000         # stop before Sindarin rule 03000
node scripts/trace-word.mjs kundō 03000 OS      # start from Old Sindarin stage
```

Stages: `PE` (Primitive Elvish), `AT` (Ancient Telerin), `OS` (Old Sindarin), `S` (Sindarin).

## Input encoding

When entering words via the URL query string, special characters are encoded as:

| Input | Result | Meaning |
|-------|--------|---------|
| `TH` | θ | voiceless dental fricative |
| `DH` | ð | voiced dental fricative |
| `PH` | ɸ | voiceless bilabial fricative |
| `CH`/`KH` | x | voiceless velar fricative |
| `NG` | ŋ | velar nasal |
| `GH` | ɣ | voiced velar fricative |
| `SS` | ſ | long s |
| `p'` | pʰ | aspirated stop |
| `a'` | á | stressed vowel |
| `a:` | ā | long vowel |
| `.` | `+` | morpheme boundary |

Lowercase digraphs (e.g. `th`) are left as literal characters.

## Project structure

```
├── index.html              # Main page
├── main.js                 # UI logic, rule execution, DOM rendering
├── main.css                # Styles
├── src/
│   ├── primitive-elvish.js # Primitive Elvish sound change rules
│   ├── ancient-telerin.js  # Ancient Telerin rules
│   ├── old-sindarin.js     # Old Sindarin rules
│   ├── sindarin.js         # Sindarin rules + sandhi master switch
│   ├── sandhi.js           # Sandhi rules (morpheme boundary changes)
│   ├── conversions.js      # Pre/post-processing (digraph conversion, etc.)
│   ├── main-logic.js       # Pure logic functions (no DOM) for testability
│   ├── utils.js            # String extensions, syllable analysis, helpers
│   ├── query-string.js     # URL encoding/decoding for shareable links
│   └── debug.js            # Browser console debug tools
├── tests/                  # Vitest test suites
├── scripts/
│   ├── trace-word.mjs      # CLI word tracer
│   ├── export.mjs          # Export rules to JSON
│   ├── check_rules.py      # Python rule checker
│   └── compare.py          # Python comparison tool
└── package.json
```

## How rules work

Each rule is an object with:

- **`orderId`** — sort key determining execution order (e.g. `PE 00100`, `AT 02500`, `S 06500`)
- **`pattern`** — human-readable description of the sound change
- **`mechanic`** — function that applies the transformation
- **`isSandhi`** — if `true`, only runs when the sandhi master switch is enabled
- **`skip`** — if `true`, the rule is disabled by default (opt-in)
- **`input`** — optional array of configurable parameters (checkboxes, text fields)

Internally, digraphs like `th`, `ph`, `ng` are converted to single Unicode characters (θ, ɸ, ŋ) for simpler string processing, then converted back for display.

## Questions & feedback

For questions, comments, or discussion, join the [Vinyë Lambengolmor Discord server](https://discord.gg/Dhmyzrf).

## References

- J.R.R. Tolkien's linguistic papers (compiled at [Eldamo](https://eldamo.org))
- David Salo, *A Gateway to Sindarin* (2004)
