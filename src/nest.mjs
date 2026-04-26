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
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'error',
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
