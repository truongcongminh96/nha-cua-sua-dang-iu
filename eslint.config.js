import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
export default ts.config(
  { ignores: ['dist/**', 'node_modules/**', 'output/**', '.playwright-cli/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  // Preserve the house's journal reference assigned after its Discovery callback is created.
  { files: ['src/app.ts'], rules: { 'prefer-const': 'off' } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } }, rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }] } },
);
