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
let renderBar;
let modalProps;
const original = Module._load;
const Tabs = ({ children, screenOptions, tabBar }) => {
  options = screenOptions;
  renderBar = tabBar;
  return React.createElement('main', {}, children);
};
Tabs.Screen = function Route({ name }) { return React.createElement('span', {}, name); };
Module._load = function(id, parent, main) {
  if (id === 'react-native') return { Platform: { OS: 'ios' }, Modal: props => { modalProps = props; return null; }, View: 'div', useWindowDimensions: () => dimensions, StyleSheet: { create: s => s } };
  if (id === 'react-native-safe-area-context') return { useSafeAreaInsets: () => insets };
  if (id === 'expo-router') return { Tabs };
  if (id === 'expo-router/js-tabs') return { BottomTabBar: () => null, BottomTabBarHeightCallbackContext: React.createContext(undefined) };
  if (id === '@/i18n/language') return { useLanguage: () => ({ t: s => s }) };
  if (id === '@/theme/theme') return { useAppTheme: () => ({ dark: false }) };
  if (id === '@/theme/components') return { themedStyle: s => s, View: ({ children }) => React.createElement('div', {}, children), Text: ({ children }) => React.createElement('span', {}, children), Pressable: ({ children, accessibilityState, accessibilityLabel }) => React.createElement('button', { 'aria-label': accessibilityLabel, 'aria-selected': accessibilityState.selected }, children) };
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
  ['expanded portrait', 669, 951, 'bottom'], ['expanded landscape', 951, 669, 'bottom'],
  ['iPad portrait', 768, 1024, 'bottom'], ['iPad landscape', 1024, 768, 'bottom'],
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
assert.equal(tabBarPosition(adaptiveLayout(1200, 850)), 'left');
assert.equal(sidebarTabItemHeight(1), 56, 'Existing default sidebar proportions are preserved');
assert(sidebarTabItemHeight(3) >= 14 * 3 + 24);
const foldedLandscape = adaptiveLayout(678, 466, { top: 0, bottom: 0, left: 80, right: 0 });
const compactTabs = bottomTabMetrics(foldedLandscape, 1);
const portraitTabs = bottomTabMetrics(adaptiveLayout(466, 678, zero), 1);
assert.equal(compactTabs.labelPosition, 'beside-icon');
assert.equal(portraitTabs.labelPosition, 'below-icon');
assert(compactTabs.style.height < portraitTabs.style.height);
assert(compactTabs.iconSize < portraitTabs.iconSize);
assert.equal(compactTabs.style.paddingLeft - compactTabs.style.paddingRight, 80);
assert.equal(bottomTabMetrics(foldedLandscape, 2).labelPosition, 'below-icon');
for (const bottom of [0, 10, 21, 34, 64]) for (const fontScale of [1, 1.3, 2, 3]) {
  const { style } = bottomTabMetrics(adaptiveLayout(678, 466, { ...zero, bottom }), fontScale);
  assert(style.paddingBottom >= bottom);
  assert(style.height - style.paddingTop - style.paddingBottom >= 44);
}
console.log('PASS 8 layout configurations, runtime dimensions/insets/font-scale updates, legacy width compatibility, short-window navigation, safe tab-bar sizing, and keyboard visibility policy.');

const { dashboardUsesColumns, usesBookSpread } = require(root + '/src/hooks/adaptive-layout.ts');
for (const [width, height, scale, expected] of [
  [390, 760, 1, false], [620, 340, 1, true], [951, 560, 1, true],
  [669, 820, 1, false], [768, 940, 1, false], [1024, 680, 1, true],
  [520, 220, 1, true], [519, 220, 1, false], [951, 219, 1, false], [951, 560, 2, false],
]) assert.equal(dashboardUsesColumns(width, height, scale), expected);
assert(usesBookSpread(850, 550, 1));
assert(!usesBookSpread(650, 350, 1));
assert(!usesBookSpread(740, 900, 1));
assert(!usesBookSpread(850, 550, 2));
console.log('PASS dashboard columns and book-style layout by available width, height and font scale.');

dimensions = { width: 678, height: 466, scale: 3, fontScale: 1 };
insets = { ...zero, left: 80, bottom: 34 };
server.renderToStaticMarkup(React.createElement(Screen));
const routes = ['Dashboard', 'Activity', 'Reports', 'Settings'].map(name => ({ name, key: name }));
const html = server.renderToStaticMarkup(renderBar({
  state: { index: 1, routes },
  descriptors: Object.fromEntries(routes.map(route => [route.key, { options: { title: route.name } }])),
}));
for (const route of routes) assert(html.includes(`aria-label="${route.name}"`));
assert(html.includes('aria-label="Activity" aria-selected="true"'));
console.log('PASS compact iOS tab row renders all destinations and preserves the selected tab.');

const { AdaptiveModal } = require(root + '/src/components/ui/AdaptiveModal.tsx');
const onRequestClose = () => {};
server.renderToStaticMarkup(React.createElement(AdaptiveModal, { visible: true, transparent: true, onRequestClose }));
assert.deepEqual(modalProps.supportedOrientations, ['portrait', 'portrait-upside-down', 'landscape-left', 'landscape-right']);
assert.equal(modalProps.transparent, true);
assert.equal(modalProps.onRequestClose, onRequestClose);
console.log('PASS native modals allow both landscape orientations without changing their dismissal behavior.');
