/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'ios/frontend/AppDelegate.swift'), 'utf8');
const plist = JSON.parse(execFileSync('plutil', ['-convert', 'json', '-o', '-', path.join(root, 'ios/frontend/Info.plist')], { encoding: 'utf8' }));
const manifest = plist.UIApplicationSceneManifest;
assert.equal(manifest.UIApplicationSupportsMultipleScenes, false);
const configs = manifest.UISceneConfigurations.UIWindowSceneSessionRoleApplication;
assert.equal(configs.length, 1);
assert.equal(configs[0].UISceneClassName, 'UIWindowScene');
assert.equal(configs[0].UISceneDelegateClassName, '$(PRODUCT_MODULE_NAME).SceneDelegate');
assert(!configs[0].UISceneStoryboardFile);
assert(source.includes('UIWindow(windowScene: windowScene)'));
assert(!source.includes('UIWindow(frame:'));
assert.equal((source.match(/startReactNative\(/g) || []).length, 1);
assert(source.includes('return super.application(application, didFinishLaunchingWithOptions: launchOptions)'));
assert(source.includes('bindReactNativeFactory(factory)'));
assert(source.includes('DeducklyShortcuts.updateAppShortcutParameters()'));
for (const [scene, app] of [['sceneDidBecomeActive', 'applicationDidBecomeActive'], ['sceneWillResignActive', 'applicationWillResignActive'], ['sceneDidEnterBackground', 'applicationDidEnterBackground'], ['sceneWillEnterForeground', 'applicationWillEnterForeground']]) {
  assert(source.includes(`func ${scene}(_ scene: UIScene) { appDelegate?.${app}(UIApplication.shared) }`));
}
assert(!source.includes('NotificationCenter.default.post'));
assert(source.includes('options[.url] = context.url'));
assert(source.includes('options[.userActivityDictionary]'));
assert(source.includes('func scene(_ scene: UIScene, openURLContexts'));
assert(source.includes('func scene(_ scene: UIScene, continue userActivity:'));
assert(source.includes('if let existingWindow = app.window'));
assert(plist.UIBackgroundModes.includes('location'));
console.log('PASS scene wiring: one window/runtime, cold/warm links, Expo callbacks, no synthetic notifications, background mode preserved');
