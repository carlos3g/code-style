# @carlos3g/create-config

Scaffold a project onto [carlos3g's code style](https://github.com/carlos3g/code-style)
in one command — ESLint, Prettier, TypeScript, commitlint, EditorConfig and
husky git hooks, all wired to the `@carlos3g/*` config packages.

```bash
npm create @carlos3g/config
```

It prompts for the stack, then writes the config and prints the install command.
Non-interactive:

```bash
npm create @carlos3g/config -- --stack nest
```

## Stacks

| Stack   | ESLint preset | TypeScript base                            |
| ------- | ------------- | ------------------------------------------ |
| `nest`  | `nest`        | `@carlos3g/tsconfig/nestjs.json`           |
| `react` | `react`       | `@carlos3g/tsconfig/vite-react.json`       |
| `expo`  | `expo`        | `expo/tsconfig.base` + `react-native.json` |
| `node`  | `base`        | `@carlos3g/tsconfig/node.json`             |

## What it does

- Writes `eslint.config.mjs`, `tsconfig.json`, `.editorconfig`, `.nvmrc`,
  `.commitlintrc.json`, `.lintstagedrc.json`, `.prettierignore` and the
  `.husky/pre-commit` + `.husky/commit-msg` hooks.
- Adds the `prettier` key and `lint` / `format` / `prepare` scripts to
  `package.json` — without clobbering anything already there.
- Prints the exact dev-dependency install command for your package manager.

Existing files are kept untouched unless you pass `--force`.

## Options

```
-s, --stack <name>   Pick the stack without the prompt (nest|react|expo|node).
-f, --force          Overwrite config files that already exist.
-h, --help           Show help.
```

## License

MIT © carlos3g
