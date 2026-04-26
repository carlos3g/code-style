# My code style

This repository documents the conventions I follow on personal and professional projects, and ships [`@carlos3g/eslint-config`](#eslint-config-carlos3geslint-config) — the ESLint flat-config presets that encode them. Meant as a quick reference for myself, teammates, and agents (Claude Code, Cursor, etc).

## ESLint config (`@carlos3g/eslint-config`)

Multi-preset package with composable presets — install once, pick the preset that matches the stack.

```bash
yarn add -D @carlos3g/eslint-config eslint typescript
```

```js
// eslint.config.mjs — NestJS API
import nest from '@carlos3g/eslint-config/nest';
export default nest;
```

```js
// eslint.config.mjs — Expo / React Native
import expo from '@carlos3g/eslint-config/expo';
export default expo;
```

Available presets (each is a flat-config array):

| Subpath                            | Use for                                                       |
| ---------------------------------- | ------------------------------------------------------------- |
| `@carlos3g/eslint-config/base`     | Any TypeScript project — TS rules + sensible defaults         |
| `@carlos3g/eslint-config/nest`     | NestJS APIs — base + jest layer + Prettier                    |
| `@carlos3g/eslint-config/expo`     | Expo / React Native — base + react + tanstack-query + RTL     |
| `@carlos3g/eslint-config/react`    | React (web) — base + react + react-hooks + Prettier           |
| `@carlos3g/eslint-config/jest`     | Jest add-on for spec/e2e files                                |
| `@carlos3g/eslint-config/prettier` | Prettier integration (always last when composing manually)    |

Composing manually:

```js
import { base, jest, prettier } from '@carlos3g/eslint-config';
import tseslint from 'typescript-eslint';
export default tseslint.config(...base, ...jest, { rules: { /* ... */ } }, ...prettier);
```

Source lives in [`src/`](./src). Releases are automated via GitHub Actions with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) — push a `vX.Y.Z` tag and the `release.yml` workflow publishes with provenance, no `NPM_TOKEN` required.

## Prerequisites

- [Principle of least astonishment](https://w.wiki/AiFD)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react) as the baseline organization for frontends
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) as the starting point

## Base stack

