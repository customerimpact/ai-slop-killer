import { RULES, SEVERITY_WEIGHT, CHANNELS } from './rules.mjs';

// Rules a writer's own habit can never permit.
const NEVER_PERMITTED = new Set(['chatbot-artifact', 'invisible-character']);

export const BANDS = [
  { max: 19, label: 'clean', note: 'Reads like a person wrote it.' },
  { max: 44, label: 'noticeable', note: 'A careful reader will spot a few patterns.' },
  { max: 69, label: 'heavy', note: 'Most readers will feel the template.' },
  { max: 100, label: 'saturated', note: 'Patterns in nearly every line.' },
];

const countWords = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;

export function analyse(text) {
  const clean = text.replace(/\r\n?/g, '\n');
  const sentences = [];
  const paragraphs = [];
  let offset = 0;
  for (const block of clean.split(/\n[ \t]*\n/)) {
    const start = clean.indexOf(block, offset);
    offset = start + block.length;
    const lines = block.split('\n');
    let paraSentences = 0;
    let lineOffset = start;
    for (const line of lines) {
      const list = /^\s*(?:\d+[.)]|[-*•])\s/.test(line);
      const body = line.replace(/^\s*(?:#{1,6}|\d+[.)]|[-*•])\s+/, '');
      const re = /[^.!?]+(?:[.!?]+["'”’)]*|$)/g;
      for (const m of body.matchAll(re)) {
        const t = m[0].trim();
        const w = countWords(t);
        if (!w) continue;
        sentences.push({ text: t, words: w, list, index: lineOffset + line.indexOf(m[0]) });
        paraSentences++;
      }
      lineOffset += line.length + 1;
    }
    paragraphs.push({ text: block, words: countWords(block), sentences: paraSentences, index: start });
  }
  return { text: clean, words: countWords(clean), sentences, paragraphs };
}

export function stats(ctx) {
  const lens = ctx.sentences.filter((s) => !s.list).map((s) => s.words);
  const mean = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const sd = lens.length ? Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length) : 0;
  const per100 = (n) => (ctx.words ? (n / ctx.words) * 100 : 0);
  const t = ctx.text;
  return {
    words: ctx.words,
    sentences: lens.length,
    sentenceMean: +mean.toFixed(1),
    sentenceSd: +sd.toFixed(1),
    contractionsPer100: +per100((t.match(/\b\w+['’](?:t|s|re|ve|ll|d|m)\b/gi) || []).length).toFixed(2),
    emDashPer100: +per100((t.match(/—|\s–\s/g) || []).length).toFixed(2),
    exclaimPer100: +per100((t.match(/!/g) || []).length).toFixed(2),
    questionPer100: +per100((t.match(/\?/g) || []).length).toFixed(2),
    emojiPer100: +per100((t.match(/\p{Extended_Pictographic}/gu) || []).length).toFixed(2),
  };
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}

function voicePermits(rule, voice) {
  if (!voice || NEVER_PERMITTED.has(rule.id)) return false;
  if (voice.permitted?.includes(rule.id)) return true;
  const s = voice.stats || {};
  if (rule.voiceKey === 'emDash') return s.emDashPer100 >= 0.3;
  if (rule.voiceKey === 'emoji') return s.emojiPer100 >= 0.5;
  if (rule.voiceKey === 'noContractions') return s.contractionsPer100 < 0.5;
  return false;
}

export function lint(text, opts = {}) {
  const channel = CHANNELS.includes(opts.channel) ? opts.channel : 'general';
  const voice = opts.voice || null;
  const ctx = analyse(text);
  const findings = [];
  const permitted = [];

  for (const rule of RULES) {
    const mult = rule.channels?.[channel] ?? 1;
    if (mult === 0) continue;
    if (voicePermits(rule, voice)) { permitted.push(rule.id); continue; }
    const hits = rule.pattern
      ? [...ctx.text.matchAll(rule.pattern)].map((m) => ({ index: m.index, match: m[0] }))
      : rule.check(ctx.text, ctx);
    hits.forEach((h, i) => {
      findings.push({
        // Only real text spans take part in overlap dedupe; summary findings ("8 bolded phrases") don't.
        end: ctx.text.startsWith(h.match, h.index) ? h.index + h.match.length : undefined,
        rule: rule.id,
        category: rule.category,
        severity: rule.severity,
        weight: i < (rule.cap ?? 4) ? SEVERITY_WEIGHT[rule.severity] * mult : 0,
        line: lineOf(ctx.text, h.index),
        index: h.index,
        match: h.match.replace(/\s+/g, ' ').trim(),
        message: rule.message,
        fix: rule.fix,
      });
    });
  }

  // Voice drift: only when a voice profile is given.
  const st = stats(ctx);
  if (voice?.stats && st.sentences >= 5) {
    const v = voice.stats;
    if (v.sentenceMean && Math.abs(st.sentenceMean - v.sentenceMean) / v.sentenceMean > 0.5) {
      findings.push({
        rule: 'voice-rhythm-drift', category: 'voice', severity: 'low', weight: 1, line: 1, index: 0,
        match: `average sentence ${st.sentenceMean} words; you usually write ${v.sentenceMean}`,
        message: 'Sentence length is far from how you usually write.',
        fix: 'Bring the rhythm back toward your own.',
      });
    }
    if (v.contractionsPer100 >= 2 && st.contractionsPer100 < 0.5 && st.words >= 80) {
      findings.push({
        rule: 'voice-contraction-drift', category: 'voice', severity: 'low', weight: 1, line: 1, index: 0,
        match: `${st.contractionsPer100} contractions per 100 words; you usually use ${v.contractionsPer100}`,
        message: 'You normally use contractions; this draft barely does.',
        fix: 'Put your contractions back.',
      });
    }
  }

  // One problem, one finding: drop a match inside a wider one, or overlapping one of its own kind.
  findings.sort((a, b) => a.index - b.index || (b.end ?? 0) - (a.end ?? 0));
  const kept = [];
  for (const f of findings) {
    const dup = f.end !== undefined && kept.some((k) => k.end !== undefined && (
      (f.index >= k.index && f.end <= k.end) ||
      (k.category === f.category && f.index < k.end && f.end > k.index)));
    if (!dup) kept.push(f);
  }
  findings.length = 0;
  findings.push(...kept.map(({ end, ...f }) => f));
  const weight = findings.reduce((a, f) => a + f.weight, 0);
  const categories = new Set(findings.filter((f) => f.weight > 0).map((f) => f.category)).size;
  const per100 = (weight / Math.max(ctx.words, 50)) * 100;
  const score = Math.min(100, Math.round(per100 * 5 + Math.max(0, categories - 2) * 4));
  const band = BANDS.find((b) => score <= b.max);

  return {
    score,
    band: band.label,
    bandNote: band.note,
    channel,
    words: ctx.words,
    high: findings.filter((f) => f.severity === 'high').length,
    findings,
    permitted,
    stats: st,
  };
}

export function stripInvisible(text) {
  return text.replace(/[​-‍⁠﻿]/g, '');
}
