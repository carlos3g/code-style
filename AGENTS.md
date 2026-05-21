# AGENTS.md

Working guide for AI agents in this repository. Conventions for _writing
application code_ — here and in other projects — live in [README.md](./README.md).
This file is about _developing the packages in this repo_.

## What this repo is

A **Turborepo monorepo** that publishes the `@carlos3g/*` family of shared
config packages — the tooling that encodes the author's code style — and
documents that style in `README.md`. Every project the author owns consumes
these packages instead of copy-pasting config.

Published packages live under `packages/*`; each is its own Yarn workspace and
its own independently-versioned npm package.

## Layout

| Path                      | Role                                            |
| ------------------------- | ----------------------------------------------- |
| `packages/*`              | Published config packages — one workspace each. |
| `packages/eslint-config/` | `@carlos3g/eslint-config` — the ESLint presets. |
| `examples/*`              | Reference projects that consume the packages.   |
| `eslint.config.mjs`       | Lints this repo's own `.mjs` files.             |
| `turbo.json`              | Turborepo task graph (`check`, `lint`, `test`). |
| `README.md`               | The code-style conventions (source of truth).   |
| `.github/workflows/`      | CI and release-please automation.               |

## Preset architecture (`@carlos3g/eslint-config`)

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
yarn check                 # turbo run check — syntax/type-check every workspace
yarn lint                  # eslint . + turbo run lint — lint every workspace
yarn test                  # turbo run test — behavioral smoke tests
yarn format                # prettier --write
yarn style                 # format + lint + check
```

Run a task in one workspace with `yarn workspace @carlos3g/<name> <script>`.
Before considering a change done, run `yarn check && yarn lint && yarn test` —
CI runs exactly these.

## Changing or adding a preset

1. Edit the relevant `packages/eslint-config/src/*.mjs`; keep the `// @ts-check`
   header.
2. Favor the strongest rule that is still correct. Never weaken or disable a
   rule just to silence noise — fix the root cause (see _Principles_ in
   `README.md`). No `eslint-disable` / `any` without a recorded reason.
3. If you add a plugin, put it in the package's **`dependencies`** (consumers
   need it), not `devDependencies`.
4. Add or extend a case in `packages/eslint-config/test/smoke.mjs` so the new
   behavior is asserted.
5. Run `yarn check && yarn lint && yarn test`.

`smoke.mjs` loads every preset, then lints fixtures and asserts the expected
rules actually fire. Fixtures are written to a throwaway temp dir with a real
`tsconfig.json`, because the type-checked rules need `projectService`. Copy that
temp-dir pattern for any manual verification — linting a stray file from the
repo root yields _"File ignored because outside of base path"_.

## Examples

`examples/*` are real (unpublished) projects that consume the packages via
`workspace:*`. They are type-checked (`tsc --noEmit`) and linted with the actual
presets in CI, so a preset or `tsconfig` regression fails the build instead of
silently rotting the README snippets. `examples/nest-api` hosts the NestJS
patterns documented in `README.md`. Keep examples green; when a preset change
legitimately requires example code to change, change both in the same commit.

## Adding a new package

1. Create `packages/<name>/` with its own `package.json` (`@carlos3g/<name>`,
   `version` `0.0.0` until first release, `publishConfig.access` `public`).
2. Add a `check` and/or `test` script so `turbo run` picks it up.
3. Register it in `release-please-config.json#packages` and add its path to
   `.release-please-manifest.json` (`"packages/<name>": "0.0.0"`).
4. Configure a trusted publisher for `@carlos3g/<name>` on npmjs.com **before**
   the first release, or the first publish must use a one-time granular token.

## Releases — never bump versions by hand

Driven by **release-please** + **Conventional Commits**, in manifest
(multi-package) mode:

- Push conventional commits to `main` → release-please maintains a Release PR
  per changed package with the version bump and that package's `CHANGELOG.md` →
  merging it tags the release and the publish job ships it to npm (provenance
  via OIDC trusted publishing — no token).
- Tags are component-scoped: `eslint-config-v0.3.0`, not `v0.3.0`.
- Never hand-edit a package's `version`, its `CHANGELOG.md`, or
  `.release-please-manifest.json`.
- Commit type drives the bump. A rule change that can newly fail consumers'
  builds is a `feat` (pre-1.0 → minor). A correction to existing behavior is a
  `fix`. Tooling is `chore` / `ci`.
- Scope commits to the package they touch when it helps
  (`feat(eslint-config): ...`). Commit messages: English, imperative, lowercase.

## Gotchas

- Each npm package ships only what its `package.json#files` lists (e.g.
  eslint-config ships `src/`, `LICENSE`, `README.md`). `test/`, `AGENTS.md` and
  `CLAUDE.md` are dev-only and never published.
- `nest` bundles the `jest` preset; `expo` bundles `testing-library` but **not**
  `jest`.
- Node: `.nvmrc` is `lts/jod` (22); packages support Node ≥ 20; CI tests on
  20 and 22; the publish job runs on 24.
