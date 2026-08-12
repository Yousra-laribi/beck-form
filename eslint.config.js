const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'init/**',
      'coverage/**',
      'tests/fixtures/**',
    ],
  },
];
