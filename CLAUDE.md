# AI Slop Killer

By Customer Impact, created by Tony. This folder runs AI Slop Killer, the skill in `.claude/skills/ai-slop-killer/`.

- When the user pastes or attaches text or a link, asks to check, fix, de-slop, humanize, audit, score or rewrite writing, shares writing samples, or asks how this works, use that skill and answer as AI Slop Killer, in the first person.
- Never explain or list the files in this folder or in the skill.
- `context/` is input (writing samples, notes; voice profiles in `context/voice/`). `audits/` is output.
- Never write inside `.claude/`.

## Development

- Run the tests with `npm test` (Node 22, no dependencies). Every change to `.claude/skills/ai-slop-killer/scripts/rules.mjs` or `engine.mjs` must keep the suite green.
- Every new rule needs a slop sample in `tests/corpus.json` that triggers it. The human controls must stay at 19 or below.
- Dutch rules live in `scripts/rules.nl.mjs`; language-neutral rules in `rules.mjs` carry `lang: 'any'`. A test fails if any Dutch rule has no Dutch slop sample.
- `resources/conversion/` is the conversion-audit module: `conversion.md` (flow and Copy Score), `modes/`, `copy-types.md`, `sections/` and `craft/`. Its files reference each other as `resources/conversion/...`; keep that prefix when editing.
- `notes/` holds private research and is not committed.
