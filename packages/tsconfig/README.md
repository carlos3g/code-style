# @carlos3g/tsconfig

Shared TypeScript configs — the type-checking half of
[carlos3g's code style](https://github.com/carlos3g/code-style).

```bash
yarn add -D @carlos3g/tsconfig typescript
```

Point your `tsconfig.json` at the variant that matches the stack:

```json
{
  "extends": "@carlos3g/tsconfig/nestjs.json",
  "compilerOptions": {
    "outDir": "dist",
    "paths": { "@app/*": ["./src/*"] }
  },
  "include": ["src", "test"]
}
```

## Variants

| Variant             | Extend with                            | Use for                                                |
| ------------------- | -------------------------------------- | ------------------------------------------------------ |
| `base.json`         | `@carlos3g/tsconfig/base.json`         | The strict core — every variant extends it.            |
| `node.json`         | `@carlos3g/tsconfig/node.json`         | Plain Node services and libraries (`NodeNext`).        |
| `nestjs.json`       | `@carlos3g/tsconfig/nestjs.json`       | NestJS APIs — CommonJS + decorator metadata.           |
| `next.json`         | `@carlos3g/tsconfig/next.json`         | Next.js apps — bundler resolution + the `next` plugin. |
| `vite-react.json`   | `@carlos3g/tsconfig/vite-react.json`   | Vite + React (web) apps.                               |
| `react-native.json` | `@carlos3g/tsconfig/react-native.json` | Expo / React Native apps.                              |

`base.json` enables `strict` plus `isolatedModules`, `esModuleInterop`,
`forceConsistentCasingInFileNames`, `noFallthroughCasesInSwitch` and
`moduleDetection: force`. It deliberately leaves `target`, `module` and `lib` to
the stack variants. Unused-code checks are left to ESLint to avoid
double-reporting.

## Expo

Expo ships its own base config, so stack it _after_ Expo's using an `extends`
array (TypeScript 5.0+):

```json
{
  "extends": ["expo/tsconfig.base", "@carlos3g/tsconfig/react-native.json"],
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## License

MIT © carlos3g
