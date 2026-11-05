module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['plugin:react/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['react', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
    react/react-in-jsx-scope: 'off',
  },
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
};