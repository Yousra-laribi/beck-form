/**
 * Two projects, because the tests have two very different needs.
 *
 * `node`   — pure logic: the harness itself, i18n parity, date formatting,
 *            SQL round-trips through node:sqlite. Plain Node, no React Native
 *            module graph, no mocks.
 * `native` — components: rendering, reduced-motion final states, theming.
 *            Needs the jest-expo preset.
 */
const nodeTransform = {
  '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
};

module.exports = {
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/node/**/*.test.ts'],
      transform: nodeTransform,
    },
    {
      displayName: 'native',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/tests/native/**/*.test.tsx'],
    },
  ],
};
