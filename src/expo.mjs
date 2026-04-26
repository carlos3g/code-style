// @ts-check
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import base from './base.mjs';
import prettierPreset from './prettier.mjs';

/**
 * Expo / React Native preset. Self-contained — base + react + hooks +
 * tanstack-query + testing-library + Prettier.
 *
 * Files under `src/app/**\/*.tsx` are exempt from `function-component-definition`
 * because Expo Router enforces default exports for screens.
 */
export default tseslint.config(
  { ignores: ['node_modules/**', 'ios/**', 'android/**', '.expo/**', 'dist/**', 'eslint.config.mjs', '*.config.js'] },
  ...base,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      'react/style-prop-object': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/no-unused-prop-types': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  ...tanstackQuery.configs['flat/recommended'],
  {
    files: ['src/app/**/*.tsx'],
    rules: { 'react/function-component-definition': 'off' },
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    ...testingLibrary.configs['flat/react'],
  },
  ...prettierPreset
);
