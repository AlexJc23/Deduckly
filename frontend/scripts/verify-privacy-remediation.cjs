/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const { harness } = require('./verify-trip-recovery.cjs');
function loader(mocks) {
 const cache = new Map();
 function load(spec, parent = root + '/entry.ts') {
  if (Object.hasOwn(mocks, spec)) return mocks[spec];
  if (!spec.startsWith('@/') && !spec.startsWith('.')) return require(spec);
  let file = spec.startsWith('@/') ? path.join(root, 'src', spec.slice(2)) : path.resolve(path.dirname(parent), spec);
  if (!file.endsWith('.ts')) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', code)(name => load(name, file), module, module.exports);
  return module.exports;
 }
 return load;
}
let count = 0;
async function test(name, fn) { await fn(); count++; console.log('PASS ' + name); }
(async () => {
 await test('deletion purges only owner Trip/Shift data and suppresses late imports', async () => {
  const h = harness(), trip = h.journal(), shifts = h.load('@/features/shifts/journal');
  const data = { category: 'business', platform: 'uber', trackingMethod: 'manual' };
  await trip.beginTrip('1', data, h.point()); await trip.beginTrip('2', data, h.point());
  const a = await shifts.startShift('1', null, null), b = await shifts.startShift('2', null, null);
  await trip.purgeTripOwner('1'); await shifts.purgeShiftOwner('1');
  assert.equal(await trip.getActiveTrip('1'), null); assert(await trip.getActiveTrip('2'));
  assert.deepEqual(await shifts.listShifts('1'), []); assert.equal((await shifts.listShifts('2'))[0].data.client_id, b.data.client_id);
  await shifts.importShiftHistory('1', [a.data]); assert.deepEqual(await shifts.listShifts('1'), []);
  const restarted = harness(h.disk); assert.equal(await restarted.journal().getActiveTrip('1'), null);
  assert(await restarted.journal().getActiveTrip('2'));
 });
 await test('recorder errors accurately show degraded rather than a false paused state', async () => {
  const h = harness(), e = h.engine();
  await e.startRecording('1', { category: 'business', platform: 'uber', trackingMethod: 'manual' });
  h.state.failWrite = true;
  await h.tasks.get(e.TRIP_LOCATION_TASK)({ data: { locations: [h.location(h.point(2))] } });
  assert.equal(e.getRecordingMode(), 'degraded'); assert.equal(h.state.native, true);
  h.state.failWrite = false; await e.pauseRecording();
  assert.equal(e.getRecordingMode(), 'paused'); assert.equal(h.state.native, false);
  assert(await h.journal().getActiveTrip('1'));
 });
 await test('logout retries use SecureStore and cannot detach a newly registered destination', async () => {
  const disk = new Map(), requests = []; let offline = true;
  const mocks = {
   'expo-secure-store': { getItemAsync: async key => disk.get(key) ?? null, setItemAsync: async (key, value) => disk.set(key, value), deleteItemAsync: async key => disk.delete(key) },
   '@/config/env': { ENV: { API_URL: 'https://example.invalid' } },
   axios: { post: async (url, body) => { assert(!url.includes('?')); requests.push(body); if (offline) throw Error('offline'); return {}; } },
  };
  let load = loader(mocks), service = load('@/features/auth/services/pending-logout');
  await service.enqueueLogout('synthetic-refresh-A', 'X'); await service.flushPendingLogouts();
  assert.equal(disk.size, 1); assert.equal(requests.length, 1);
  // Simulate app termination and a successful later registration on the installation.
  load = loader(mocks); service = load('@/features/auth/services/pending-logout');
  await service.protectRegisteredDestination('X'); offline = false;
  await service.flushPendingLogouts(); assert.equal(disk.size, 0);
  assert.equal(requests.at(-1).refresh_token, 'synthetic-refresh-A'); assert.equal(requests.at(-1).expo_push_token, null);
 });
 await test('temporary exports are deleted after success and sharing failure', async () => {
  const deleted = []; let fail = false;
  const load = loader({ 'expo-file-system/legacy': { cacheDirectory: 'cache/', EncodingType: { Base64: 'base64' }, writeAsStringAsync: async () => {}, deleteAsync: async uri => deleted.push(uri) }, 'expo-sharing': { shareAsync: async () => { if (fail) throw Error('cancelled'); } } });
  const service = load('@/features/reports/utils/save-file');
  await service.saveFile(new ArrayBuffer(1), 'Deduckly_Report.pdf', 'application/pdf');
  fail = true; await assert.rejects(service.saveFile(new ArrayBuffer(1), 'Deduckly_Report.csv', 'text/csv'));
  assert.deepEqual(deleted, ['cache/Deduckly_Report.pdf', 'cache/Deduckly_Report.csv']);
 });
 await test('deletion cleanup survives partial failure and retries without deleting another owner', async () => {
  const disk = new Map(), cleaned = []; let fail = true;
  const load = loader({
   '@react-native-async-storage/async-storage': { getItem: async key => disk.get(key) ?? null, setItem: async (key, value) => disk.set(key, value) },
   '@/features/tracking/services/trip-journal': { purgeTripOwner: async owner => cleaned.push('trip:' + owner) },
   '@/features/shifts/journal': { purgeShiftOwner: async owner => { if (fail) throw Error('storage'); cleaned.push('shift:' + owner); } },
   '@/features/vehicles/store': { purgeVehicleOwner: async owner => cleaned.push('vehicle:' + owner) },
   '@/features/reports/utils/save-file': { purgeCachedReports: async () => {} },
  });
  const service = load('@/features/auth/services/deleted-account');
  await assert.rejects(service.purgeDeletedAccount('A')); assert([...disk.values()].some(value => value.includes('A')));
  fail = false; await service.retryDeletedAccountCleanup();
  assert(cleaned.includes('shift:A')); assert(!cleaned.some(value => value.endsWith(':B')));
  assert.deepEqual(JSON.parse([...disk.values()][0]), []);
 });
 await test('vehicle purge does not erase another account and prevents stale writes', async () => {
  const disk = new Map(); let owner = 'A';
  const load = loader({
   '@react-native-async-storage/async-storage': { getItem: async k => disk.get(k) ?? null, setItem: async (k,v) => disk.set(k,v), removeItem: async k => disk.delete(k) },
   '@/features/auth/services/auth-service.service': { getAccessToken: async () => owner },
   '@/features/tracking/services/tracking-owner': { trackingOwnerFromToken: value => value },
   '@/features/auth/services/account-boundary': { getAccountGeneration: () => 1, isAccountChanging: () => false },
   '@/api/client': { api: {} },
  });
  const store = load('@/features/vehicles/store');
  await store.savePrice('A', 'gasoline', '3.45'); owner = 'B'; await store.savePrice('B', 'gasoline', '4.25');
  await store.purgeVehicleOwner('A'); owner = 'A'; await store.savePrice('A', 'gasoline', '9.99');
  assert.equal((await store.readVehicles('A')).prices.gasoline, undefined);
  assert.equal((await store.readVehicles('B')).prices.gasoline, '4.25');
 });
 await test('account deletion clears a refreshed same-owner session but preserves a different login', async () => {
  for (const switched of [false, true]) {
   let token = 'A-before', generation = 0, cleared = false, purged;
   let resolveDelete;
   const load = loader({
    '@/api/client': { api: { delete: () => new Promise(resolve => { resolveDelete = resolve; }) } },
    '../services/auth-service.service': { getAccessToken: async () => token, clearTokens: async () => { cleared = true; token = null; } },
    '@/features/tracking/services/tracking-owner': { trackingOwnerFromToken: value => value?.split('-')[0] ?? null },
    '../services/account-boundary': { getAccountGeneration: () => generation },
    '../services/deleted-account': { purgeDeletedAccount: async owner => { purged = owner; } },
   });
   const service = load('@/features/auth/api/user.api');
   const pending = service.deleteCurrentUser();
   while (!resolveDelete) await new Promise(resolve => setTimeout(resolve, 0));
   token = switched ? 'B-login' : 'A-refreshed'; if (switched) generation++;
   resolveDelete({ data: {} }); await pending;
   assert.equal(cleared, !switched); assert.equal(purged, 'A');
   if (switched) assert.equal(token, 'B-login');
  }
 });
 console.log(`${count} privacy remediation groups passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
