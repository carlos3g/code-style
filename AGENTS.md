# AGENTS.md

Working guide for AI agents in this repository. Conventions for _writing
application code_ — here and in other projects — live in [README.md](./README.md).
This file is about _developing this package_.

## What this repo is

A single-package repository that publishes **`@carlos3g/eslint-config`** —
composable ESLint flat-config presets for TypeScript, NestJS, React and Expo —
and documents the author's code style in `README.md`.

## Layout

| Path                 | Role                                          |
| -------------------- | --------------------------------------------- |
| `src/*.mjs`          | The presets — the published product.          |
| `src/index.mjs`      | Re-exports every preset as a named export.    |
| `eslint.config.mjs`  | Lints this repo itself.                       |
| `test/smoke.mjs`     | Behavioral test harness (`yarn test`).        |
| `README.md`          | The code-style conventions (source of truth). |
| `.github/workflows/` | CI and release-please automation.             |

## Preset architecture

- **`base`** — the foundation: `eslint:recommended` + typescript-eslint
  **`strictTypeChecked`**. Strong typing is the point; `any` and weak types are
  treated as bugs.
- **`nest`, `react`, `expo`** — self-contained stack presets. Each _already
  includes_ `base` (and `prettier`, plus `jest` for `nest`). A consumer picks
  exactly one — never tell them to compose `base` + a stack preset manually.
- **`jest`, `prettier`** — composable add-ons, spread alongside a preset.
  `prettier` must always come **last** so it can disable conflicting stylistic
  rules.
- Composition order is law: `base → stack rules → add-ons → prettier`.
- Every preset is ESM (`.mjs`) and starts with `// @ts-check`.

## Commands

```bash
yarn install --immutable   # Yarn 4 via Corepack
yarn check                 # node --check — syntax-check every preset
yarn lint                  # lint this repo
yarn test                  # behavioral smoke test (see below)
yarn format                # prettier --write
```

Before considering a change done, run `yarn check && yarn lint && yarn test` —
CI runs exactly these.

## Changing or adding a preset

1. Edit the relevant `src/*.mjs`; keep the `// @ts-check` header.
2. Favor the strongest rule that is still correct. Never weaken or disable a
   rule just to silence noise — fix the root cause (see _Principles_ in
   `README.md`). No `eslint-disable` / `any` without a recorded reason.
3. If you add a plugin, put it in **`dependencies`** (consumers need it), not
   `devDependencies`.
4. Add or extend a case in `test/smoke.mjs` so the new behavior is asserted.
5. Run `yarn check && yarn lint && yarn test`.

`test/smoke.mjs` loads every preset, then lints fixtures and asserts the
expected rules actually fire. Fixtures are written to a throwaway temp dir with
a real `tsconfig.json`, because the type-checked rules need `projectService`.
Copy that temp-dir pattern for any manual verification — linting a stray file
from the repo root yields _"File ignored because outside of base path"_.

## Releases — never bump versions by hand

Driven by **release-please** + **Conventional Commits**:

- Push conventional commits to `main` → release-please maintains a Release PR
  with the version bump and `CHANGELOG.md` → merging it tags the release and
  publishes to npm (provenance via OIDC trusted publishing — no token).
- Never hand-edit `package.json`'s `version`, `CHANGELOG.md`, or
  `.release-please-manifest.json`.
- Commit type drives the bump. A rule change that can newly fail consumers'
  builds is a `feat` (pre-1.0 → minor). A correction to existing behavior is a
  `fix`. Tooling is `chore` / `ci`.
- Commit messages: English, imperative, lowercase.

## Gotchas

- The npm package ships only `src/`, `LICENSE`, `README.md`
  (`package.json#files`). `test/`, `AGENTS.md` and `CLAUDE.md` are dev-only and
  never published.
- `nest` bundles the `jest` preset; `expo` bundles `testing-library` but **not**
  `jest`.
- Node: `.nvmrc` is `lts/jod` (22); the package supports Node ≥ 20; CI tests on
  20 and 22; the publish job runs on 24.
