// @ts-check
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Smoke test for @carlos3g/tsconfig.
 *
 * For every variant: assert the file is well-formed and (except `base`) extends
 * `base.json`, then have a real `tsc` resolve and compile a fixture against it.
 * Compiling — not just parsing — is what catches a broken `extends` path or an
 * incompatible compiler-option combination. A final probe confirms `strict`
 * actually reaches consumers through the extends chain.
 */

const require = createRequire(import.meta.url);
const tscPath = require.resolve('typescript/bin/tsc');
const pkgRoot = fileURLToPath(new URL('..', import.meta.url));

const variants = ['base', 'node', 'nestjs', 'react-native', 'next', 'vite-react'];

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`✗ ${message}`);
};
const pass = (message) => console.log(`✓ ${message}`);

/** Run `tsc --noEmit` against a fixture that extends `configPath`. */
const compile = (configPath, source) => {
  const dir = mkdtempSync(join(tmpdir(), 'tsconfig-smoke-'));
  try {
    writeFileSync(join(dir, 'probe.ts'), source);
    writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ extends: configPath, include: ['probe.ts'] }));
    try {
      execFileSync(process.execPath, [tscPath, '--noEmit', '-p', join(dir, 'tsconfig.json')], { encoding: 'utf8' });
      return { ok: true, output: '' };
    } catch (error) {
      return { ok: false, output: String(error.stdout || error.stderr || error.message).trim() };
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

for (const variant of variants) {
  const configPath = join(pkgRoot, `${variant}.json`);

  try {
    const raw = JSON.parse(readFileSync(configPath, 'utf8'));
    assert.ok(raw.compilerOptions, 'must have compilerOptions');
    if (variant === 'base') {
      assert.equal(raw.compilerOptions.strict, true, 'base must set strict');
    } else {
      assert.equal(raw.extends, './base.json', 'must extend ./base.json');
    }
    pass(`${variant}.json is well-formed`);
  } catch (error) {
    fail(`${variant}.json: ${error.message}`);
    continue;
  }

  const result = compile(configPath, 'export const ok: number = 1;\n');
  if (result.ok) {
    pass(`${variant}.json compiles a clean fixture`);
  } else {
    fail(`${variant}.json failed to compile: ${result.output}`);
  }
}

// `strict` from base.json must reach a consumer: an implicit-any param must error.
const probe = compile(join(pkgRoot, 'base.json'), 'export const identity = (value) => value;\n');
if (!probe.ok && probe.output.includes('implicitly has an')) {
  pass('base.json enforces strict (implicit any rejected) through the extends chain');
} else {
  fail(`base.json did not enforce strict: ${probe.ok ? 'fixture compiled' : probe.output}`);
}

if (failures > 0) {
  console.error(`\n${failures} smoke-test check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll smoke-test checks passed.');
}
