// @ts-check
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

/**
 * Prettier integration. Always spread last so it disables conflicting rules.
 */
export default [eslintConfigPrettier, eslintPluginPrettier];
