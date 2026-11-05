// ESLint configuration for AEGIS GRC (ESLint v10+ flat config - CommonJS)
const tseslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');

module.exports = [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser,
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'warn',
    },
  },
];