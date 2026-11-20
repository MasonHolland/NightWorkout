#!/usr/bin/env node
/**
 * Red-light guard. Fails if anything in the app could draw a non-red color.
 *
 *  1. Every color in src/theme/palette.ts must have zero green and zero blue.
 *  2. No other file under src/ may contain a color literal (hex, rgb(), hsl(),
 *     or a named color in a style) — colors must come from the palette.
 *  3. Every hex color in app.json must be one of the palette colors.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const paletteFile = join(root, 'src', 'theme', 'palette.ts');
const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
const fnColorRe = /\b(rgba?|hsla?|hwb|lab|lch|oklch|oklab)\s*\(/g;
const namedColorRe = /\b(color|Color|backgroundColor|borderColor|tintColor|shadowColor)\s*:\s*['"](?!#)([a-zA-Z]+)['"]/g;

const errors = [];

function expand(hex) {
  let h = hex.slice(1).toLowerCase();
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  return h;
}

// 1. Palette must be pure red channel.
const paletteSrc = readFileSync(paletteFile, 'utf8');
const allowed = new Set();
for (const m of paletteSrc.matchAll(hexRe)) {
  const h = expand(m[0]);
  if (h.slice(2, 4) !== '00' || h.slice(4, 6) !== '00') {
    errors.push(`palette.ts: ${m[0]} has green/blue — only #RR0000 colors are allowed`);
  }
  allowed.add(h.slice(0, 6));
}

// 2. No color literals outside the palette.
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|css)$/.test(name) && p !== paletteFile) checkSource(p);
  }
}

function checkSource(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const where = `${relative(root, file)}:${i + 1}`;
    for (const m of line.matchAll(hexRe)) errors.push(`${where}: color literal ${m[0]} — use palette`);
    for (const m of line.matchAll(fnColorRe)) errors.push(`${where}: color function ${m[1]}() — use palette`);
    for (const m of line.matchAll(namedColorRe)) {
      if (m[2] !== 'transparent') errors.push(`${where}: named color '${m[2]}' — use palette`);
    }
  });
}

walk(join(root, 'src'));

// 3. app.json colors must be palette colors.
const appJson = readFileSync(join(root, 'app.json'), 'utf8');
for (const m of appJson.matchAll(hexRe)) {
  if (!allowed.has(expand(m[0]).slice(0, 6))) errors.push(`app.json: ${m[0]} is not a palette color`);
}

if (errors.length) {
  console.error(`✗ Red-light check failed (${errors.length}):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ Red-light check passed — palette: ${[...allowed].map((h) => '#' + h).join(', ')}`);
