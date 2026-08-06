/**
 * The token linter is a load-bearing rule, so it gets tested like one.
 *
 * These run the real CLI as a subprocess against generated fixtures — the same
 * entry point `npm run check` and the pre-commit hook call. A test that
 * re-implemented the matcher could pass while the script CI runs was broken.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = join(process.cwd(), 'scripts', 'lint-tokens.mjs');

type Run = { code: number; out: string };

function runLinter(targetDir: string): Run {
  try {
    const out = execFileSync(process.execPath, [SCRIPT, targetDir], {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return { code: 0, out };
  } catch (err) {
    const e = err as { status: number; stdout: string; stderr: string };
    return { code: e.status, out: `${e.stdout}${e.stderr}` };
  }
}

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'lint-tokens-'));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function write(relative: string, content: string) {
  const full = join(dir, relative);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, content, 'utf8');
}

describe('lint:tokens', () => {
  it('passes on a file that takes its colours from the theme', () => {
    write('Card.tsx', `const s = { backgroundColor: theme.carte, borderColor: theme.ligne };`);
    const { code, out } = runLinter(dir);
    expect(out).toContain('clean');
    expect(code).toBe(0);
  });

  it('passes on a directory that does not exist yet', () => {
    const { code } = runLinter(join(dir, 'nope'));
    expect(code).toBe(0);
  });

  it.each([
    ['hex', `const c = '#8B5E70';`, '#8B5E70'],
    ['short hex', `const c = '#fff';`, '#fff'],
    ['rgba', `const c = 'rgba(30,36,56,.09)';`, 'rgba('],
    ['hsl', `const c = 'hsl(210, 20%, 50%)';`, 'hsl('],
    ['named colour', `const c = 'white';`, 'white'],
  ])('catches a %s literal', (_label, source, expected) => {
    write('Bad.tsx', source);
    const { code, out } = runLinter(dir);
    expect(code).toBe(1);
    expect(out).toContain(expected);
    expect(out).toContain('Bad.tsx');
  });

  it('reports the line and column so the failure is actionable', () => {
    write('Bad.tsx', `const a = 1;\nconst b = 2;\nconst c = '#8B5E70';`);
    const { out } = runLinter(dir);
    expect(out).toMatch(/Bad\.tsx:3:\d+/);
  });

  it('allows values that name no colour', () => {
    write('Ok.tsx', `const s = { backgroundColor: 'transparent', stroke: 'currentColor' };`);
    expect(runLinter(dir).code).toBe(0);
  });

  it('reports every violation, not just the first', () => {
    write('Bad.tsx', `const a = '#111111';\nconst b = '#222222';\nconst c = '#333333';`);
    const { out } = runLinter(dir);
    expect(out).toContain('#111111');
    expect(out).toContain('#222222');
    expect(out).toContain('#333333');
    expect(out).toContain('3 colour literal(s)');
  });

  it('does not scan non-source files', () => {
    write('notes.md', `background: #8B5E70`);
    expect(runLinter(dir).code).toBe(0);
  });
});
