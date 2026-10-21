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
// Evaluate the two DEBUG branches separately: production remains scene-first;
// development follows SDK 54's documented launcher initialization order.
function configured(debug) {
  let include = true;
  return source.split('\n').filter(line => {
    if (line.trim() === '#if DEBUG') { include = debug; return false; }
    if (line.trim() === '#else') { include = !include; return false; }
    if (line.trim() === '#endif') { include = true; return false; }
    return include;
  }).join('\n');
}
const release = configured(false), debug = configured(true);
assert(!release.includes('UIWindow(frame:'));
assert.equal((release.match(/startReactNative\(/g) || []).length, 1);
assert(release.indexOf('startReactNative(') > release.indexOf('class SceneDelegate'));
const prepare = debug.indexOf('factory.startReactNative(');
const subscribers = debug.indexOf('return super.application(application, didFinishLaunchingWithOptions: launchOptions)');
assert(prepare > debug.indexOf('window = developmentWindow') && prepare < subscribers);
assert(debug.includes('existingWindow.windowScene = windowScene'));
assert(debug.includes('window = existingWindow'));
const reuse = debug.indexOf('if let existingWindow = app.window');
const reusedReturn = debug.indexOf('return\n    }', reuse);
assert(reusedReturn > reuse && reusedReturn < debug.indexOf('let sceneWindow = UIWindow'));
assert.equal((debug.match(/UIWindow\(frame:/g) || []).length, 1);
assert(!source.includes('ExpoAppDelegateSubscriberRepository')); // Never replay or bypass subscribers.

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
