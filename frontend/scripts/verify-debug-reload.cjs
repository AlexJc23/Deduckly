/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const auxiliary = path.join(root, 'node_modules/expo/src/async-require/messageSocket.native.ts');
function configuration(version = '54.0.37', rsc = false, custom = false) {
  let delegated = 0;
  const resolve = (_context, name) => { delegated++; return { type: 'sourceFile', filePath: name }; };
  const requireMock = name => {
    if (name === 'node:path') return path;
    if (name === 'expo/metro-config') return { getDefaultConfig: () => ({transformer: {}, resolver: { assetExts: ['svg', 'png'], sourceExts: ['ts', 'tsx'], ...(custom ? {resolveRequest: resolve} : {}) }}) };
    if (name === 'expo/package.json') return {version};
    if (name === './app.json') return {expo: {experiments: {reactServerComponentRoutes: rsc}}};
    throw Error('Unexpected dependency: ' + name);
  };
  requireMock.resolve = name => name === 'expo/package.json' ? path.join(root, 'node_modules/expo/package.json') : name;
  const sandbox = {require: requireMock, module: {exports: {}}, __dirname: root};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'metro.config.js'), 'utf8'), sandbox);
  return {config: sandbox.module.exports, context: dev => ({dev, resolveRequest: resolve}), count: () => delegated};
}
for (const custom of [false, true]) {
  const c = configuration('54.0.37', false, custom);
  assert.equal(c.config.resolver.resolveRequest(c.context(true), auxiliary, 'ios').type, 'empty');
  assert.equal(c.count(), 1, 'Default/custom resolver is called once');
  for (const platform of ['ios', 'android', 'web']) for (const dev of [true, false]) {
    const result = c.config.resolver.resolveRequest(c.context(dev), auxiliary, platform);
    assert.equal(result.type, platform === 'ios' && dev ? 'empty' : 'sourceFile');
  }
  for (const file of ['app-socket.ts', 'setupFastRefresh.ts', 'asset.svg']) {
    assert.equal(c.config.resolver.resolveRequest(c.context(true), file, 'ios').filePath, file);
  }
  assert(c.config.resolver.assetExts.includes('png'));
  assert(!c.config.resolver.assetExts.includes('svg'));
  assert(c.config.resolver.sourceExts.includes('svg'));
}
for (const [version, rsc] of [['55.0.0', false], ['54.0.37', true]]) {
  const c = configuration(version, rsc);
  assert.equal(c.config.resolver.resolveRequest(c.context(true), auxiliary, 'ios').type, 'sourceFile');
}
console.log('PASS Debug reload scope: only SDK 54 iOS development auxiliary socket omitted; Release, Android, web, RSC, regular sockets, HMR and SVG resolution preserved.');
