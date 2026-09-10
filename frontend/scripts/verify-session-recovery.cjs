const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require(require.resolve('typescript', { paths: [root] }));
function harness() {
  const disk = new Map([['access_token', 'old-access'], ['refresh_token', 'old-refresh']]);
  const state = { refreshCalls: 0, invalidated: 0, retries: 0, failure: null, timeout: null };
  const cache = new Map();
  let request, response;
  const client = async () => { state.retries++; return { data: 'ok' }; };
  client.interceptors = { request: { use: fn => { request = fn; } }, response: { use: (_, fn) => { response = fn; } } };
  class AxiosError extends Error { constructor(message, code) { super(message); this.code = code; } }
  const axios = {
    AxiosError, create: () => client,
    post: async (_url, _body, config) => {
      state.refreshCalls++; state.timeout = config.timeout;
      await new Promise(resolve => setTimeout(resolve, 5));
      if (state.failure) throw state.failure;
      return { data: { access_token: 'new-access', refresh_token: 'new-refresh' } };
    },
  };
  const mocks = {
    axios,
    "@/features/tracking/services/background-tracking": { pauseRecording: async () => {} },
    '@/config/env': { ENV: { API_URL: 'https://example.invalid' } },
    'expo-secure-store': {
      getItemAsync: async key => disk.get(key) ?? null,
      setItemAsync: async (key, value) => { disk.set(key, value); },
      deleteItemAsync: async key => { disk.delete(key); },
    },
  };
  function load(spec, parent = root + '/index.js') {
    if (mocks[spec]) return mocks[spec];
    if (!spec.startsWith("@/") && !spec.startsWith(".")) return require(require.resolve(spec, { paths: [root] }));
    let filename = spec.startsWith('@/') ? path.join(root, 'src', spec.slice(2)) : path.resolve(path.dirname(parent), spec);
    if (!filename.endsWith('.ts')) filename += '.ts';
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} }; cache.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    } }).outputText;
    new Function('require', 'module', 'exports', code)(name => load(name, filename), module, module.exports);
    return module.exports;
  }
  const service = load('@/features/auth/services/auth-service.service');
  service.subscribeToSessionInvalidation(() => { state.invalidated++; });
  load('@/api/client');
  return { disk, state, service, unauthorized: (token = 'old-access', retry = false) => response({
    response: { status: 401 }, config: { headers: { Authorization: `Bearer ${token}` }, _retry: retry },
  }), request: config => request(config) };
}
let count = 0;
async function test(name, fn) { await fn(); count++; console.log(`PASS ${name}`); }
(async () => {
  await test('missing refresh token clears credentials and notifies the signed-in UI', async () => {
    const h = harness(); h.disk.delete('refresh_token'); await assert.rejects(h.unauthorized());
    assert.equal(h.disk.size, 0); assert.equal(h.state.invalidated, 1); assert.equal(h.state.refreshCalls, 0);
  });
  await test('rejected refresh token invalidates the session', async () => {
    const h = harness(); h.state.failure = { response: { status: 401 } }; await assert.rejects(h.unauthorized());
    assert.equal(h.disk.size, 0); assert.equal(h.state.invalidated, 1);
  });
  for (const [label, failure] of [['timeout', { code: 'ECONNABORTED' }], ['offline', { code: 'ERR_NETWORK' }], ['server outage', { response: { status: 503 } }]]) {
    await test(`${label} preserves the session for retry`, async () => {
      const h = harness(); h.state.failure = failure; await assert.rejects(h.unauthorized());
      assert.equal(h.disk.get('access_token'), 'old-access'); assert.equal(h.state.invalidated, 0); assert.equal(h.state.timeout, 10000);
    });
  }
  await test('concurrent expired requests share one refresh and retry successfully', async () => {
    const h = harness(); await Promise.all([h.unauthorized(), h.unauthorized()]);
    assert.equal(h.state.refreshCalls, 1); assert.equal(h.state.retries, 2); assert.equal(h.state.invalidated, 0);
    assert.equal(h.disk.get('access_token'), 'new-access'); assert.equal(h.disk.get('refresh_token'), 'new-refresh');
  });
  await test('a rejected refreshed token leaves the broken account screen', async () => {
    const h = harness(); await assert.rejects(h.unauthorized('old-access', true));
    assert.equal(h.state.invalidated, 1); assert.equal(h.state.refreshCalls, 0);
  });
  await test('late failure from an old session cannot erase a new login', async () => {
    const h = harness(); await h.service.saveTokens('different-account', 'different-refresh');
    await assert.rejects(h.unauthorized('old-access', true));
    assert.equal(h.disk.get('access_token'), 'different-account'); assert.equal(h.state.invalidated, 0);
  });
  await test('serialized invalidation also preserves a concurrently saved new account', async () => {
    const h = harness(); await Promise.all([h.service.saveTokens('other', 'other-refresh'), h.service.invalidateSessionForToken('old-access')]);
    assert.equal(h.disk.get('access_token'), 'other'); assert.equal(h.state.invalidated, 0);
  });
  console.log(`${count} session recovery checks passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
