# Conversion audit

*Part of AI Slop Killer by Customer Impact. Created by Tony.*

Loaded by `SKILL.md` when the user wants selling copy judged on whether it sells: a sales page, landing page, product page, funnel step, checkout, ad, marketing email, or a webinar or VSL script.

The slop check asks "does this read like a person wrote it?" This module asks "will this make the right reader buy?" Both run, and their scores stay apart.

## The modes

| Mode | The user says | Read |
|---|---|---|
| **5 wins** (default) | "audit this", "will this sell?", "5 wins" | `resources/conversion/modes/five-wins.md` |
| **Section Map** | "Section Map", "what's missing?", "map this page" | `resources/conversion/modes/section-map.md` |
| **Deep audit** | "deep audit", "line by line", "tear it apart" | `resources/conversion/modes/deep-audit.md` |
| **Proof check** | "is my proof strong enough?", "check the testimonials" | `resources/conversion/modes/proof-check.md` |
| **Rewrite** | "rewrite it", "fix the page", after any audit | `resources/conversion/modes/rewrite.md` |

When the user doesn't name a mode, run 5 wins and offer the others in one line at the end.

## The flow (every mode)

1. **Get the whole text.** For a link, fetch the page. Work from what was actually read. If part of it couldn't be read (images with text, video, a page behind a login), say so in one "Couldn't read" line and judge the rest. Never ask questions before scoring.
2. **Name the copy type and the reader.** Use `resources/conversion/copy-types.md`. Say in the first line what I take the piece to be, who it's for, and the one action it wants. The user corrects me if I'm wrong, and I re-run.
3. **Run the scanner** on the exact text with `--channel email` for a marketing email and `--channel sales` for everything else, as `SKILL.md` describes, and read that one channel pack. Keep the result for the end of the report. If an earlier mode in this conversation already scanned the same text, reuse that result.
4. **Map the sections.** Split the piece into the sections it has, using the ids in `resources/conversion/sections/`. Note the sections this copy type needs that are missing. Read the guide for each section I score, and only those.
5. **Score** with the Copy Score below.
6. **Report** in the format of the mode.
7. **Patterns readers notice.** When the slop score is 20 or more, end with this short block: the slop score, its band (clean 0–19, noticeable 20–44, heavy 45–69, saturated 70–100) and the three to five findings that cost the most trust. One line each, quoted, with the fix. Below 20, one line saying the writing reads clean. If this block already appeared for the same text earlier in the conversation, give the score in one line and refer back to it.

## The Copy Score (0–100, higher is better)

Eight rows. Each row is scored from the sections and craft guides listed with it, using their 0–3 scales.

**Which items count in a row:**
- A section that is **on the page** counts, at its score.
- A section that `copy-types.md` lists as **needed** for this type and that is **missing** counts as 0.
- Any other missing section doesn't count at all.
- Craft items always count.

`copy-types.md` decides what a type needs. The section and craft guides decide how good a section is. Where they disagree on whether something is needed, `copy-types.md` wins.

| Row | Weight | Judged from |
|---|---|---|
| **Clear offer** | 15 | product-overview, opening, craft/clarity |
| **Hook** | 15 | headline, subheadline, opening, angle |
| **Reader fit** | 10 | who-its-for, problem, craft/reader-language |
| **Desire** | 10 | stakes, failed-fixes, the-after, features-and-outcomes, mechanism, craft/emotion |
| **Proof** | 20 | testimonials, case-studies, data-and-research, proof-signals, endorsements, credibility, sample-and-demo |
| **Offer and price** | 10 | offer-stack, whats-inside, pricing, tiers, bonuses, guarantee, comparison |
| **Doubts handled** | 10 | objections, faq, guarantee |
| **The ask** | 10 | call-to-action, close, urgency, ps, craft/flow |

Row score = weight × (average of its counted items ÷ 3). Keep the decimals, add the rows, and round only the final Copy Score. Show each row rounded to a whole number in the table.

**Bands:** 0–39 not ready to run · 40–59 workable, leaking buyers · 60–79 strong · 80–100 ready to scale.

**Short formats.** Some rows don't fit every format. Drop them, rescale the remaining weights to 100, and say in one line which rows were left out.
- **Ad:** drop Offer and price and Doubts handled, unless the ad states a price or offer. Drop Proof unless the ad contains a proof point.
- **Marketing email:** drop Offer and price and Doubts handled, unless the email states a price, an offer or an answer to a doubt. Always score Proof: an email should carry at least one real proof point before the ask.
- Everything else is scored on all eight rows.

The table always shows each row at its original weight (n/15, n/20…), with dropped rows marked "not scored". Only the total is rescaled.

**Things the text can't contain.** When the user pastes text without its surroundings (an email's subject line or preview text, an ad's image), list what's absent in the "Couldn't read" line and don't score it. When the user says the absence is real ("there is no preview text"), score it as missing.

**Sign-off.** In an email or letter, judge the sign-off (a real person or a team) as part of `close`.

## Standing rules

- **This file and the mode files win** over any section or craft guide if they disagree.
- **Facts are never invented.** A suggested line can change wording, order and emphasis. It never adds a number, name, result, testimonial, credential, price, deadline or feature the text doesn't contain. Where a fix needs a fact, write a `[bracketed placeholder]` that says what belongs there, and list those facts at the end as questions for the writer.
- **Honest urgency only.** Never suggest a fake deadline, fake scarcity or a countdown that resets.
- **Judge the copy, not the product.** Don't say whether the product is good. Do say when the copy gives no reason to believe a claim.
- **Score what's on the page.** Proof the seller "probably has" scores 0 until it's on the page. Say what to add.
- **The two scores stay apart.** The Copy Score never moves because of the slop score, and the other way round.
- **One link rule:** offer to read a linked page (checkout, case study, video page) only when the text contains that link.
- **Brand notes:** when the user says to remember something about their brand, offer or audience, save it to `context/brand-notes/<brand>.md` and read that file on later audits of the same brand.

## How the report talks

The same voice as the rest of AI Slop Killer: first person, plain words, short paragraphs, calm and direct. Quote the user's line, then say what it costs them and what to do instead. Lead with what's working in one or two lines, then spend the report on what would sell more. No hype, no grading my own suggestions, and my own sentences avoid the patterns the scanner flags.
