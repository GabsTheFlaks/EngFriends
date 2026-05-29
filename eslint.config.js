import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        crypto: 'readonly',
        URL: 'readonly',
        Notification: 'readonly',
        fetch: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Image: 'readonly',
        alert: 'readonly',
        Event: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLDivElement: 'readonly',
        MouseEvent: 'readonly',
        Node: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // React Hooks — regra principal do code review
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Qualidade geral
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-unused-vars': 'off', // desligado em favor do @typescript-eslint/no-unused-vars
    },
  },
  {
    // Ignora arquivos de build e node_modules
    ignores: ['dist/**', 'node_modules/**', 'worker/**', '*.py'],
  },
];
