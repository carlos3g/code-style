#!/usr/bin/env node
// @ts-check
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';

/**
 * @carlos3g/create-config — scaffold a project onto carlos3g's code style.
 *
 * Writes the config files, wires package.json, and prints the install command.
 * Zero runtime dependencies: it only consumes the @carlos3g/* config packages
 * once the consumer installs them.
 */

/** @typedef {{ eslintPreset: string, tsconfigExtends: string | string[], label: string }} Stack */

/** @type {Record<string, Stack>} */
const STACKS = {
  nest: { eslintPreset: 'nest', tsconfigExtends: '@carlos3g/tsconfig/nestjs.json', label: 'NestJS API' },
  react: { eslintPreset: 'react', tsconfigExtends: '@carlos3g/tsconfig/vite-react.json', label: 'React (web)' },
  expo: {
    eslintPreset: 'expo',
    tsconfigExtends: ['expo/tsconfig.base', '@carlos3g/tsconfig/react-native.json'],
    label: 'Expo / React Native',
  },
  node: { eslintPreset: 'base', tsconfigExtends: '@carlos3g/tsconfig/node.json', label: 'Plain Node / TypeScript' },
};

const DEV_DEPENDENCIES = [
  '@carlos3g/eslint-config',
  '@carlos3g/tsconfig',
  '@carlos3g/prettier-config',
  '@carlos3g/commitlint-config',
  '@commitlint/cli',
  'eslint',
  'husky',
  'lint-staged',
  'prettier',
  'typescript',
];

const EDITORCONFIG = `root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,mjs,cjs,ts,tsx,json,yml,yaml}]
indent_style = space
indent_size = 2
`;

/** Build the file map (relative path → contents) for a stack. */
function configFiles(/** @type {Stack} */ stack) {
  const json = (/** @type {unknown} */ value) => `${JSON.stringify(value, null, 2)}\n`;

  return {
    'eslint.config.mjs': `// @ts-check\nimport config from '@carlos3g/eslint-config/${stack.eslintPreset}';\n\nexport default config;\n`,
    'tsconfig.json': json({ extends: stack.tsconfigExtends, include: ['src'] }),
    '.editorconfig': EDITORCONFIG,
    '.nvmrc': 'lts/jod\n',
    '.commitlintrc.json': json({ extends: ['@carlos3g/commitlint-config'] }),
    '.lintstagedrc.json': json({
      '*.{js,mjs,cjs,ts,tsx}': ['prettier --write', 'eslint --fix'],
      '*.{json,md,yml,yaml}': ['prettier --write'],
    }),
    '.prettierignore': 'node_modules/\ndist/\nbuild/\ncoverage/\n',
    '.husky/pre-commit': 'npx --no -- lint-staged\n',
    '.husky/commit-msg': 'npx --no -- commitlint --edit "$1"\n',
  };
}

/** Read `--stack <name>` / `-s <name>` / the first positional argument. */
function readStackArg(/** @type {string[]} */ args) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--stack' || arg === '-s') {
      return args[i + 1];
    }
    if (arg.startsWith('--stack=')) {
      return arg.slice('--stack='.length);
    }
    if (!arg.startsWith('-')) {
      return arg;
    }
  }
  return undefined;
}

/** Detect the package manager from npm's user-agent so the printed command fits. */
function detectAddCommand() {
  const agent = process.env.npm_config_user_agent ?? '';
  if (agent.startsWith('yarn')) {
    return 'yarn add -D';
  }
  if (agent.startsWith('pnpm')) {
    return 'pnpm add -D';
  }
  return 'npm install -D';
}

async function promptStack() {
  if (!process.stdin.isTTY) {
    throw new Error('No stack given and not running interactively — pass --stack <nest|react|expo|node>.');
  }

  const keys = Object.keys(STACKS);
  console.log('\nWhich stack is this project?\n');
  keys.forEach((key, index) => {
    console.log(`  ${index + 1}) ${key} — ${STACKS[key].label}`);
  });

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(`\nSelect (1-${keys.length}): `)).trim();
    const byIndex = keys[Number.parseInt(answer, 10) - 1];
    return byIndex ?? answer;
  } finally {
    rl.close();
  }
}

/** Write a file, creating parent dirs. Existing files are kept unless `force`. */
function writeFile(/** @type {string} */ path, /** @type {string} */ content, /** @type {boolean} */ force) {
  if (existsSync(path) && !force) {
    return false;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return true;
}

/** Add the prettier key and lint/format/prepare scripts without clobbering existing ones. */
function patchPackageJson(/** @type {string} */ pkgPath) {
  /** @type {{ scripts?: Record<string, string>, prettier?: unknown }} */
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  let changed = false;

  if (pkg.prettier === undefined) {
    pkg.prettier = '@carlos3g/prettier-config';
    changed = true;
  }

  const scripts = pkg.scripts ?? {};
  for (const [name, command] of Object.entries({ lint: 'eslint .', format: 'prettier --write .', prepare: 'husky' })) {
    if (scripts[name] === undefined) {
      scripts[name] = command;
      changed = true;
    }
  }
  pkg.scripts = scripts;

  if (changed) {
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }
  return changed;
}

function printHelp() {
  console.log(`create-config — scaffold a project onto carlos3g's code style.

Usage:
  npm create @carlos3g/config [-- --stack <name>]
  npx @carlos3g/create-config [--stack <name>] [--force]

Stacks:
  nest    NestJS API
  react   React (web)
  expo    Expo / React Native
  node    Plain Node / TypeScript

Options:
  -s, --stack <name>   Pick the stack without the interactive prompt.
  -f, --force          Overwrite config files that already exist.
  -h, --help           Show this help.`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    return;
  }

  const force = args.includes('-f') || args.includes('--force');
  const cwd = process.cwd();
  const pkgPath = join(cwd, 'package.json');
  if (!existsSync(pkgPath)) {
    throw new Error('No package.json in the current directory — run this inside a project.');
  }

  const stackKey = readStackArg(args.filter((arg) => arg !== '-f' && arg !== '--force')) ?? (await promptStack());
  const stack = STACKS[stackKey];
  if (stack === undefined) {
    throw new Error(`Unknown stack "${stackKey}" — choose one of: ${Object.keys(STACKS).join(', ')}.`);
  }

  console.log(`\nScaffolding ${stack.label} config…\n`);
  for (const [relativePath, content] of Object.entries(configFiles(stack))) {
    const path = join(cwd, relativePath);
    if (writeFile(path, content, force)) {
      if (relativePath.startsWith('.husky/')) {
        chmodSync(path, 0o755);
      }
      console.log(`  write  ${relativePath}`);
    } else {
      console.log(`  skip   ${relativePath} (exists — pass --force to overwrite)`);
    }
  }

  console.log(patchPackageJson(pkgPath) ? '  patch  package.json' : '  skip   package.json (already configured)');

  console.log(`\n✓ Done. Next steps:\n`);
  console.log(`  1. Install the dev dependencies:\n`);
  console.log(`     ${detectAddCommand()} ${DEV_DEPENDENCIES.join(' ')}\n`);
  console.log(`  2. Install runs the "prepare" script, which enables the husky git hooks.\n`);
}

main().catch((/** @type {unknown} */ error) => {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
