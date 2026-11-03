/* global __dirname */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'ios/frontend/AppDelegate.swift'),'utf8');
const scene=fs.readFileSync(path.join(root,'node_modules/expo/ios/Expo/ExpoAppSceneDelegate.swift'),'utf8');
const plist=JSON.parse(execFileSync('plutil',['-convert','json','-o','-',path.join(root,'ios/frontend/Info.plist')],{encoding:'utf8'}));
const manifest=plist.UIApplicationSceneManifest;
assert.equal(manifest.UIApplicationSupportsMultipleScenes,false);
const configs=manifest.UISceneConfigurations.UIWindowSceneSessionRoleApplication;
assert.equal(configs.length,1);
assert.equal(configs[0].UISceneClassName,'UIWindowScene');
assert.equal(configs[0].UISceneDelegateClassName,'$(PRODUCT_MODULE_NAME).SceneDelegate');
assert(!configs[0].UISceneStoryboardFile);
assert(app.includes('AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider'));
assert(app.includes('class SceneDelegate: ExpoAppSceneDelegate {}'));
assert(app.includes('public var reactNativeFactory: RCTReactNativeFactory?'));
assert(app.includes('bindReactNativeFactory(factory)'));
assert(app.includes('DeducklyShortcuts.updateAppShortcutParameters()'));
assert(app.includes('return super.application(application, didFinishLaunchingWithOptions: launchOptions)'));
assert(!app.includes('startReactNative('),'Only the Expo scene should start React Native');
assert(!app.includes('UIWindow(frame:'));
assert(!app.includes('NotificationCenter.default.post'));
assert(scene.includes('UIWindow(windowScene: windowScene)'));
assert.equal((scene.match(/factory.startReactNative\(/g)||[]).length,1);
assert(scene.includes('provider.window = window'));
for(const callback of ['forwarder.open','forwarder.continue','forwarder.didBecomeActive','forwarder.didEnterBackground'])assert(scene.includes(callback));
assert(scene.includes('userActivity: browsingWebActivity'));
assert(plist.UIBackgroundModes.includes('location'));
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo.orientation,'default');
for(const orientation of ['Portrait','PortraitUpsideDown','LandscapeLeft','LandscapeRight']) {
  assert(plist.UISupportedInterfaceOrientations.includes('UIInterfaceOrientation'+orientation));
  assert(plist['UISupportedInterfaceOrientations~ipad'].includes('UIInterfaceOrientation'+orientation));
}
console.log('PASS SDK 58 scene wiring: Expo-owned single window/runtime, cold/warm links, lifecycle forwarding, Siri setup and background location preserved.');
console.log('PASS Expo/native phone and iPad orientation configuration stays aligned for runtime resizing.');
