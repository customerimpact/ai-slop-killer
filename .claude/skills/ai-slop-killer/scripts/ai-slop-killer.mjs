#!/usr/bin/env node
// AI Slop Killer CLI. No dependencies.
//   lint [file|-] [--channel c] [--voice name|path.json] [--json]
//   compare <before> <after> [--channel c] [--voice ...] [--json]
//   voice <name> <sample files...>      (writes context/voice/<name>.json and .md)
//   strip <file>                        (prints the text with invisible characters removed)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { lint, stripInvisible } from './engine.mjs';
import { buildVoice, voiceToMarkdown } from './voice.mjs';

const args = process.argv.slice(2);
const cmd = args.shift();
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, v && !v.startsWith('--') ? 2 : 1);
  return v && !v.startsWith('--') ? v : true;
};

const read = (f) => (f === '-' || f === undefined ? readFileSync(0, 'utf8') : readFileSync(f, 'utf8'));

function loadVoice(v) {
  if (!v) return null;
  const path = existsSync(v) ? v : join('context', 'voice', `${v}.json`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function report(r, title = 'Slop check') {
  const lines = [`${title}: ${r.score}/100 (${r.band}) · ${r.words} words · channel: ${r.channel}`, r.bandNote, ''];
  if (!r.findings.length) lines.push('No patterns found.');
  for (const f of r.findings) {
    lines.push(`L${f.line} [${f.severity}] ${f.rule}: "${f.match}"`);
    lines.push(`    ${f.message} → ${f.fix}`);
  }
  if (r.permitted.length) lines.push('', `Kept as your voice: ${r.permitted.join(', ')}`);
  return lines.join('\n');
}

try {
  if (cmd === 'lint') {
    const channel = flag('channel');
    const voice = loadVoice(flag('voice'));
    const json = flag('json');
    const r = lint(read(args[0]), { channel, voice });
    console.log(json ? JSON.stringify(r, null, 2) : report(r));
  } else if (cmd === 'compare') {
    const channel = flag('channel');
    const voice = loadVoice(flag('voice'));
    const json = flag('json');
    const before = lint(read(args[0]), { channel, voice });
    const after = lint(read(args[1]), { channel, voice });
    const summary = {
      before: { score: before.score, band: before.band, findings: before.findings.length, high: before.high },
      after: { score: after.score, band: after.band, findings: after.findings.length, high: after.high },
      remaining: after.findings,
    };
    if (json) console.log(JSON.stringify(summary, null, 2));
    else {
      console.log(`Before: ${before.score}/100 (${before.band}), ${before.findings.length} patterns`);
      console.log(`After:  ${after.score}/100 (${after.band}), ${after.findings.length} patterns\n`);
      console.log(report(after, 'Still in the new version'));
    }
  } else if (cmd === 'voice') {
    const name = args.shift();
    if (!name || !args.length) throw new Error('usage: voice <name> <sample files...>');
    const v = buildVoice(name, args.map((f) => readFileSync(f, 'utf8')));
    const dir = join('context', 'voice');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${name}.json`), JSON.stringify(v, null, 2));
    writeFileSync(join(dir, `${name}.md`), voiceToMarkdown(v));
    console.log(voiceToMarkdown(v));
    console.log(`Saved to ${join(dir, name)}.json and .md`);
  } else if (cmd === 'strip') {
    process.stdout.write(stripInvisible(read(args[0])));
  } else {
    console.log('usage: ai-slop-killer.mjs lint|compare|voice|strip …');
    process.exit(cmd ? 1 : 0);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
