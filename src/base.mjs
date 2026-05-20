// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * Base TypeScript preset.
 *
 * Use as the foundation for any TS project. Stack-specific presets
 * (nest, expo, react) already include this — no need to compose manually.
 */
export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.strictTypeChecked, {
  languageOptions: {
    globals: {
      ...globals.node,
    },
    parserOptions: {
      projectService: true,
      tsconfigRootDir: process.cwd(),
    },
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-useless-constructor': 'off',
  },
});
