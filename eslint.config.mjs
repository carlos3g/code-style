// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default [
  { ignores: ['node_modules/**', 'eslint.config.mjs'] },
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
