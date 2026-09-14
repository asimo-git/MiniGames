import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist/**', 'dist-ssr/**', 'node_modules/**'],
  },

  js.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],

    extends: [tseslint.configs.recommended, unicorn.configs.recommended],

    linterOptions: {
      noInlineConfig: true,
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  eslintConfigPrettier,
]);
