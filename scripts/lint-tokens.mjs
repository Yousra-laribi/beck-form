#!/usr/bin/env node
/**
 * lint:tokens — fails if a colour literal appears anywhere outside the token file.
 *
 * Colour in this project is semantic and lives in exactly one module. A literal
 * elsewhere is not a style slip: it is a colour that cannot follow the dark theme,
 * because nothing re-evaluates it when the scheme changes.
 *
 * Two checks:
 *
 *   1. No colour literal in any .ts/.tsx/.js/.jsx under the scanned roots,
 *      except in src/theme/tokens.ts.
 *   2. Every hex in app.json exists as a real value in tokens.ts. Native config
 *      is read by the build system and cannot import TypeScript, so those two
 *      literals are a genuine exception — but an exception that is cross-checked
 *      cannot quietly drift into a loophole.
 *
 * Usage:  node scripts/lint-tokens.mjs [--root <dir>] [targetDir ...]
 * Exit 0 = clean, 1 = violations found (printed as file:line:col).
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep, resolve } from 'node:path';

/** The single file allowed to hold colour literals. */
const TOKEN_FILE = join('src', 'theme', 'tokens.ts');

/** Native config: read by the build system, cannot import TypeScript. */
const NATIVE_CONFIG = 'app.json';

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

const HEX = /#[0-9a-fA-F]{3,8}\b/g;

const RULES = [
  { name: 'hex colour', re: HEX },
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

/**
 * Strips comments so the cross-check reads declared values, not prose.
 *
 * tokens.ts documents the colours it replaced, old value alongside new. Without
 * this, a hex mentioned only in a "was #8A91A1" note would satisfy the
 * cross-check — which is exactly the drift the check exists to catch.
 */
export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/** Every hex literal in `source`, upper-cased and de-duplicated. */
export function findHexLiterals(source) {
  HEX.lastIndex = 0;
  return [...new Set((source.match(HEX) ?? []).map((h) => h.toUpperCase()))];
}

/**
 * Check 2: every hex in the native config must be a value tokens.ts actually
 * declares. Returns a list of violations; an absent file is not a violation.
 */
export function checkNativeConfig(root) {
  const configPath = join(root, NATIVE_CONFIG);
  const tokenPath = join(root, TOKEN_FILE);
  if (!existsSync(configPath) || !existsSync(tokenPath)) return [];

  const configSource = readFileSync(configPath, 'utf8');
  const declared = new Set(findHexLiterals(stripComments(readFileSync(tokenPath, 'utf8'))));

  const violations = [];
  HEX.lastIndex = 0;
  let m;
  while ((m = HEX.exec(configSource)) !== null) {
    if (declared.has(m[0].toUpperCase())) continue;
    violations.push({
      file: relative(process.cwd(), resolve(configPath)),
      rule: `not declared in ${TOKEN_FILE}`,
      text: m[0],
      ...positionOf(configSource, m.index),
    });
  }
  return violations;
}

function main() {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf('--root');
  const root = rootFlag > -1 ? argv[rootFlag + 1] : process.cwd();
  const consumed = rootFlag > -1 ? new Set([rootFlag, rootFlag + 1]) : new Set();
  const targets = argv.filter((_a, i) => !consumed.has(i));
  const roots = targets.length > 0 ? targets : [join(root, 'src'), join(root, 'app')];

  const violations = [];
  let scanned = 0;

  for (const dir of roots) {
    if (!existsSync(dir)) continue;
    for (const file of walk(dir)) {
      const rel = relative(resolve(root), resolve(file));
      // The token file is the one place colour is allowed to be spelled out.
      if (rel.split(sep).join(sep) === TOKEN_FILE) continue;
      scanned += 1;
      const reported = relative(process.cwd(), resolve(file));
      for (const hit of findColourLiterals(readFileSync(file, 'utf8'))) {
        violations.push({ file: reported, ...hit });
      }
    }
  }

  const nativeViolations = checkNativeConfig(root);
  violations.push(...nativeViolations);

  if (violations.length > 0) {
    console.error(`lint:tokens — ${violations.length} colour literal(s) outside ${TOKEN_FILE}:\n`);
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}:${v.col}  ${v.text}   (${v.rule})`);
    }
    if (nativeViolations.length > 0) {
      console.error(
        `\n${NATIVE_CONFIG} may hold a hex only if the same value exists in ${TOKEN_FILE}.\n` +
          `Native config cannot import TypeScript, so the literal has to be repeated —\n` +
          `but it must be a repetition, not a second source of truth.`
      );
    }
    console.error(
      `\nColour is semantic here. Add a named token to ${TOKEN_FILE} for both themes,\n` +
        `then reference it through useTheme(). See CLAUDE.md, "Design system".`
    );
    process.exit(1);
  }

  const nativeNote = existsSync(join(root, NATIVE_CONFIG)) ? `, ${NATIVE_CONFIG} cross-checked` : '';
  console.log(`lint:tokens — clean (${scanned} file(s) scanned${nativeNote})`);
}

// Only run the CLI when invoked directly, so the test can import the matchers.
if (process.argv[1] && resolve(process.argv[1]).endsWith(join('scripts', 'lint-tokens.mjs'))) {
  main();
}
