#!/usr/bin/env node
/**
 * Generates the red crescent-moon app icon, splash, favicon and Android icons
 * as PNGs with no dependencies. Run: node scripts/make-icons.mjs
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const out = fileURLToPath(new URL('../assets/images/', import.meta.url));

const RED = [0xb0, 0x00, 0x00];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Coverage (0–1) of a crescent moon at normalized coords, 4×4 supersampled. */
function moonCoverage(x, y, size, scale) {
  let hit = 0;
  for (let sy = 0; sy < 4; sy++)
    for (let sx = 0; sx < 4; sx++) {
      const u = (x + (sx + 0.5) / 4) / size - 0.5;
      const v = (y + (sy + 0.5) / 4) / size - 0.5;
      const inOuter = u * u + v * v < (0.32 * scale) ** 2;
      const du = u - 0.13 * scale;
      const dv = v + 0.09 * scale;
      const inCut = du * du + dv * dv < (0.27 * scale) ** 2;
      if (inOuter && !inCut) hit++;
    }
  return hit / 16;
}

function moon(size, { background, scale = 1 }) {
  return png(size, (x, y) => {
    const c = moonCoverage(x, y, size, scale);
    if (background) return [Math.round(RED[0] * c), 0, 0, 255]; // red over black
    return [...RED, Math.round(255 * c)]; // red over transparent
  });
}

const files = {
  'icon.png': moon(1024, { background: true }),
  'splash-icon.png': moon(512, { background: false, scale: 1.4 }),
  'favicon.png': moon(48, { background: true }),
  'android-icon-foreground.png': moon(512, { background: false, scale: 0.7 }),
  'android-icon-monochrome.png': moon(512, { background: false, scale: 0.7 }),
  'android-icon-background.png': png(512, () => [0, 0, 0, 255]),
};

for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(out, name), data);
  console.log('wrote', name);
}
