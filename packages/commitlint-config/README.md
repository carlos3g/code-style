# @carlos3g/commitlint-config

Shared [commitlint](https://commitlint.js.org) config — the commit-message half
of [carlos3g's code style](https://github.com/carlos3g/code-style).

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0): English,
imperative, lowercase.

```bash
yarn add -D @carlos3g/commitlint-config @commitlint/cli
```

Reference it from `.commitlintrc.json`:

```json
{
  "extends": ["@carlos3g/commitlint-config"]
}
```

Then wire it into a `commit-msg` git hook (e.g. with
[husky](https://typicode.github.io/husky/)):

```sh
npx --no -- commitlint --edit "$1"
```

## What it sets

Re-exports [`@commitlint/config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional).
The indirection exists so every project references one versioned source — and
so project-wide rule tweaks happen here, once.

## License

MIT © carlos3g
