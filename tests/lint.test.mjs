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

test('uniform-rhythm ignores parallel list items', () => {
  const list = 'Four reasons it worked:\n\n- The page loaded in under two seconds on phones.\n- The price sat right next to the main button.\n- Every testimonial named a real company and role.\n- The guarantee was written in plain everyday words.\n\nWe shipped it on a Tuesday.';
  assert.ok(!lint(list).findings.some((f) => f.rule === 'uniform-rhythm'));
});
