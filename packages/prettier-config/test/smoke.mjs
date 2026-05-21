// @ts-check
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import prettier from 'prettier';

/**
 * Smoke test for @carlos3g/prettier-config.
 *
 * Asserts the config exposes the documented options and that Prettier actually
 * accepts it and produces the expected output — catching a typo'd option name
 * or value that a plain JSON parse would miss.
 */

const config = JSON.parse(readFileSync(new URL('../index.json', import.meta.url), 'utf8'));

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`✗ ${message}`);
};
const pass = (message) => console.log(`✓ ${message}`);

try {
  assert.equal(config.singleQuote, true);
  assert.equal(config.trailingComma, 'es5');
  assert.equal(config.printWidth, 120);
  assert.equal(config.tabWidth, 2);
  pass('config exposes the documented options');
} catch (error) {
  fail(`config options: ${error.message}`);
}

try {
  const formatted = await prettier.format('const greeting = "hi"', { ...config, parser: 'babel' });
  assert.equal(formatted, "const greeting = 'hi';\n");
  pass('prettier accepts the config and applies it');
} catch (error) {
  fail(`prettier format: ${error.message}`);
}

if (failures > 0) {
  console.error(`\n${failures} smoke-test check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll smoke-test checks passed.');
}
