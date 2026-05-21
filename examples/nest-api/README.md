# nest-api example

A reference NestJS service that consumes the `@carlos3g` config packages from
this monorepo (`workspace:*`):

- ESLint via `@carlos3g/eslint-config/nest`
- TypeScript via `@carlos3g/tsconfig/nestjs.json`

It is **not published**. CI type-checks (`tsc --noEmit`) and lints it on every
push, so the conventions documented in the [root README](../../README.md) —
the repository pattern, one use case per feature, thin controllers, DTO naming —
stay real, compiled code instead of snippets that quietly rot.

```bash
yarn workspace @examples/nest-api check   # tsc --noEmit
yarn workspace @examples/nest-api lint    # eslint .
```

The `src/quotes/` feature mirrors the module layout from the root README:
`contracts/`, `dtos/`, `entities/`, `repositories/`, `use-cases/`, plus the
controller and module.
