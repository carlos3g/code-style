// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default [
  // examples/* are linted by their own preset-based config via `turbo run lint`.
  { ignores: ['node_modules/**', 'examples/**', 'eslint.config.mjs'] },
  eslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  eslintConfigPrettier,
  eslintPluginPrettier,
];
