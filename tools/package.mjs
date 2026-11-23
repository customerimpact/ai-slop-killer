#!/usr/bin/env node
// Builds dist/ai-slop-killer.zip: the skill folder, ready to upload to the Claude app
// (Settings → Capabilities → Skills) or to unzip into ~/.claude/skills/. No dependencies.
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { deflateRawSync } from 'node:zlib';

const SRC = join('.claude', 'skills', 'ai-slop-killer');
const OUT = join('dist', 'ai-slop-killer.zip');

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(SRC);

const local = [];
const central = [];
let offset = 0;
for (const p of files) {
  // Entries sit under ai-slop-killer/ so the zip unpacks to one skill folder.
  const name = Buffer.from('ai-slop-killer/' + relative(SRC, p).split(sep).join('/'));
  const data = readFileSync(p);
  const comp = deflateRawSync(data);
  const crc = crc32(data);
  const head = Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0x0800, 6);
  head.writeUInt16LE(8, 8); head.writeUInt32LE(0x00210000, 10); head.writeUInt32LE(crc, 14);
  head.writeUInt32LE(comp.length, 18); head.writeUInt32LE(data.length, 22);
  head.writeUInt16LE(name.length, 26);
  local.push(head, name, comp);
  const cd = Buffer.alloc(46);
  cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
  cd.writeUInt16LE(0x0800, 8); cd.writeUInt16LE(8, 10); cd.writeUInt32LE(0x00210000, 12);
  cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(comp.length, 20); cd.writeUInt32LE(data.length, 24);
  cd.writeUInt16LE(name.length, 28); cd.writeUInt32LE(offset, 42);
  central.push(cd, name);
  offset += 30 + name.length + comp.length;
}
const cdSize = central.reduce((a, b) => a + b.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(cdSize, 12); end.writeUInt32LE(offset, 16);

mkdirSync('dist', { recursive: true });
writeFileSync(OUT, Buffer.concat([...local, ...central, end]));
console.log(`${OUT}: ${files.length} files`);
