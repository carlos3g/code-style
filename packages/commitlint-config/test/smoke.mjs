// @ts-check
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

/**
 * Smoke test for @carlos3g/commitlint-config.
 *
 * The package is a thin re-export, so the only things it can get wrong are the
 * shape of the config and whether the config it points at is actually a
 * declared dependency. Both are checked here.
 */

const require = createRequire(import.meta.url);

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`✗ ${message}`);
};
const pass = (message) => console.log(`✓ ${message}`);

try {
  const config = require('../index.js');
  assert.ok(Array.isArray(config.extends), 'extends must be an array');
  assert.ok(config.extends.includes('@commitlint/config-conventional'), 'must extend @commitlint/config-conventional');
  pass('config extends @commitlint/config-conventional');
} catch (error) {
  fail(`config shape: ${error.message}`);
}

try {
  const module = await import('@commitlint/config-conventional');
  const conventional = module.default ?? module;
  assert.ok(conventional && typeof conventional.rules === 'object', 'conventional config must expose rules');
  assert.ok('type-enum' in conventional.rules, 'conventional rules must include type-enum');
  pass('@commitlint/config-conventional is installed and exposes its rules');
} catch (error) {
  fail(`dependency: ${error.message}`);
}

if (failures > 0) {
  console.error(`\n${failures} smoke-test check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll smoke-test checks passed.');
}
