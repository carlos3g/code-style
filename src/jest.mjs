// @ts-check
import jest from 'eslint-plugin-jest';

/**
 * Jest add-on for spec/e2e files. Composable — spread alongside a stack preset.
 */
export default [
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.e2e-spec.ts', 'test/**/*', '__tests__/**/*'],
    ...jest.configs['flat/recommended'],
    ...jest.configs['flat/style'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      ...jest.configs['flat/style'].rules,
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error',
    },
  },
];
