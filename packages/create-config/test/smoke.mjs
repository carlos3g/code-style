// @ts-check
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Smoke test for @carlos3g/create-config.
 *
 * Runs the CLI in throwaway directories and asserts it scaffolds the expected
 * files, wires package.json, respects existing files, and refuses to run
 * outside a project.
 */

const cliPath = fileURLToPath(new URL('../index.mjs', import.meta.url));

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`✗ ${message}`);
};
const pass = (message) => console.log(`✓ ${message}`);

/** Create a throwaway project dir, optionally with a package.json. */
const projectDir = (withPackageJson = true) => {
  const dir = mkdtempSync(join(tmpdir(), 'create-config-smoke-'));
  if (withPackageJson) {
    writeFileSync(join(dir, 'package.json'), `${JSON.stringify({ name: 'fixture', version: '1.0.0' }, null, 2)}\n`);
  }
  return dir;
};

const runCli = (dir, args) =>
  execFileSync(process.execPath, [cliPath, ...args], {
    cwd: dir,
    encoding: 'utf8',
    // Capture stderr instead of letting it inherit the parent's — keeps the
    // expected-failure case from printing alarming output.
    stdio: ['ignore', 'pipe', 'pipe'],
  });

// ── scaffolds a nest project end to end ──
{
  const dir = projectDir();
  try {
    runCli(dir, ['--stack', 'nest']);

    const expected = [
      'eslint.config.mjs',
      'tsconfig.json',
      '.editorconfig',
      '.nvmrc',
      '.commitlintrc.json',
      '.lintstagedrc.json',
      '.prettierignore',
      '.husky/pre-commit',
      '.husky/commit-msg',
    ];
    const missing = expected.filter((file) => !existsSync(join(dir, file)));
    assert.equal(missing.length, 0, `missing files: ${missing.join(', ')}`);

    const eslintConfig = readFileSync(join(dir, 'eslint.config.mjs'), 'utf8');
    assert.ok(eslintConfig.includes('@carlos3g/eslint-config/nest'), 'eslint config imports the nest preset');

    const tsconfig = JSON.parse(readFileSync(join(dir, 'tsconfig.json'), 'utf8'));
    assert.equal(tsconfig.extends, '@carlos3g/tsconfig/nestjs.json');

    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    assert.equal(pkg.prettier, '@carlos3g/prettier-config');
    assert.equal(pkg.scripts.lint, 'eslint .');
    assert.equal(pkg.scripts.format, 'prettier --write .');
    assert.equal(pkg.scripts.prepare, 'husky');

    pass('scaffolds a nest project (files, tsconfig, package.json)');
  } catch (error) {
    fail(`nest scaffold: ${error.message}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── expo uses the array `extends` so it stacks on top of Expo's base ──
{
  const dir = projectDir();
  try {
    runCli(dir, ['--stack', 'expo']);
    const tsconfig = JSON.parse(readFileSync(join(dir, 'tsconfig.json'), 'utf8'));
    assert.deepEqual(tsconfig.extends, ['expo/tsconfig.base', '@carlos3g/tsconfig/react-native.json']);
    pass('expo scaffold uses the array extends');
  } catch (error) {
    fail(`expo scaffold: ${error.message}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── refuses to run where there is no package.json ──
{
  const dir = projectDir(false);
  try {
    runCli(dir, ['--stack', 'nest']);
    fail('expected the CLI to fail without a package.json');
  } catch (error) {
    assert.ok(String(error.stderr ?? '').includes('No package.json'), 'reports the missing package.json');
    pass('refuses to run without a package.json');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── keeps existing files unless --force ──
{
  const dir = projectDir();
  try {
    writeFileSync(join(dir, '.nvmrc'), 'custom\n');

    runCli(dir, ['--stack', 'node']);
    assert.equal(readFileSync(join(dir, '.nvmrc'), 'utf8'), 'custom\n', 'existing file is preserved');

    runCli(dir, ['--stack', 'node', '--force']);
    assert.equal(readFileSync(join(dir, '.nvmrc'), 'utf8'), 'lts/jod\n', '--force overwrites');

    pass('keeps existing files unless --force is passed');
  } catch (error) {
    fail(`force behavior: ${error.message}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (failures > 0) {
  console.error(`\n${failures} smoke-test check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll smoke-test checks passed.');
}
