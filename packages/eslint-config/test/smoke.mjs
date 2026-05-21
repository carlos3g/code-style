// @ts-check
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ESLint } from 'eslint';

/**
 * Behavioral smoke test for the published presets.
 *
 * Phase 1 imports every preset module — proving imports resolve and each
 * `tseslint.config(...)` call executes without throwing.
 *
 * Phase 2 runs each stack preset against fixture files and asserts that
 * specific rules actually fire. Asserting on rule IDs (not just that the config
 * parses) is what catches typo'd rule names, broken plugin wiring and
 * strictness regressions. Fixtures live in a throwaway temp dir so the repo
 * never carries files with intentional violations, and so the type-checked
 * presets get a real `tsconfig.json` to resolve against.
 */

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(repoRoot, 'src');
const presets = ['base', 'nest', 'expo', 'react', 'jest', 'prettier'];

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`✗ ${message}`);
};
const pass = (message) => console.log(`✓ ${message}`);

// ── Phase 1: every preset module loads and exports a non-empty config array ──
for (const name of presets) {
  try {
    const mod = await import(pathToFileURL(join(srcDir, `${name}.mjs`)).href);
    assert.ok(Array.isArray(mod.default), 'default export must be an array');
    assert.ok(mod.default.length > 0, 'config array must not be empty');
    pass(`${name}.mjs loads`);
  } catch (error) {
    fail(`${name}.mjs failed to load: ${error.message}`);
  }
}

try {
  const index = await import(pathToFileURL(join(srcDir, 'index.mjs')).href);
  const missing = presets.filter((name) => !index[name]);
  if (missing.length > 0) {
    fail(`index.mjs is missing exports: ${missing.join(', ')}`);
  } else {
    pass('index.mjs re-exports every preset');
  }
} catch (error) {
  fail(`index.mjs failed to load: ${error.message}`);
}

// ── Phase 2: each stack preset flags the rules it promises to ──
// `settings` pins plugin versions that would otherwise be auto-detected from
// installed packages — the temp dir has no `jest` or `react` package.
/** @type {{ preset: string, settings?: object, cases: { file: string, code: string, wants?: string[], unwanted?: string[] }[] }[]} */
const suites = [
  {
    preset: 'base',
    cases: [
      {
        file: 'weak-typing.ts',
        code: 'const value: any = 1;\nexport const leak: {} = value;\n',
        wants: ['@typescript-eslint/no-explicit-any', '@typescript-eslint/no-empty-object-type'],
      },
    ],
  },
  {
    preset: 'nest',
    settings: { jest: { version: 29 } },
    cases: [
      {
        file: 'service.ts',
        code: 'export class Service {\n  run() {\n    return 1;\n  }\n}\n',
        wants: ['@typescript-eslint/explicit-member-accessibility'],
      },
      {
        file: 'flow.spec.ts',
        code: "xit('pending', () => {});\n",
        wants: ['jest/no-disabled-tests'],
      },
      {
        file: 'bare-class.ts',
        code: 'export class Bare {}\n',
        wants: ['@typescript-eslint/no-extraneous-class'],
      },
      {
        // NestJS modules are empty `@Module()`-decorated classes — `no-extraneous-class`
        // must allow them via `allowWithDecorator`.
        file: 'app.module.ts',
        code: 'const wired = (_t: unknown, _c: unknown): void => {};\n\n@wired\nexport class AppModule {}\n',
        unwanted: ['@typescript-eslint/no-extraneous-class'],
      },
    ],
  },
  {
    preset: 'react',
    settings: { react: { version: '18.0' } },
    cases: [
      {
        file: 'widget.tsx',
        code: 'export function Widget() {\n  return <div  />;\n}\n',
        wants: ['react/function-component-definition', 'prettier/prettier'],
      },
    ],
  },
  {
    preset: 'expo',
    settings: { react: { version: '18.0' } },
    cases: [
      {
        file: 'screen.tsx',
        code: 'export function Screen() {\n  return <div />;\n}\n',
        wants: ['react/function-component-definition'],
      },
    ],
  },
];

const tsconfig = JSON.stringify(
  {
    compilerOptions: {
      strict: true,
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      lib: ['ES2022', 'DOM'],
      skipLibCheck: true,
      noEmit: true,
    },
    include: ['**/*.ts', '**/*.tsx'],
  },
  null,
  2
);

const workDir = mkdtempSync(join(tmpdir(), 'eslint-config-smoke-'));
writeFileSync(join(workDir, 'tsconfig.json'), tsconfig);

const originalCwd = process.cwd();
// typescript-eslint resolves `tsconfigRootDir` from process.cwd(); the fixtures
// and their tsconfig must be the working directory or they fall outside it.
process.chdir(workDir);

try {
  for (const { preset, settings, cases } of suites) {
    const eslint = new ESLint({
      cwd: workDir,
      overrideConfigFile: join(srcDir, `${preset}.mjs`),
      overrideConfig: settings ? [{ settings }] : [],
    });

    for (const { file, code, wants = [], unwanted = [] } of cases) {
      const filePath = join(workDir, file);
      writeFileSync(filePath, code);

      try {
        const [result] = await eslint.lintFiles([filePath]);
        const fired = new Set(result.messages.map((message) => message.ruleId));
        const missing = wants.filter((rule) => !fired.has(rule));
        const unexpected = unwanted.filter((rule) => fired.has(rule));
        if (missing.length > 0) {
          fail(`${preset} → ${file}: expected rules never fired: ${missing.join(', ')}`);
        } else if (unexpected.length > 0) {
          fail(`${preset} → ${file}: rules fired that should not have: ${unexpected.join(', ')}`);
        } else {
          const summary = [...wants.map((rule) => `+${rule}`), ...unwanted.map((rule) => `-${rule}`)].join(', ');
          pass(`${preset} → ${file}: ${summary}`);
        }
      } catch (error) {
        fail(`${preset} → ${file}: preset crashed while linting: ${error.message}`);
      }
    }
  }
} finally {
  process.chdir(originalCwd);
  rmSync(workDir, { recursive: true, force: true });
}

if (failures > 0) {
  console.error(`\n${failures} smoke-test check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll smoke-test checks passed.');
}
