/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const root = path.resolve(__dirname, '..');
const ts = require('typescript');
const React = require('react');
const server = require('react-dom/server');
let dimensions = { width: 390, height: 844, scale: 3, fontScale: 1 };
let insets = { top: 47, right: 0, bottom: 34, left: 0 };
let options;
const original = Module._load;
const Tabs = ({ children, screenOptions }) => {
  options = screenOptions;
  return React.createElement('main', {}, children);
};
Tabs.Screen = function Route({ name }) { return React.createElement('span', {}, name); };
Module._load = function(id, parent, main) {
  if (id === 'react-native') return { View: 'div', useWindowDimensions: () => dimensions, StyleSheet: { create: s => s } };
  if (id === 'react-native-safe-area-context') return { useSafeAreaInsets: () => insets };
  if (id === 'expo-router') return { Tabs };
  if (id === '@/i18n/language') return { useLanguage: () => ({ t: s => s }) };
  if (id === '@/theme/theme') return { useAppTheme: () => ({ dark: false }) };
  if (id === '@/theme/components') return { themedStyle: s => s };
  if (id === '@/theme/icons') return { Ionicons: () => null };
  if (id === '@/features/onboarding/components/onboarding-gate') return { OnboardingGate: ({ children }) => children };
  if (id.startsWith('@/')) id = path.join(root, 'src', id.slice(2));
  return original.call(this, id, parent, main);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText, file);
const { adaptiveLayout, tabBarPosition, bottomTabMetrics, sidebarTabItemHeight } = require(root + '/src/hooks/adaptive-layout.ts');
// The native hook inputs are plain functions in this deterministic harness.
const { useAdaptiveLayout: readLayout } = require(root + '/src/hooks/use-adaptive-layout.ts');
const { useIsTablet: readTabletHint } = require(root + '/src/hooks/use-is-tablet.ts');
const Screen = require(root + '/app/(tabs)/_layout.tsx').default;
const zero = { top: 0, right: 0, bottom: 0, left: 0 };
const matrix = [
  ['phone portrait', 390, 844, 'bottom'], ['phone landscape', 844, 390, 'bottom'],
  ['compact portrait', 466, 678, 'bottom'], ['compact landscape', 678, 466, 'bottom'],
  ['expanded portrait', 669, 951, 'bottom'], ['expanded landscape', 951, 669, 'left'],
  ['iPad portrait', 768, 1024, 'left'], ['iPad landscape', 1024, 768, 'left'],
];
for (const [name, width, height, position] of matrix) {
  dimensions = { ...dimensions, width, height };
  insets = zero;
  const live = readLayout();
  assert.equal(tabBarPosition(live), position, name);
  assert.equal(readTabletHint(), width >= 768, 'Existing screen width hints retain their breakpoint');
  assert.equal(live.orientation, width > height ? 'landscape' : 'portrait');
  const html = server.renderToStaticMarkup(React.createElement(Screen));
  for (const route of ['dashboard', 'activity', 'reports', 'settings']) assert(html.includes(route), name);
  assert.equal(options.tabBarPosition, position, name);
  assert.equal(options.tabBarHideOnKeyboard, false, 'Keyboard transition state must not hide navigation');
}
dimensions = { ...dimensions, width: 951, height: 669, fontScale: 2 };
insets = { top: 12, right: 64, bottom: 21, left: 9 };
const safe = readLayout();
assert.equal(safe.availableWidth, 878);
assert.equal(safe.availableHeight, 636);
assert.equal(safe.fontScale, 2);
assert.equal(safe.insets, insets);
assert.equal(adaptiveLayout(100, 100, { top: 80, bottom: 80, left: 80, right: 80 }).availableWidth, 0);
assert.equal(tabBarPosition(adaptiveLayout(1200, 300)), 'bottom', 'Wide short windows must retain reachable navigation');
assert.equal(tabBarPosition(adaptiveLayout(800, 800, { ...zero, right: 80 })), 'bottom', 'Reserved edge space affects usable width');
assert.equal(tabBarPosition(adaptiveLayout(1000, 500), 8), 'bottom', 'Large labels must not push sidebar destinations off screen');
assert.equal(sidebarTabItemHeight(1), 56, 'Existing default sidebar proportions are preserved');
assert(sidebarTabItemHeight(3) >= 14 * 3 + 24);
for (const bottom of [0, 10, 21, 34, 64]) for (const fontScale of [1, 1.3, 2, 3]) {
  const metrics = bottomTabMetrics(bottom, fontScale);
  assert(metrics.paddingBottom >= bottom);
  assert(metrics.height - metrics.paddingTop - metrics.paddingBottom >= 44);
}
console.log('PASS 8 layout configurations, runtime dimensions/insets/font-scale updates, legacy width compatibility, short-window navigation, safe tab-bar sizing, and keyboard visibility policy.');

const { dashboardUsesColumns, contentNeedsScrolling } = require(root + '/src/hooks/adaptive-layout.ts');
for (const [width, height, scale, expected] of [
  [390, 760, 1, false], [620, 340, 1, true], [951, 560, 1, true],
  [669, 820, 1, true], [768, 940, 1, true], [1024, 680, 1, true],
  [951, 260, 1, false], [951, 560, 2, false],
]) assert.equal(dashboardUsesColumns(width, height, scale), expected);
assert.equal(contentNeedsScrolling(600, 600), false);
assert.equal(contentNeedsScrolling(600.5, 600), false);
assert.equal(contentNeedsScrolling(660, 600), true);
assert.equal(contentNeedsScrolling(600, 700), false);
console.log('PASS dashboard responsive columns and measured accessibility overflow.');
