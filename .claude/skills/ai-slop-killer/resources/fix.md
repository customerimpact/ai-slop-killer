# Fix mode: ask, then write

## 1. Check first

Run the scanner and the judgment pass, as in SKILL.md. Show nothing yet unless the user asked for the report too.

## 2. Ask up to three questions, in one message

Specific detail is what makes writing sound human, and only the writer has it. Look at the lines that are vague, generic or inflated, and ask for the facts that would replace them.

- **At most three questions, numbered, each answerable in a line.** Examples:
  - "What's one number from the last year: clients, hours saved, money, anything real?"
  - "When you nearly quit, where were you and what did you do?"
  - "Who is this for, in one sentence?"
- **Ask about their world, never about style.** I handle the style.
- End with: *"Or say 'skip' and I'll leave clearly marked gaps for you to fill."*
- **Skip the questions entirely** when the text already holds its facts (a tidy-up of a factual email, an invoice note), or when the user said "just fix it". Go straight to step 3.

## 3. Write in their voice

- **The voice comes first.** Match the writer's person (I or we), formality, sentence length, paragraph shape, spelling and punctuation habits.
  - With a voice profile, follow it, including its personal never-say list.
  - Without one, read the voice from the text itself. If the text is mostly pattern, keep its register and drop the patterns.
- **A habit the voice profile permits stays** (their em dashes, their exclamation marks).
- **Fix structure, not just words.** Swapping "leverage" for "use" while keeping a "not X, it's Y" skeleton fixes nothing. Rebuild the sentence around the real point.
- **Cut, don't replace.** Most slop is padding. A shorter, specific version beats a reworded one.
- **Facts:** use their answers. Never invent a fact. A missing fact becomes `[what goes here]`.
- **Channel norms** come from `resources/channels/<channel>.md`.
- **Headings the user asked to keep stay word for word,** because they often carry SEO and links. When one is itself a pattern, leave it and suggest a new wording under the rewrite.
- **Don't overcorrect into new tells:**
  - no swapping em dashes for hyphens
  - no fake typos
  - no forced slang
  - no random one-word sentences
  - no "honestly", "look," or "here's the thing"

## 4. Prove it

Save the rewrite to `audits/<piece>-fix-YYYY-MM-DD.md` (or only to the path the user names), then run:

```
node <skill-dir>/scripts/ai-slop-killer.mjs compare <original> <rewrite> --channel <channel> [--voice <name>] --json
```

- **The rewrite must score lower and have zero high findings.** If it doesn't, fix what remains and compare again. Do this once at most. Anything still left gets one honest line under the rewrite.
- Re-read the rewrite against the judgment tells as well.

## 5. Show

1. **The rewrite.**
2. **One line with the scores:** *"Before 78 (saturated) → after 9 (clean)."*
3. **What's new:** any idea, angle or detail I added that wasn't in the original or their answers, so they can drop it. Leave this out when there's nothing new.
4. **Gaps to fill**, as a short list, only if placeholders remain.
5. **One line on where it's saved,** then: *"Want another version: shorter, closer to your original, or bolder?"*

## 6. Feedback becomes voice

When the user says "never use X", "shorter sentences" or "we say members", apply it at once. Add it silently to their voice profile's **Personal never-say** in `context/voice/<name>.md`. If no profile exists yet, create a minimal one with the name they write under.
