import { analyse, stats, lint } from './engine.mjs';

const STOP = new Set(`a about above after again against all am an and any are as at be because been before being
below between both but by can could did do does doing down during each few for from further had has have having he
her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of
off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them
themselves then there these they this those through to too under until up very was we were what when where which while
who whom why will with would you your yours yourself yourselves also get got one like really much many make made even
still well back way going thing things lot don't it's i'm you're we're that's can't won't didn't isn't there's let's`.split(/\s+/));

// A voice fingerprint built from samples of the writer's own work.
export function buildVoice(name, samples) {
  const text = samples.join('\n\n');
  const ctx = analyse(text);
  const st = stats(ctx);

  // Signature words: frequent content words that appear in at least two samples.
  const counts = new Map();
  const perSample = samples.map((s) => new Set((s.toLowerCase().match(/[\p{L}][\p{L}'’-]{2,}/gu) || [])));
  for (const w of text.toLowerCase().match(/[\p{L}][\p{L}'’-]{2,}/gu) || []) {
    if (!STOP.has(w)) counts.set(w, (counts.get(w) || 0) + 1);
  }
  const signature = [...counts.entries()]
    .filter(([w, n]) => n >= 2 && (samples.length < 2 || perSample.filter((s) => s.has(w)).length >= 2))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w]) => w);

  const lower = text.toLowerCase();
  const british = (lower.match(/\b\w+(?:our|ise|ised|ising|isation|yse|tre)\b/g) || []).filter((w) => !/^(?:four|your|hour|our|pour|tour|wise|rise|raise|promise|otherwise|exercise|surprise|advise|enterprise|precise|concise|noise|praise|arise|centre)$/.test(w)).length;
  const american = (lower.match(/\b\w+(?:ize|ized|izing|ization|yze)\b/g) || []).length;
  const iCount = (text.match(/\bI\b/g) || []).length;
  const weCount = (lower.match(/\bwe\b/g) || []).length;

  // Rules the writer trips naturally become permitted, unless the samples are themselves slop.
  const own = lint(text, {});
  const sloppySamples = own.score >= 45;
  const byRule = new Map();
  for (const f of own.findings) byRule.set(f.rule, (byRule.get(f.rule) || 0) + 1);
  const permitted = sloppySamples ? [] : [...byRule.entries()]
    .filter(([id, n]) => !['chatbot-artifact', 'invisible-character'].includes(id) && (n / Math.max(ctx.words, 1)) * 100 >= 0.5)
    .map(([id]) => id);

  return {
    name,
    built: new Date().toISOString().slice(0, 10),
    samples: samples.length,
    stats: st,
    person: iCount >= weCount ? 'I' : 'we',
    spelling: british > american ? 'British' : american > british ? 'American' : 'unclear',
    signature,
    permitted,
    warning: sloppySamples ? `The samples score ${own.score}/100 themselves, so no habits were permitted. Use writing from before you used AI tools.` : null,
  };
}

export function voiceToMarkdown(v) {
  const s = v.stats;
  return `# Voice: ${v.name}

Built ${v.built} from ${v.samples} samples (${s.words} words).${v.warning ? `\n\n> ${v.warning}` : ''}

- **Sentences:** about ${s.sentenceMean} words on average, spread ${s.sentenceSd} (higher means more varied).
- **Contractions:** ${s.contractionsPer100} per 100 words.
- **Punctuation:** em dashes ${s.emDashPer100}, exclamation marks ${s.exclaimPer100}, questions ${s.questionPer100} per 100 words.
- **Emoji:** ${s.emojiPer100} per 100 words.
- **Speaks as:** "${v.person}". Spelling: ${v.spelling}.
- **Signature words:** ${v.signature.join(', ') || 'none found yet (add more samples)'}.
- **Habits that stay (not flagged in this voice):** ${v.permitted.join(', ') || 'none'}.

## Personal never-say
<!-- AI Slop Killer adds one line per word or construction this writer cuts, with the plain replacement. -->
`;
}
