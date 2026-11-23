import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lint } from '../.claude/skills/ai-slop-killer/scripts/engine.mjs';
import { buildVoice } from '../.claude/skills/ai-slop-killer/scripts/voice.mjs';

const here = new URL('.', import.meta.url);
const corpus = JSON.parse(readFileSync(new URL('corpus.json', here), 'utf8'));
const textOf = (c) => c.text ?? readFileSync(new URL(c.file, here), 'utf8');

for (const c of corpus) {
  test(`${c.kind}: ${c.id}`, () => {
    const r = lint(textOf(c), { channel: c.channel });
    const fired = new Set(r.findings.map((f) => f.rule));
    for (const id of c.expect ?? []) {
      assert.ok(fired.has(id), `expected rule "${id}" to fire; fired: ${[...fired].join(', ')}`);
    }
    if (c.minScore !== undefined) assert.ok(r.score >= c.minScore, `score ${r.score} < minScore ${c.minScore}`);
    if (c.maxScore !== undefined) {
      assert.ok(r.score <= c.maxScore, `score ${r.score} > maxScore ${c.maxScore}; findings: ${r.findings.map((f) => `${f.rule}:"${f.match}"`).join(' | ')}`);
    }
  });
}

test('every slop sample outscores every human sample', () => {
  const slop = corpus.filter((c) => c.kind === 'slop').map((c) => lint(textOf(c), { channel: c.channel }).score);
  const human = corpus.filter((c) => c.kind === 'human').map((c) => lint(textOf(c), { channel: c.channel }).score);
  assert.ok(Math.min(...slop) > Math.max(...human), `lowest slop ${Math.min(...slop)} vs highest human ${Math.max(...human)}`);
});

test('a writer who uses em dashes keeps them', () => {
  const samples = [
    'I rewrote the intro twice — once for clarity, once because I hated it.',
    'The shop closes at six — earlier on Sundays — so we went in the morning.',
    'She paid in coins — all of it — and the cashier laughed.',
  ];
  const voice = buildVoice('dash-writer', samples);
  const draft = 'The launch slipped a week — the printer broke — but the boxes shipped on Friday.';
  assert.ok(lint(draft).findings.some((f) => f.rule === 'em-dash'));
  assert.ok(!lint(draft, { voice }).findings.some((f) => f.rule === 'em-dash'));
});

test('sloppy samples never whitelist habits', () => {
  const voice = buildVoice('ai-samples', [readFileSync(new URL('email.md', here), 'utf8'), readFileSync(new URL('linkedin.md', here), 'utf8')]);
  assert.equal(voice.permitted.length, 0);
  assert.ok(voice.warning);
});

test('chatbot leftovers are never permitted by voice', () => {
  const voice = { stats: {}, permitted: ['chatbot-artifact'] };
  assert.ok(lint('I hope this helps! The report is attached.', { voice }).findings.some((f) => f.rule === 'chatbot-artifact'));
});

test('channel weights: hashtag-free engagement question costs more on LinkedIn than in a blog', () => {
  const t = 'We cut our meeting load in half by dropping the Monday sync and writing a short update instead. What do you think?';
  assert.ok(lint(t, { channel: 'linkedin' }).score > lint(t, { channel: 'blog' }).score);
});

test('listicle-three fires on exactly three items, not on four', () => {
  const three = 'What we changed:\n- the pricing page\n- the onboarding email\n- the trial length\n\nSales went up.';
  const four = 'What we changed:\n- the pricing page\n- the onboarding email\n- the trial length\n- the demo script\n\nSales went up.';
  assert.ok(lint(three).findings.some((f) => f.rule === 'listicle-three'));
  assert.ok(!lint(four).findings.some((f) => f.rule === 'listicle-three'));
});

test('language detection picks Dutch or English, and --lang overrides it', () => {
  const nl = 'We bakken sinds 2019 elke zaterdag brood in de garage van mijn schoonvader. In het begin waren het twaalf broden voor de buren.';
  const en = 'We have baked bread every Saturday since 2019 in my father-in-law\'s garage. At first it was twelve loaves for the neighbours.';
  assert.equal(lint(nl).lang, 'nl');
  assert.equal(lint(en).lang, 'en');
  assert.equal(lint(nl, { lang: 'en' }).lang, 'en');
});

test('Dutch text never gets English phrase rules, English text never gets Dutch ones', () => {
  for (const c of corpus) {
    const r = lint(textOf(c), { channel: c.channel });
    const nlRules = r.findings.filter((f) => f.rule.startsWith('nl-')).length;
    if (c.lang === 'nl') assert.equal(r.lang, 'nl', c.id);
    else assert.equal(nlRules, 0, c.id);
  }
});

test('every Dutch rule fires on at least one Dutch slop sample', async () => {
  const { RULES_NL } = await import('../.claude/skills/ai-slop-killer/scripts/rules.nl.mjs');
  const fired = new Set();
  for (const c of corpus.filter((x) => x.lang === 'nl' && x.kind === 'slop')) {
    for (const f of lint(textOf(c), { channel: c.channel }).findings) fired.add(f.rule);
  }
  assert.deepEqual(RULES_NL.map((r) => r.id).filter((id) => !fired.has(id)), []);
});
