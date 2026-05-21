// @ts-check
import tseslint from 'typescript-eslint';
import base from './base.mjs';
import jestPreset from './jest.mjs';
import prettierPreset from './prettier.mjs';

/**
 * NestJS API preset. Self-contained — includes base, jest layer for spec files
 * and Prettier integration.
 */
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'generated/**', 'eslint.config.mjs'] },
  ...base,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'error',
      // NestJS modules are intentionally empty `@Module()`-decorated classes —
      // the decorator is the reason the class exists, so it is not extraneous.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allowSingleOrDouble',
        },
      ],
    },
  },
  ...jestPreset,
  ...prettierPreset
);
