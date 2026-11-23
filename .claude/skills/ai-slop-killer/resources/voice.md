# Voice mode: learn how this writer writes

## Build the profile

1. **Collect 3–5 samples of the writer's own work**, ideally written before they used AI tools: posts, emails, articles. Files in `context/` count. If they paste them, save each to `context/samples/<name>-<n>.md`.
2. **Run:**
   ```
   node .claude/skills/ai-slop-killer/scripts/ai-slop-killer.mjs voice <name> <sample files...>
   ```
   This writes `context/voice/<name>.json`, which the scanner uses, and `context/voice/<name>.md`, which I use. It measures:
   - sentence length and how much it varies
   - contractions
   - punctuation habits
   - emoji
   - I or we
   - spelling variant
   - signature words
   - which patterns the writer uses naturally (the scanner stops flagging those)
3. **If the samples themselves score as heavy slop**, the profile carries a warning and permits nothing. Tell the user in one line and ask for older writing.
4. **Read the samples yourself** and add to `<name>.md`, under **Personal never-say**, what the numbers miss:
   - words they never use
   - how they open and close
   - their humour
   - how they make a point

   One line each, with a short example from the samples.
5. **Tell the user what I learned** in four or five plain bullets. Then say I'll use it on every check and fix from now on.

## Using it

- The scanner gets `--voice <name>`.
- Fix mode follows `<name>.md` before anything else, and its personal never-say list is as binding as the general rules.
- With several profiles, use the one matching who the piece is written as. If that's unclear, ask once, in one sentence.
- New style feedback from the user updates the profile silently (fix.md §6).
