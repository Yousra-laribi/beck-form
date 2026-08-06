#!/usr/bin/env node
/**
 * lint:tokens — fails if a colour literal appears anywhere outside the token file.
 *
 * Colour in this project is semantic and lives in exactly one module. A literal
 * elsewhere is not a style slip: it is a colour that cannot follow the dark theme,
 * because nothing re-evaluates it when the scheme changes.
 *
 * Usage:  node scripts/lint-tokens.mjs [targetDir ...]
 * Exit 0 = clean, 1 = violations found (printed as file:line:col).
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep, resolve } from 'node:path';

/** The single file allowed to hold colour literals. */
const TOKEN_FILE = join('src', 'theme', 'tokens.ts');

const DEFAULT_TARGETS = ['src', 'app'];
const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Values that name no colour and therefore carry no theme obligation. */
const ALLOWED_KEYWORDS = new Set(['transparent', 'currentColor', 'none', 'inherit']);

const NAMED_COLOURS = [
  'aqua', 'azure', 'beige', 'black', 'blue', 'brown', 'coral', 'crimson', 'cyan',
  'gold', 'gray', 'green', 'grey', 'indigo', 'ivory', 'khaki', 'lime', 'magenta',
  'maroon', 'navy', 'olive', 'orange', 'orchid', 'pink', 'plum', 'purple', 'red',
  'salmon', 'silver', 'snow', 'tan', 'teal', 'tomato', 'violet', 'wheat', 'white',
  'yellow',
];

const RULES = [
  { name: 'hex colour', re: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'rgb()/rgba()', re: /\brgba?\s*\(/g },
  { name: 'hsl()/hsla()', re: /\bhsla?\s*\(/g },
  {
    name: 'named colour',
    re: new RegExp(`(['"\`])(${NAMED_COLOURS.join('|')})\\1`, 'gi'),
  },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      walk(full, out);
    } else {
      const dot = entry.lastIndexOf('.');
      if (dot > -1 && SCANNED_EXTENSIONS.has(entry.slice(dot))) out.push(full);
    }
  }
  return out;
}

function positionOf(source, index) {
  const upTo = source.slice(0, index);
  const line = upTo.split('\n').length;
  const col = index - (upTo.lastIndexOf('\n') + 1) + 1;
  return { line, col };
}

/** Returns every colour literal in `source`. Exported for the harness test. */
export function findColourLiterals(source) {
  const hits = [];
  for (const { name, re } of RULES) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(source)) !== null) {
      const text = m[0];
      if (ALLOWED_KEYWORDS.has(text.replace(/['"`]/g, ''))) continue;
      hits.push({ rule: name, text, ...positionOf(source, m.index) });
    }
  }
  return hits.sort((a, b) => a.line - b.line || a.col - b.col);
}

function main() {
  const targets = process.argv.slice(2);
  const roots = targets.length > 0 ? targets : DEFAULT_TARGETS;
  const violations = [];
  let scanned = 0;

  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const file of walk(root)) {
      const rel = relative(process.cwd(), resolve(file));
      // The token file is the one place colour is allowed to be spelled out.
      if (rel.split(sep).join(sep) === TOKEN_FILE) continue;
      scanned += 1;
      for (const hit of findColourLiterals(readFileSync(file, 'utf8'))) {
        violations.push({ file: rel, ...hit });
      }
    }
  }

  if (violations.length > 0) {
    console.error(`lint:tokens — ${violations.length} colour literal(s) outside ${TOKEN_FILE}:\n`);
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}:${v.col}  ${v.text}   (${v.rule})`);
    }
    console.error(
      `\nColour is semantic here. Add a named token to ${TOKEN_FILE} for both themes,\n` +
        `then reference it through useTheme(). See CLAUDE.md, "Design system".`
    );
    process.exit(1);
  }

  console.log(`lint:tokens — clean (${scanned} file(s) scanned, ${roots.join(', ')})`);
}

// Only run the CLI when invoked directly, so the test can import the matcher.
if (process.argv[1] && resolve(process.argv[1]).endsWith(join('scripts', 'lint-tokens.mjs'))) {
  main();
}
