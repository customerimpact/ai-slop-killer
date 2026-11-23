# Section Map

A map of the piece: which sections it has, in what order, how each one scores, and what's missing for this copy type. It answers "what's on this page and what should be?" before anyone edits a line.

## How to build it

1. Walk the piece top to bottom. Each time the job changes (from hooking to explaining, from explaining to proving), start a new section and give it an id from `resources/conversion/sections/`. A block can do two jobs; give it both ids.
2. Score each section 0–3 from its guide.
3. From `resources/conversion/copy-types.md`, list the sections this type needs that aren't there.
4. Check the order: does each section answer the question the previous one raised? Flag sections that arrive too early (price before desire, a guarantee before the offer) or too late (proof buried under the FAQ).

## Report format

```
I read this as a [copy type] for [reader], asking them to [action].

## [Piece name] · Copy Score: NN/100 ([band])

| # | Section | Starts with | Score | Note |
|---|---|---|---|---|
| 1 | Headline | "…" | 2/3 | one line |
| 2 | … | | | |

**Missing for a [copy type]:** section, section, section, each with one line on why the reader needs it here.

**Order:** two to four lines on what to move and why. Say "the order works" when it does.

**Suggested map:** the order I'd build it in, as a numbered list of section names, marking new sections with (new).

## Patterns readers notice
(See step 7 of the flow.)

Want the 5 wins, a deep audit or a rewrite to this map?
```

Put the Copy Score row table from `resources/conversion/modes/five-wins.md` under the heading, so the total can be traced. Keep the map itself as the main part of the report.
