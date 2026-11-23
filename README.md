# AI Slop Killer by Customer Impact

A [Customer Impact](https://customerimpact.be) product. **Created by Tony.** All credit for the method and the product goes to Tony.

AI Slop Killer is a Claude Code skill that finds the patterns readers notice in AI-assisted writing, shows exactly where they are, and fixes them in the writer's own voice. It also includes a full conversion audit for sales pages, funnels, ads and emails.

It scores the writing, never the author. It doesn't detect AI, and it doesn't promise to get past AI detectors.

## What it does

| Mode | What you get |
|---|---|
| **Check** | A slop score from 0 to 100 (lower is better), every pattern quoted with its line, and a fix for each |
| **Fix** | Up to three questions for the details only you know, then a rewrite in your voice with before and after scores |
| **Voice** | A profile built from 3–5 of your own pieces, so your real habits stay and only the patterns go |
| **Deep edit** | Structure and specificity coaching beyond the pattern list |
| **Conversion audit** | A Copy Score plus the 5 biggest wins, a Section Map, a deep line-by-line, a proof check or a rewrite for sales copy |

**Channels:** LinkedIn, X, blog, newsletter, email, cold email, cover letter, academic writing and sales copy.

## How it works

1. **A fixed rule scanner runs first.** It is plain Node with 46 rules, no dependencies and the same result every run. It catches:
   - negation pivots ("it's not X, it's Y")
   - stock openers and closers
   - formulas ("Stop X. Start Y.")
   - inflated importance and vague attribution
   - chatbot leftovers and invisible characters
   - emoji bullets, hashtag blocks and engagement bait
   - machine rhythm, broetry and a missing-contractions check
2. **Then Claude does the judgment pass.** It drops false alarms and adds what no regex can see:
   - generic claims
   - forced lists of three
   - synonym cycling
   - fake specifics
   - no opinion
3. **Fixes are checked.** Every rewrite is re-scanned and must score lower with no serious patterns left.

## Use it

1. Open Claude Code in this folder (Node 22+).
2. Paste text and say "check this", "fix it", "learn my voice" or "run the 5 wins audit". See `START-HERE.md`.

Scanner only:

```
npm run lint -- draft.md --channel linkedin
node .claude/skills/ai-slop-killer/scripts/ai-slop-killer.mjs compare before.md after.md
node .claude/skills/ai-slop-killer/scripts/ai-slop-killer.mjs voice tony samples/*.md
```

## Folder layout

```
.claude/skills/ai-slop-killer/
  SKILL.md                 the skill: modes, scanner-first flow, rules of conduct
  scripts/                 the scanner: rules.mjs, engine.mjs, voice.mjs, ai-slop-killer.mjs
  resources/               report, fix, voice, tells, channels/
  resources/conversion/    conversion audit: scoring, modes, copy types, 34 section guides, 8 craft guides
context/                   your input: samples, notes, voice profiles
audits/                    saved reports and rewrites
tests/                     regression set (24 slop samples, 12 human controls) and end-to-end outputs
```

## Development

```
npm test
```

Every new rule needs a sample in `tests/corpus.json` that triggers it. The human controls must stay at 19 or below.

---

© Customer Impact. Created by Tony. All rights reserved.
