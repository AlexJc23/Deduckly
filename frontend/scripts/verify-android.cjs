// Native integrations are mocked; this verifies platform boundaries, not device GPS.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const ts = require(require.resolve('typescript', { paths: [root] }));
function load(file, mocks = {}) {
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  new Function('require', 'module', 'exports', code)(name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith('./') || name.startsWith('../') || name.startsWith('@/')) {
      const target = name.startsWith('@/') ? path.join('src', name.slice(2)) : path.join(path.dirname(file), name);
      return load(target + '.ts', mocks);
    }
    return require(require.resolve(name, { paths: [root] }));
  }, module, module.exports);
  return module.exports;
}
let count = 0;
async function test(name, run) { await run(); count++; console.log('PASS ' + name); }
(async () => {
  await test('non-Android Expo config is identical to the starting commit', () => {
    const before = JSON.parse(cp.execFileSync('git', ['show', 'b09b933:frontend/app.json'], { cwd: root })).expo;
    const after = JSON.parse(fs.readFileSync(path.join(root, 'app.json'))).expo;
    delete before.android; delete after.android; assert.deepEqual(after, before);
  });
  await test('iOS changes are limited to the authorized Apple resubmission metadata', () => {
    const before = file => cp.execFileSync('git', ['show', 'b09b933:frontend/' + file], { cwd: root, encoding: 'utf8' });
    const changed = cp.execFileSync('git', ['diff', '--name-only', 'b09b933', '--', 'frontend/ios'], { cwd: path.dirname(root), encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    assert.deepEqual(changed.sort(), ['frontend/ios/frontend.xcodeproj/project.pbxproj', 'frontend/ios/frontend/Info.plist'].sort());
    const project = 'ios/frontend.xcodeproj/project.pbxproj';
    assert.equal(fs.readFileSync(path.join(root, project), 'utf8'), before(project).replaceAll('CURRENT_PROJECT_VERSION = 9;', 'CURRENT_PROJECT_VERSION = 36;'));
    const plist = file => JSON.parse(cp.execFileSync('plutil', ['-convert', 'json', '-o', '-', file], { encoding: 'utf8' }));
    const os = require('node:os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'deduckly-permissions-'));
    try {
      const original = path.join(dir, 'Info.plist');
      fs.writeFileSync(original, before('ios/frontend/Info.plist'));
      const expected = plist(original);
      delete expected.NSMicrophoneUsageDescription;
      delete expected.NSFaceIDUsageDescription;
      expected.CFBundleShortVersionString = '$(MARKETING_VERSION)';
      assert.deepEqual(plist(path.join(root, 'ios/frontend/Info.plist')), expected);
    } finally { fs.rmSync(dir, { recursive: true }); }
  });
  await test('iOS date field re-exports the identical native component', () => {
    const native = () => null;
    assert.equal(load('src/components/ui/DateField.tsx', { '@react-native-community/datetimepicker': native }).default, native);
  });
  await test('icon data moved unchanged out of the route tree', () => {
    assert.equal(fs.existsSync(path.join(root, 'app/constants/platform-icons.ts')), false);
    const original = cp.execFileSync('git', ['show', 'b09b933:frontend/app/constants/platform-icons.ts'], { cwd: root, encoding: 'utf8' });
    assert.equal(fs.readFileSync(path.join(root, 'src/constants/platform-icons.ts'), 'utf8'), original);
  });
  await test('Android date dialogs open only on tap, ignore cancellation and retain date bounds', () => {
    let options, opens = 0, updates = 0, cleanup;
    const minimumDate = new Date(2026, 0, 1), maximumDate = new Date(2026, 11, 31);
    const DateField = load('src/components/ui/DateField.android.tsx', {
      react: { useRef: value => ({ current: value }), useEffect: callback => { cleanup = callback(); } },
      '@/theme/components': { Pressable: 'Pressable', Text: 'Text' },
      '@/i18n/language': { useLanguage: () => ({ t: text => text }) },
      '@react-native-community/datetimepicker': { DateTimePickerAndroid: {
        open(value) { options = value; opens++; }, async dismiss() {},
      } },
    }).default;
    const field = DateField({ value: new Date(2026, 8, 11), minimumDate, maximumDate, onChange: () => { updates++; } });
    assert.equal(opens, 0); field.props.onPress(); field.props.onPress(); assert.equal(opens, 1);
    assert.equal(options.minimumDate, minimumDate); assert.equal(options.maximumDate, maximumDate);
    options.onChange({ type: 'dismissed' }, new Date()); assert.equal(updates, 0);
    field.props.onPress(); assert.equal(opens, 2);
    options.onChange({ type: 'set' }, new Date()); assert.equal(updates, 1);
    cleanup();
  });
  await test('Android billing never calls the SDK without its own key', async () => {
    const old = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
    delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
    let called = false;
    try {
      const { revenueCatService: service } = load('src/features/subscriptions/services/revenuecat.service.android.ts', {
        'react-native-purchases': { configure() { called = true; } },
      });
      for (const action of [() => service.configure(), () => service.logIn('test'), () => service.getOfferings(), () => service.restorePurchases()]) {
        await assert.rejects(action(), /not configured|not ready/);
      }
      assert.equal(called, false);
    } finally {
      if (old === undefined) delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
      else process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = old;
    }
  });
  await test('Android channel precedes permission request and token registration', async () => {
    const calls = [];
    const service = load('src/services/notifications.android.ts', {
      'expo-constants': { expoConfig: { extra: { eas: { projectId: 'test-project' } } } },
      'expo-notifications': {
        setNotificationHandler() {}, AndroidImportance: { DEFAULT: 3 },
        async setNotificationChannelAsync(id) { calls.push('channel:' + id); },
        async getPermissionsAsync() { calls.push('permission'); return { status: 'undetermined' }; },
        async requestPermissionsAsync() { calls.push('request'); return { status: 'granted' }; },
        async getExpoPushTokenAsync(options) { assert.equal(options.projectId, 'test-project'); calls.push('token'); return { data: 'test-token' }; },
      },
      '@/api/notification': { async savePushToken() { calls.push('save'); } },
    });
    await service.registerForPushNotifications();
    assert.deepEqual(calls, ['channel:default', 'permission', 'request', 'token', 'save']);
  });
  await test('notification opt-out clears registration without prompting', async () => {
    let saved = 'unchanged';
    const service = load('src/services/notifications.android.ts', {
      'expo-constants': {},
      'expo-notifications': {
        setNotificationHandler() {}, AndroidImportance: { DEFAULT: 3 }, async setNotificationChannelAsync() {},
        async getPermissionsAsync() { return { granted: false }; },
        requestPermissionsAsync() { assert.fail('must not prompt on foreground'); },
        getExpoPushTokenAsync() { assert.fail('must not register without permission'); },
      },
      '@/api/notification': { async savePushToken(value) { saved = value; } },
    });
    await service.syncNotificationRegistration(); assert.equal(saved, null);
  });
  await test('Android manifest config has required tracking declarations and blocks broad media/audio', () => {
    const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json'))).expo.android;
    for (const permission of ['ACCESS_BACKGROUND_LOCATION', 'FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_LOCATION', 'POST_NOTIFICATIONS']) {
      assert(config.permissions.includes('android.permission.' + permission));
    }
    for (const permission of ['RECORD_AUDIO', 'READ_MEDIA_IMAGES', 'READ_MEDIA_VIDEO', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE']) {
      assert(config.blockedPermissions.includes('android.permission.' + permission));
    }
  });
  await test('income submission waits on Android, preserves edit dates, and retains iOS behavior', () => {
    function nodes(node) {
      if (!node || typeof node !== 'object') return [];
      return [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)];
    }
    for (const platform of ['android', 'ios']) {
      let back = 0, submitted, changed, index = 0;
      const states = ['12.50', 'gig_platform', 'doordash', '', ''];
      const { IncomeForm } = load('src/features/income/components/IncomeForm.tsx', {
        react: { useState: () => [states[index++], value => { changed = value; }], useEffect() {} },
        'react-native': { Platform: { OS: platform }, StyleSheet: { create: value => value } },
        'expo-router': { router: { back() { back++; } } },
        '@/i18n/language': { useLanguage() {}, Translated: 'Translated' },
        '@/theme/components': Object.fromEntries(['Pressable', 'ScrollView', 'Text', 'TextInput', 'View'].map(x => [x, x])),
      });
      const date = '2025-03-01T12:00:00Z';
      const tree = nodes(IncomeForm({ initialValues: { received_at: date }, onSubmit: value => { submitted = value; } }));
      tree.filter(x => x.type === 'Pressable').at(-1).props.onPress();
      assert.equal(submitted.amount, 12.5);
      assert.equal(back, platform === 'android' ? 0 : 1);
      if (platform === 'android') assert.equal(submitted.received_at, date);
      else assert.notEqual(submitted.received_at, date);
      tree.find(x => x.type === 'TextInput').props.onChangeText('12,50');
      assert.equal(changed, platform === 'android' ? '12.50' : '12,50');
    }
  });
  await test('exports preserve bytes and MIME type using app cache and the share API', async () => {
    const calls = [];
    const { saveFile } = load('src/features/reports/utils/save-file.ts', {
      'expo-file-system/legacy': { cacheDirectory: 'file:///cache/', EncodingType: { Base64: 'base64' },
        async writeAsStringAsync(...args) { calls.push(args); } },
      'expo-sharing': { async shareAsync(...args) { calls.push(args); } },
    });
    await saveFile(new Uint8Array([0, 1, 255]).buffer, 'report.pdf', 'application/pdf');
    assert.deepEqual(calls, [
      ['file:///cache/report.pdf', 'AAH/', { encoding: 'base64' }],
      ['file:///cache/report.pdf', { mimeType: 'application/pdf', dialogTitle: 'Export Report' }],
    ]);
  });
  console.log(`${count} Android compatibility checks passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
