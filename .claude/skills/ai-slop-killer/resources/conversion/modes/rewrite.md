# Rewrite

Rewrites the selling copy to fix what an audit found, without inventing anything.

## Before writing

1. **Have an audit.** If none was run in this conversation, run 5 wins silently first and use its findings.
2. **Ask up to three questions**, only for facts the rewrite needs and the text doesn't have: a real result, a customer name with permission, the price, what's included, the guarantee terms. Ask the most valuable first. If the user says "just write it", use `[bracketed placeholders]`.
3. **Use their voice.** If a voice profile exists in `context/voice/`, follow it. Read `context/brand-notes/<brand>.md` if it exists. Otherwise keep the writer's own good lines and the way they talk.
4. **Agree the scope.** By default, rewrite the whole piece to the suggested Section Map. If the user asked for one section ("just the headline"), rewrite only that and give three options.

## While writing

- Keep every line the audit marked **Keep**. Change the wording of a claim, never its facts.
- Build to the map: every section the copy type needs, in an order where each part answers the question the last part raised.
- Proof goes right after the claim it supports.
- One offer, one ask, repeated at natural decision points.
- No fake urgency, no invented testimonials, numbers, names or results.

## After writing

1. Save the rewrite to `audits/<piece>-rewrite.md`.
2. Run the scanner on it (`--channel sales` or `email`). It must score lower than the original and have no high-severity findings. If it doesn't, fix those lines once and re-run.
3. Re-score the Copy Score on the rewrite, counting placeholders as missing.

## Report format

```
Here's the rewrite, saved to audits/[file]. [One line on the biggest change.]

[The rewrite, in full.]

| | Before | After |
|---|---|---|
| Copy Score | NN | NN (placeholders count as missing) |
| Slop score | NN | NN |

**Fill these in:** the placeholders, as a list of questions.
```
