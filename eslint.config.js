const { defineConfig, globalIgnores } = require('eslint/config');

const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  globalIgnores(['dist/**', 'coverage/**', '.expo/**']),

  expoConfig,

  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-debugger': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  prettierConfig,
]);
