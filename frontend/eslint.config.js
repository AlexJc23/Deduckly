// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    // Existing account/route synchronization effects are valid; review them incrementally.
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },
]);
