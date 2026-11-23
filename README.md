# AI Slop Killer: a free Claude skill that removes AI slop from your writing

**Find the patterns that make writing read as AI-generated, see exactly where they are, and fix them in your own voice.** A free skill for Claude and [Claude Code](https://claude.com/claude-code): download the zip, add it as a skill, done. The rule scanner inside has zero dependencies.

[![Claude Code skill](https://img.shields.io/badge/Claude%20Code-skill-d97757)](#install-in-one-minute)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-2ea44f)](package.json)
[![Node 22+](https://img.shields.io/badge/node-%E2%89%A522-339933)](package.json)
[![Tests](https://img.shields.io/badge/tests-43%20passing-2ea44f)](tests/)

By [Customer Impact](https://customerimpact.be). Created by Tony, who gets all the credit for the method and the product.

---

## What "AI slop" means here

AI slop is the set of habits that make a reader stop trusting a text: "it's not X, it's Y", an opener that could start any article, three tidy lessons in a row, "stands as a testament", an em dash in every paragraph, a block of hashtags at the end. One of them is harmless. Five in a short post, and readers scroll past.

AI Slop Killer checks your draft for these patterns and scores it from 0 to 100 (lower is better). It quotes each problem with its line number and a fix, and rewrites the piece if you ask. It works on any English text, whether you wrote it yourself, with ChatGPT, with Claude or with another tool.

## See it on a real post

This LinkedIn post is in the test set:

```text
I almost quit last year.

Not because of the money. Not because of the hours. But because I'd lost sight of why I started.

Here's what I learned:

1. Your network is your net worth.
2. Consistency beats intensity.
3. Done is better than perfect.

The truth? Success isn't a destination — it's a journey. And every setback is a setup for a comeback.

Today, our agency serves 40 clients across 6 countries. It stands as a testament to what's possible when you refuse to give up.

So here's my question for you: What's one lesson that changed your career?

Let's discuss in the comments. 👇

#Leadership #Growth #Entrepreneurship
```

The scanner's verdict (shortened):

```text
Slop check: 100/100 (saturated) · 107 words · channel: linkedin

L3  [high]   not-x-not-y: "Not because of the money. Not because of the hours."
             "Not X. Not Y. But Z." is a fake-depth build-up. → Start at Z.
L5  [medium] colon-reveal: "Here's what"
L7  [medium] platitude: "Your network is your net worth"
L9  [medium] question-reveal: ". The truth?"
L11 [medium] em-dash: "—"
L13 [medium] inflated-importance: "stands as a testament"
L17 [medium] engagement-bait: "Let's discuss"
L18 [medium] hashtag-block: "#Leadership #Growth #Entrepreneurship"
… 15 findings in total
```

Then **fix mode** asked the writer three questions (why they started, what made them stay, whether the numbers are right) and wrote this from the answers:

```text
Last year I almost quit the agency I started in 2019.

I started it because I was tired of agencies that never showed clients the numbers. Then 2 of our 3 biggest clients left within one month, and I lost sight of why I was doing any of it.

Jan, a former client, called and asked me to rebuild his reporting. That project became our main service.

Today we have 40 clients in 6 countries, and every one of them gets a live dashboard. Showing clients the numbers was the whole reason I started.
```

**Score: 100 → 0.** Every fact in the new version came from the writer. The skill never invents numbers, names, results or quotes. When it needs one you didn't give, it leaves a `[bracketed placeholder]`.

## Install in one minute

### In the Claude app (claude.ai, desktop)

1. Download **[ai-slop-killer.zip](https://github.com/customerimpact/ai-slop-killer/releases/latest/download/ai-slop-killer.zip)**.
2. In Claude, open **Settings → Capabilities**, make sure code execution is on, and upload the zip under **Skills**.
3. Start a chat, paste a draft and say "check this".

Skills need a paid Claude plan. In the app, reports and rewrites come back in the chat, and your voice profile is given to you as a file to attach next time.

### In Claude Code

You need [Claude Code](https://claude.com/claude-code) and Node 22 or later. Unzip the same file into `~/.claude/skills/`, or clone the repo:

**For all your projects:**

```bash
git clone https://github.com/customerimpact/ai-slop-killer.git
cp -r ai-slop-killer/.claude/skills/ai-slop-killer ~/.claude/skills/
```

**For one project:** copy the same folder into that project's `.claude/skills/` folder.

Then open Claude Code, paste some text and say "check this". To try it without installing, open Claude Code inside the cloned folder.

## What you can ask for

| Say | You get |
|---|---|
| "check this" (or just paste text) | A score from 0 to 100, every pattern quoted with its line, and a fix for each |
| "fix it" | Up to three questions for facts only you know, then a rewrite in your voice, with the before and after score |
| "learn my voice" + 3–5 things you wrote | A voice profile, so your real habits stay and only the patterns get flagged |
| "go deeper" | Structure and specificity edits beyond the pattern list |
| "audit this page", "5 wins" | A conversion audit for sales pages, landing pages, ads and marketing emails, with a Copy Score |

It adjusts to the channel. LinkedIn, X, blog posts, newsletters, marketing emails, cold emails, cover letters, academic writing and sales copy each have their own norms, so a hashtag block costs more on LinkedIn than in a blog post.

## What it catches

The scanner has 46 rules. A sample:

| Pattern | Example |
|---|---|
| Negation pivots | "It's not a tool, it's a movement." |
| Stock openers | "In today's fast-paced digital landscape…" |
| Formulas | "Stop guessing. Start growing." · "You don't need more tools. You need a system." |
| Drumroll reveals | "The result? …" · "Here's the thing:" |
| Inflated importance | "plays a pivotal role", "stands as a testament" |
| Vague attribution | "Studies show…" with no study named |
| AI vocabulary | delve, tapestry, seamless, robust, leverage, elevate |
| Chatbot leftovers | "I hope this helps!", "Here's a revised version" |
| Punctuation tells | em dashes, invisible zero-width characters |
| Social media tells | emoji bullets, 🚀✨, hashtag blocks, "Thoughts? 👇" |
| Rhythm | four sentences of the same length, "Short. Punchy. Fragments.", one-line-paragraph broetry |
| Structure | padded lists of three, Title Case Headings, bold everywhere, no contractions anywhere |

After the scan, Claude does a judgment pass for what a regex can't see:
- claims that would fit any article on any topic
- forced lists of three
- synonym cycling
- fake specifics
- a summary after every section
- explanation where an opinion should be

It also drops false alarms. "She serves as treasurer" is literal, and "research shows (Smith, 2021)" names its source.

## Why it's built this way

- **Same input, same score.** The scanner is plain JavaScript with fixed rules, so a re-run after a fix compares fairly. Claude's judgment findings are listed but never added to the number.
- **Your voice wins.** If you really do use em dashes, your voice profile keeps them. Writing samples that are themselves full of slop can't whitelist anything.
- **It scores the writing, not the author.** It never says whether a person or a model wrote something.
- **No detector promises.** It improves writing. It doesn't promise to get past AI detectors, and it won't help pass off coursework against a school's rules.
- **Tested.** 24 slop samples and 12 human-written controls run on every change. Every slop sample has to outscore every human one, and the human controls have to stay under 20.

## Use the scanner on its own

No Claude needed, and nothing to install:

```bash
npm run lint -- draft.md --channel linkedin
node .claude/skills/ai-slop-killer/scripts/ai-slop-killer.mjs lint draft.md --json        # for CI or scripts
node .claude/skills/ai-slop-killer/scripts/ai-slop-killer.mjs compare before.md after.md  # did the edit help?
node .claude/skills/ai-slop-killer/scripts/ai-slop-killer.mjs voice yourname samples/*.md # build a voice profile
```

## FAQ

**Is this an AI detector?**
No. It finds writing patterns readers react to, whoever or whatever produced them. Plenty of people write "game-changer" without any help.

**Will it make my text pass AI detectors?**
It doesn't promise that, and it doesn't run or imitate detectors. It makes the writing better and more clearly yours.

**Does it work on ChatGPT output?**
Yes. It works on any English text, including drafts from ChatGPT, Claude, Gemini, Jasper or Copy.ai.

**Which languages?**
English only. The rules are written for English, so text in other languages gets no score.

**Is it free?**
Yes. The skill and the scanner are free to use. You need a Claude plan that includes skills (or Claude Code with an API key); the scanner on its own needs only Node.

**Does my text leave my machine?**
The scanner runs locally. The judgment pass and rewrites run in your own Claude session, under your own account.

## Folder layout

```
.claude/skills/ai-slop-killer/
  SKILL.md                 the skill: modes, scanner-first flow, rules of conduct
  scripts/                 the scanner: rules.mjs, engine.mjs, voice.mjs, ai-slop-killer.mjs
  resources/               report, fix, voice, tells, channels/
  resources/conversion/    conversion audit: scoring, modes, copy types, 34 section guides, 8 craft guides
context/                   your input: writing samples, notes, voice profiles
audits/                    saved reports and rewrites
tests/                     regression set, end-to-end outputs, A/B tests
```

## Contributing

Spotted a pattern it misses? Open an issue with a real example, or send a pull request:

1. Add the rule to `.claude/skills/ai-slop-killer/scripts/rules.mjs`.
2. Add a sample to `tests/corpus.json` that triggers it.
3. Run `npm test`. The human-written controls must stay at 19 or below.

If AI Slop Killer saved you an edit, a ⭐ helps other people find it.

---

AI Slop Killer by [Customer Impact](https://customerimpact.be). Created by Tony.
