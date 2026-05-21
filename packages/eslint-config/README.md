# @carlos3g/eslint-config

Composable ESLint flat-config presets for TypeScript, NestJS, React and Expo —
the linting half of [carlos3g's code style](https://github.com/carlos3g/code-style).

Install once, pick the preset that matches the stack.

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

## Presets

Each preset is a flat-config array.

| Subpath                            | Use for                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| `@carlos3g/eslint-config/base`     | Any TypeScript project — TS rules + sensible defaults      |
| `@carlos3g/eslint-config/nest`     | NestJS APIs — base + jest layer + Prettier                 |
| `@carlos3g/eslint-config/expo`     | Expo / React Native — base + react + tanstack-query + RTL  |
| `@carlos3g/eslint-config/react`    | React (web) — base + react + react-hooks + Prettier        |
| `@carlos3g/eslint-config/jest`     | Jest add-on for spec/e2e files                             |
| `@carlos3g/eslint-config/prettier` | Prettier integration (always last when composing manually) |

`base` is the foundation: `eslint:recommended` + typescript-eslint
`strictTypeChecked`. The `nest`, `react` and `expo` presets already include
`base` and Prettier — pick exactly one, never compose `base` + a stack preset
manually. `jest` and `prettier` are composable add-ons; `prettier` must always
come **last** so it can disable conflicting stylistic rules.

## Composing manually

```js
import { base, jest, prettier } from '@carlos3g/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...base,
  ...jest,
  {
    rules: {
      /* project overrides */
    },
  },
  ...prettier
);
```

## License

MIT © carlos3g
