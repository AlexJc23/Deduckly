const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require('typescript'), React = require('react'), server = require('react-dom/server'), native = require('react-native-web');
let width = 320, dark = false, tracking = false;
let token, step, failure, active, accountId, calls, afterAccount, storageFailure;
const jwt = (id, type = 'access') => `x.${Buffer.from(JSON.stringify({ sub: String(id), type, exp: 1 })).toString('base64url')}.x`;
function reset() { token = jwt(1); step = 4; failure = null; active = true; accountId = 1; calls = 0; afterAccount = null; storageFailure = false; }
const original = Module._load;
Module._load = function(id, parent, main) {
  if (id === '@/features/auth/services/auth-service.service') return {
    getAccessToken: async () => token,
    invalidateSessionForToken: async expected => { if (token === expected) token = null; },
  };
  if (id === '@/features/auth/api/auth.api') return { getCurrentUser: async () => {
    calls++; if (afterAccount) afterAccount(); if (failure) throw failure; return { id: accountId, is_active: active };
  } };
  if (id === './onboarding.service' && parent.filename.endsWith('app-access.service.ts')) return {
    getOnboardingStep: async () => { if (storageFailure) throw Error('Storage unavailable'); return step; },
  };
  if (id === '@react-native-async-storage/async-storage') return { getItem: async () => null, setItem: async () => {} };
  if (id === 'react-native') return { ...native, useWindowDimensions: () => ({ width, height: 780, scale: 1, fontScale: 1 }) };
  if (id === '@/theme/theme' || (id === './theme' && parent.filename.includes('/theme/'))) return { useAppTheme: () => ({ dark }) };
  if (id === 'react-native-safe-area-context') return { SafeAreaView: native.View };
  if (id === 'expo-router') return { router: { push() {} } };
  if (id === '@/theme/icons') return { Ionicons: () => null };
  if (id === '@/features/tracking/context/tracking.context') return { useTracking: () => ({ isTracking: tracking, isReady: true, distanceMiles: 12.34, trackingNotice: null }) };
  if (id === '@/features/tracking/components/StartTripModal') return { StartTripModal: () => null };
  if (id.startsWith('@/')) id = path.join(root, 'src', id.slice(2));
  return original.call(this, id, parent, main);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText, file);
const { resolveAppAccess, OfflineSetupRequired } = require('../src/features/onboarding/services/app-access.service.ts');
let checks = 0;
async function test(name, fn) { reset(); await fn(); checks++; console.log(`PASS ${name}`); }
(async () => {
  await test('returning user can enter offline with an expired stored access token and no API call', async () => {
    assert.equal(await resolveAppAccess(true), 'offline'); assert.equal(calls, 0);
  });
  await test('no session or a temporary 2FA token cannot enter offline', async () => {
    token = null; assert.equal(await resolveAppAccess(true), 'login'); token = jwt(1, '2fa'); assert.equal(await resolveAppAccess(true), 'login');
  });
  await test('unfinished or absent setup requires connection', async () => {
    for (step of [0, 1, 2, 3]) await assert.rejects(resolveAppAccess(true), OfflineSetupRequired);
    assert.equal(calls, 0);
  });
  await test('completed setup for another account cannot unlock the current account', async () => {
    token = jwt(2); step = 0; await assert.rejects(resolveAppAccess(true), OfflineSetupRequired);
  });
  await test('online verified account reaches the regular app or onboarding', async () => {
    assert.equal(await resolveAppAccess(false), 'ready'); step = 2; assert.equal(await resolveAppAccess(false), 'onboarding');
  });
  await test('timeout and server outage allow only a previously completed account offline', async () => {
    for (failure of [{ isAxiosError: true, code: 'ECONNABORTED' }, { isAxiosError: true, response: { status: 503 } }]) {
      step = 4; assert.equal(await resolveAppAccess(false), 'offline'); step = 0; await assert.rejects(resolveAppAccess(false), OfflineSetupRequired);
    }
  });
  await test('401, 403, and deleted accounts invalidate the session instead of using cached access', async () => {
    for (const status of [401, 403, 404]) {
      token = jwt(1); failure = { isAxiosError: true, response: { status } };
      assert.equal(await resolveAppAccess(false), 'login'); assert.equal(token, null); assert.equal(await resolveAppAccess(true), 'login');
    }
  });
  await test('inactive and mismatched accounts never use cached entry', async () => {
    active = false; assert.equal(await resolveAppAccess(false), 'login');
    token = jwt(1); active = true; accountId = 2; assert.equal(await resolveAppAccess(false), 'login');
  });
  await test('a session switch while an account request is pending is ignored', async () => {
    afterAccount = () => { token = jwt(2); }; assert.equal(await resolveAppAccess(false), 'stale'); assert.equal(token, jwt(2));
  });
  await test('storage failure and unexpected server errors do not silently grant offline access', async () => {
    storageFailure = true; await assert.rejects(resolveAppAccess(true), OfflineSetupRequired);
    storageFailure = false; failure = Error('Unexpected data'); await assert.rejects(resolveAppAccess(false));
  });
  const { OfflineTripAccess } = require('../src/features/onboarding/components/offline-trip-access.tsx');
  const { setRuntimeLanguage } = require('../src/i18n/core.ts');
  const output = '/tmp/deduckly-offline-qa'; fs.mkdirSync(output, { recursive: true });
  let renders = 0;
  for (const lang of ['en', 'es']) for (dark of [false, true]) for (width of [320, 390, 1024]) for (tracking of [false, true]) {
    setRuntimeLanguage(lang);
    const body = server.renderToStaticMarkup(React.createElement(OfflineTripAccess, { onRetry() {}, checking: false }));
    assert.ok(body.includes(lang === 'en' ? 'Offline access' : 'Acceso sin conexión'));
    if (tracking) assert.ok(body.includes('12.34'));
    assert.ok(body.includes(lang === 'en' ? 'Try reconnecting' : 'Volver a conectar'));
    fs.writeFileSync(`${output}/${lang}-${dark ? 'dark' : 'light'}-${width}-${tracking ? 'active' : 'start'}.html`,
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}${native.StyleSheet.getSheet().textContent}</style><main style="width:${width}px;max-width:100%;margin:auto">${body}</main>`);
    renders++;
  }
  console.log(`${checks} offline access checks and ${renders} phone/tablet language/theme renders passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