- **Language:** TypeScript (`strict: true`, `noImplicitAny`, `strictNullChecks`)
- **Runtime:** Node.js LTS (`lts/iron` via `.nvmrc`)
- **Package manager:** Yarn 4 (Berry) with `nodeLinker: node-modules`
- **Monorepo:** [Turborepo](https://turbo.build/) + workspaces (`apps/*`, `packages/*`)
- **Backend:** [NestJS](https://nestjs.com/) + [Prisma](https://www.prisma.io/) + PostgreSQL
- **Mobile:** [Expo](https://expo.dev/) + React Native + [NativeWind](https://www.nativewind.dev/)
- **Server state:** [TanStack Query](https://tanstack.com/query)
- **Client state:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Local persistence (mobile):** [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- **Forms:** [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/)

## Tooling

- ESLint: [`@carlos3g/eslint-config`](#eslint-config-carlos3geslint-config) (flat config, `typescript-eslint/recommendedTypeChecked`)
- Prettier:
  ```json
  {
    "singleQuote": true,
    "trailingComma": "es5",
    "printWidth": 120,
    "tabWidth": 2
  }
  ```
- EditorConfig: LF, UTF-8, 2 spaces, final newline, no trailing whitespace
- Commits: [commitlint](https://commitlint.js.org) with `@commitlint/config-conventional`
- Pre-commit: [lint-staged](https://github.com/lint-staged/lint-staged) — `prettier --write` + `eslint --fix` on JS/TS; `prettier --write` on JSON/MD/YAML
- Git hooks: [husky](https://typicode.github.io/husky/)
  - `commit-msg`: commitlint
  - `pre-commit`: lint-staged
  - `pre-push`: `style` (format + lint + typecheck) + `test` + `test:e2e`

## Naming conventions

- **Files:** `kebab-case.ts`. Suffixes by role:
  - `*.controller.ts`, `*.module.ts`, `*.service.ts`, `*.entity.ts`
  - `*.use-case.ts` — one use case per file
  - `*.contract.ts` — interface/abstract class contract
  - `*.repository.ts` — implementation (e.g. `prisma-quote.repository.ts`)
  - `*.e2e-spec.ts` next to the controller/repository under test
- **Classes:** `PascalCase`
- **Variables and functions:** `camelCase`
- **Constants:** `UPPER_CASE` allowed
- **React components:** `PascalCase`, file `kebab-case.tsx`, **arrow function** + named export
- **Hooks:** `use-*.ts`, exporting a `useX` function
- **DTOs** (Spring Boot-style suffixes — same convention I apply on Java projects, [reference](https://stackoverflow.com/a/35341664/13274020)):
  - `*-request.ts` — incoming HTTP payload (validated with `class-validator`)
  - `*-query.ts` — HTTP query params
  - `*-input.ts` — use case input (already enriched with user/context)
  - `*-repository-dtos.ts` — types consumed by repositories

## Backend (NestJS)

### Module layout

```
<domain>/
├── contracts/          # abstract classes (repository/service interfaces)
├── dtos/               # request, query, input, repository dtos
├── entities/           # domain entities
├── repositories/       # Prisma implementations of the contracts
├── services/           # domain services when justified
├── use-cases/          # one use case per feature
├── <domain>.controller.ts
└── <domain>.module.ts
```

### Patterns

- **Repository pattern**: every database access goes through an `abstract class *RepositoryContract`. The module wires the concrete implementation:
  ```ts
  providers: [{ provide: QuoteRepositoryContract, useClass: PrismaQuoteRepository }];
  ```
- **One use case per feature**: each use case is an `@Injectable` class that implements `UseCaseHandler` and exposes a single `handle(input)` method. No giant `*Service` god-classes.
- **Thin controllers**: only receive the request, normalize it, and delegate to the use case.
- **Explicit `public`** on every member (`@typescript-eslint/explicit-member-accessibility`).
- **`type`-only imports** whenever possible (`@typescript-eslint/consistent-type-imports`).
- **Validate at the edge**: `class-validator` on `*Request` / `*Query`, global `ValidationPipe`.
- **URI versioning**: `@Controller({ path: 'quotes', version: '1' })`.
- **Path aliases**: `@app/*` for `src/`, `@test/*` for `test/`.
- **REST**: controller methods follow `index` / `show` / `store` / `update` / `destroy` when applicable; non-CRUD actions are named after the verb (`favorite`, `share`).

### Use case example

```ts
@Injectable()
export class FavoriteQuoteUseCase implements UseCaseHandler {
  public constructor(private readonly quoteRepository: QuoteRepositoryContract) {}

  public async handle(input: FavoriteQuoteInput): Promise<void> {
    const { quoteUuid, user } = input;

    const quote = await this.quoteRepository.findUniqueOrThrow({ where: { uuid: quoteUuid } });

    if (await this.quoteRepository.isFavorited({ where: { quoteId: quote.id, userId: user.id } })) {
      return;
    }

    await this.quoteRepository.favorite({ data: { quoteId: quote.id, userId: user.id } });
  }
}
```

### Database

- Prisma as the ORM, schema in `prisma/schema.prisma`
- `prisma/seeders/` and `prisma/factories/` for fixtures
- Internal IDs: `id` (int autoincrement); public IDs: `uuid` — APIs always expose **uuid**, never `id`

### Tests

- Unit: Jest + mocks of the contracts
- E2E: `*.e2e-spec.ts` next to the controller/repository, real database (Postgres in Docker), no DB mocks
- `test/` at the app root holds helpers, factories, and the test server bootstrap

## Frontend ([Bulletproof React](https://github.com/alan2207/bulletproof-react))

### Layout

```
src/
├── features/<feature>/
│   ├── components/
│   ├── contracts/      # service interfaces
│   ├── hooks/          # use-* (React Query + logic)
│   ├── services/       # class implementing the contract + singleton instance
│   ├── utils/
│   └── (contexts|store|enums|validations) when needed
├── shared/             # cross-feature components, hooks, services, utils, theme
├── lib/<library>/      # config for external libs (axios, react-query, i18n, zod...)
├── app/                # routes (Expo Router) or screens/
├── navigation/
└── types/              # global types (api, http, entities)
```

### Patterns

- **Path alias:** `@/*` → `src/*`
- **Service per feature**: a class implementing a `*ServiceContract`, instantiated once:
  ```ts
  const quoteService: QuoteServiceContract = new QuoteService(httpClientService);
  ```
- **HTTP** centralized in `shared/services/http-client-service` (axios) — features never import axios directly.
- **React Query** for any network call; `queryKeys` centralized in `lib/react-query/query-keys.ts`.
- **Optimistic mutations** with `onMutate` + rollback in `onError` when UX demands instant feedback.
- **Zustand** for UI/session state; **MMKV** for persistence.
- **Components** are always `arrow function`s — no `React.FC`.
- **i18n** via `react-i18next` — no hardcoded strings in UI.
- **Toasts** standardized (`sonner-native`) for mutation errors.

## Git & commits

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0): `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`, `build`
- Messages in **English**, imperative, lowercase (`feat: add quote sharing`)
- 1 PR = 1 reason. Refactors don't ride along with features.
- `main` is always deployable; work happens on `feat/...`, `fix/...` branches.

## Principles

- Fix the root cause, not the symptom. Bypasses (`--no-verify`, `eslint-disable`, `as any`) are debt — record the why.
- Don't introduce abstraction before the third repetition.
- Don't comment the **what** — names handle that. Only comment the **why** when it isn't obvious.
- Validate at the edges (HTTP, storage, external libs). Trust the internal code.
- Delete completely instead of leaving `// removed` notes or `_unused` shims.

## Links

- ESLint config: [`@carlos3g/eslint-config`](#eslint-config-carlos3geslint-config) (this repo)
- Conventional Commits: [conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0)
- Bulletproof React: [github.com/alan2207/bulletproof-react](https://github.com/alan2207/bulletproof-react)
- Airbnb JS: [github.com/airbnb/javascript](https://github.com/airbnb/javascript)
- DTO naming (Spring Boot convention, also applied to TS/Java projects): [stackoverflow.com/a/35341664](https://stackoverflow.com/a/35341664/13274020)
- lint-staged: [github.com/lint-staged/lint-staged](https://github.com/lint-staged/lint-staged)
- commitlint: [commitlint.js.org](https://commitlint.js.org)
