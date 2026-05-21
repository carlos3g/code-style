# @carlos3g/prettier-config

Shared Prettier config — the formatting half of
[carlos3g's code style](https://github.com/carlos3g/code-style).

```bash
yarn add -D @carlos3g/prettier-config prettier
```

Reference it from `package.json`:

```json
{
  "prettier": "@carlos3g/prettier-config"
}
```

That is the whole setup — no `.prettierrc` file needed.

## What it sets

| Option          | Value  |
| --------------- | ------ |
| `singleQuote`   | `true` |
| `trailingComma` | `es5`  |
| `printWidth`    | `120`  |
| `tabWidth`      | `2`    |

## Extending it

To add project-specific options or plugins, point `package.json` at a local
file that spreads this config:

```js
// prettier.config.mjs
import base from '@carlos3g/prettier-config';

export default {
  ...base,
  plugins: ['prettier-plugin-tailwindcss'],
};
```

```json
{
  "prettier": "./prettier.config.mjs"
}
```

## License

MIT © carlos3g
