// @ts-check
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import base from './base.mjs';
import prettierPreset from './prettier.mjs';

/**
 * React preset (web). Self-contained — base + react + react-hooks + prettier.
 * For React Native/Expo, use the `expo` preset instead.
 */
export default tseslint.config(
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
  ...prettierPreset
);
