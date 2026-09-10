const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ts = require(require.resolve('typescript', { paths: [root] }));
let count = 0;
function harness(disk = new Map()) {
  const cache = new Map(), tasks = new Map();
  const state = { failWrite: false, foreground: true, background: true, native: false, starts: 0, stops: 0, watch: null, posts: 0, lostResponse: false, remote: [], owner: '1' };
  const now = Date.now();
  const point = (n = 0, time = now + n * 1000) => ({ latitude: 40 + n * .0001, longitude: -74, timestamp: time, accuracy: 5, heading: 0, speed: 11 });
  const location = p => ({ timestamp: p.timestamp, coords: p });
  const token = () => `x.${Buffer.from(JSON.stringify({ sub: state.owner, type: 'access' })).toString('base64url')}.x`;
  const api = {
    get: async (_, cfg) => { assert.equal(cfg.deducklyOwnerId, state.owner); return { data: state.remote }; },
    post: async (_, payload, cfg) => {
      assert.equal(cfg.deducklyOwnerId, state.owner); state.posts++;
      state.remote.push({ ...payload, distance_miles: String(payload.distance_miles), id: state.posts });
      if (state.lostResponse) throw Error('Response lost');
    },
  };
  const mocks = {
    '@react-native-async-storage/async-storage': {
      getItem: async key => disk.get(key) ?? null,
      setItem: async (key, value) => { if (state.failWrite) throw Error('Disk full'); disk.set(key, value); },
    },
    'expo-location': {
      Accuracy: { BestForNavigation: 6 }, ActivityType: { AutomotiveNavigation: 1 },
      getCurrentPositionAsync: async () => location(point()),
      requestForegroundPermissionsAsync: async () => ({ granted: state.foreground }),
      getForegroundPermissionsAsync: async () => ({ granted: state.foreground }),
      requestBackgroundPermissionsAsync: async () => ({ granted: state.background }),
      getBackgroundPermissionsAsync: async () => ({ granted: state.background }),
      hasStartedLocationUpdatesAsync: async () => state.native,
      startLocationUpdatesAsync: async () => { state.native = true; state.starts++; },
      stopLocationUpdatesAsync: async () => { state.native = false; state.stops++; },
      watchPositionAsync: async (_, callback) => { state.watch = callback; return { remove: () => { state.watch = null; } }; },
    },
    'expo-task-manager': { isTaskDefined: name => tasks.has(name), defineTask: (name, callback) => tasks.set(name, callback), isAvailableAsync: async () => true },
    'react-native': { Platform: { OS: 'ios' } },
    '@/i18n/alerts': { localizedAlert: (_title, _message, buttons) => buttons?.at(-1).onPress() },
    '@/i18n/core': { translate: text => text },
    '@/features/auth/services/auth-service.service': { getAccessToken: async () => state.owner ? token() : null },
    '@/api/client': { api },
  };
  function load(spec, parent = root + '/index.js') {
    if (mocks[spec]) return mocks[spec];
    let filename = spec.startsWith('@/') ? path.join(root, 'src', spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(parent), spec) : null;
    if (!filename) return require(require.resolve(spec, { paths: [root] }));
    if (!path.extname(filename)) filename += '.ts';
    // .service is part of the filename, not a TypeScript extension.
    if (!filename.endsWith('.ts') && !filename.endsWith('.tsx') && !filename.endsWith('.js')) filename += '.ts';
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} }; cache.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    new Function('require', 'module', 'exports', code)(s => load(s, filename), module, module.exports);
    return module.exports;
  }
  return { state, disk, point, location, tasks, load, journal: () => load('@/features/tracking/services/trip-journal'), engine: () => load('@/features/tracking/services/background-tracking') };
}
const data = { category: 'business', platform: 'uber', trackingMethod: 'automatic' };
async function test(name, fn) { await fn(); count++; console.log(`PASS ${name}`); }
(async () => {
  await test('restart restores original start, platform, and mileage', async () => {
    const h = harness(), j = h.journal(); const trip = await j.beginTrip('1', data, h.point());
    await j.recordPoints(trip.id, [h.point(1), h.point(2), h.point(3), h.point(4)]);
    const before = await j.getActiveTrip('1'); const after = await harness(h.disk).journal().getActiveTrip('1');
    assert.deepEqual(after, before); assert(after.distanceMiles > .02); assert.equal(after.startTime, trip.startTime);
  });
  await test('concurrent start and location batches are serialized; duplicate timestamps ignored', async () => {
    const h = harness(), j = h.journal(); const [a, b] = await Promise.all([j.beginTrip('1', data, h.point()), j.beginTrip('1', data, h.point())]); assert.equal(a.id, b.id);
    await Promise.all([j.recordPoints(a.id, [h.point(2), h.point(1)]), j.recordPoints(a.id, [h.point(2), h.point(3)])]);
    const before = await j.getActiveTrip('1'); await j.recordPoints(a.id, [h.point(1), h.point(2), h.point(3)]);
    assert.deepEqual(await j.getActiveTrip('1'), before);
  });
  await test('GPS gaps retain saved miles without inventing connecting mileage', async () => {
    const h = harness(), j = h.journal(); const initial = h.point(0, Date.now() - 300000);
    const trip = await j.beginTrip('1', data, initial);
    await j.recordPoints(trip.id, [h.point(100, Date.now())]);
    const saved = await j.getActiveTrip('1'); assert.equal(saved.distanceMiles, 0); assert.equal(saved.interrupted, true);
  });
  await test('invalid coordinates, stale points, inaccurate fixes, and impossible speeds rejected', async () => {
    const h = harness(), j = h.journal(); const trip = await j.beginTrip('1', data, h.point());
    await j.recordPoints(trip.id, [{ ...h.point(1), latitude: NaN }, { ...h.point(1), accuracy: 999 }, { ...h.point(100), timestamp: h.point(1).timestamp }, h.point(-1)]);
    assert.equal((await j.getActiveTrip('1')).distanceMiles, 0);
  });
  await test('failed persistence does not erase an active trip or prevent a later retry', async () => {
    const h = harness(), j = h.journal(); const trip = await j.beginTrip('1', data, h.point());
    await j.recordPoints(trip.id, [h.point(4)]); const before = await j.getActiveTrip('1');
    h.state.failWrite = true; await assert.rejects(j.finishTrip('1')); assert.deepEqual(await j.getActiveTrip('1'), before);
    h.state.failWrite = false; assert.equal(await j.finishTrip('1'), true); assert.equal(await j.getActiveTrip('1'), null); assert.equal((await j.pendingTrips('1')).length, 1);
  });
  await test('completion is atomic across restart and late updates cannot revive a finished trip', async () => {
    const h = harness(), j = h.journal(); const trip = await j.beginTrip('1', data, h.point()); await j.recordPoints(trip.id, [h.point(4)]);
    await Promise.all([j.finishTrip('1', 23), j.recordPoints(trip.id, [h.point(5)])]);
    const restored = harness(h.disk).journal(); assert.equal(await restored.getActiveTrip('1'), null); assert.equal((await restored.pendingTrips('1'))[0].payload.income_amount, 23);
    assert.equal(await restored.finishTrip('1'), false); assert.equal((await restored.pendingTrips('1')).length, 1);
  });
  await test('cancel and short-trip discard survive restart and do not queue uploads', async () => {
    const h = harness(), j = h.journal(); await j.beginTrip('1', data, h.point()); await j.discardTrip('1'); assert.equal(await harness(h.disk).journal().getActiveTrip('1'), null);
    await j.beginTrip('1', data, h.point()); assert.equal(await j.finishTrip('1'), 'discarded'); assert.equal((await j.pendingTrips('1')).length, 0);
  });
  await test('account records stay separate and paused trips reject location callbacks', async () => {
    const h = harness(), j = h.journal(); const trip = await j.beginTrip('1', data, h.point()); await j.setRecording(null);
    await j.recordPoints(trip.id, [h.point(4)]); assert.equal((await j.getActiveTrip('1')).distanceMiles, 0); assert.equal(await j.getActiveTrip('2'), null);
    await j.beginTrip('2', data, h.point()); assert.equal((await j.getRecordingTrip()).ownerId, '2'); assert.equal((await j.pendingTrips('2')).length, 0);
  });
  await test('corrupt saved state fails closed without overwriting recovery data', async () => {
    const h = harness(new Map([['@deduckly/trip-journal:v1', '{bad']])); await assert.rejects(h.journal().beginTrip('1', data, h.point())); assert.equal(h.disk.get('@deduckly/trip-journal:v1'), '{bad');
  });
  await test('background task records without React and repeated resume registers only once', async () => {
    const h = harness(), e = h.engine(); assert.equal(await e.startRecording('1', data), true); assert.equal(h.state.watch, null);
    await Promise.all([e.resumeRecording('1'), e.resumeRecording('1')]); assert.equal(h.state.starts, 1);
    await h.tasks.get(e.TRIP_LOCATION_TASK)({ data: { locations: [h.location(h.point(4))] } });
    assert((await h.journal().getActiveTrip('1')).distanceMiles > .02);
    assert.equal(await e.endRecording('1'), true); assert.equal(h.state.native, false);
  });
  await test('permission denial starts no trip; foreground fallback is explicit and revocation pauses', async () => {
    const h = harness(), e = h.engine(); h.state.foreground = false; assert.equal(await e.startRecording('1', data), false); assert.equal(await h.journal().getActiveTrip('1'), null);
    h.state.foreground = true; h.state.background = false; assert.equal(await e.startRecording('1', data), true); assert.equal(e.getRecordingMode(), 'foreground'); assert(h.state.watch);
    h.state.foreground = false; await e.resumeRecording('1'); assert.equal(e.getRecordingMode(), 'paused'); assert.equal(h.state.watch, null); assert(await h.journal().getActiveTrip('1'));
  });
  await test('sign-out stops native recording and keeps the owner’s recoverable trip', async () => {
    const h = harness(), e = h.engine(); await e.startRecording('1', data); await e.pauseRecording(); assert.equal(h.state.native, false); assert.equal(await h.journal().getRecordingTrip(), null); assert(await h.journal().getActiveTrip('1'));
    await e.resumeRecording('2'); assert.equal(h.state.native, false); await e.resumeRecording('1'); assert.equal(h.state.native, true);
  });
  await test('overlapping uploads and restart after a lost response produce one remote trip', async () => {
    const h = harness(), j = h.journal(); const trip = await j.beginTrip('1', data, h.point()); await j.recordPoints(trip.id, [h.point(4)]); await j.finishTrip('1');
    const sync = h.load('@/features/tracking/services/trip-journal-sync'); h.state.lostResponse = true;
    await Promise.all([sync.syncRecordedTrips(), sync.syncRecordedTrips()]); assert.equal(h.state.posts, 1); assert.equal((await j.pendingTrips('1')).length, 1);
    const restarted = harness(h.disk); restarted.state.remote = h.state.remote;
    await restarted.load('@/features/tracking/services/trip-journal-sync').syncRecordedTrips(); assert.equal(restarted.state.posts, 0); assert.equal((await restarted.journal().pendingTrips('1')).length, 0);
  });
  await test('offline owner’s completed trip is not uploaded by another account', async () => {
    const h = harness(), j = h.journal(); const trip = await j.beginTrip('1', data, h.point()); await j.recordPoints(trip.id, [h.point(4)]); await j.finishTrip('1'); h.state.owner = '2';
    await h.load('@/features/tracking/services/trip-journal-sync').syncRecordedTrips(); assert.equal(h.state.posts, 0); assert.equal((await j.pendingTrips('1')).length, 1);
  });
  await test('local owner parsing rejects missing/malformed/2FA tokens', async () => {
    const parse = harness().load('@/features/tracking/services/tracking-owner').trackingOwnerFromToken;
    assert.equal(parse(null), null); assert.equal(parse('bad'), null); assert.equal(parse(`x.${Buffer.from(JSON.stringify({ sub:'1', type:'2fa' })).toString('base64url')}.x`), null);
  });
  await test('short foreground suspension reanchors without adding unrecorded movement', async () => {
    const h = harness(), e = h.engine(); h.state.background = false;
    await e.startRecording('1', data); await e.suspendForegroundRecording();
    assert.equal(h.state.watch, null); await e.resumeRecording('1');
    h.state.watch(h.location(h.point(4)));
    const saved = await h.journal().getActiveTrip('1');
    assert.equal(saved.distanceMiles, 0); assert.equal(saved.interrupted, true);
  });
  await test('restart recreates the native recorder and retains the existing trip ID', async () => {
    const h = harness(), e = h.engine(); await e.startRecording('1', data);
    const original = await h.journal().getActiveTrip('1');
    const next = harness(h.disk); await next.engine().resumeRecording('1');
    assert.equal(next.state.starts, 1); assert.equal((await next.journal().getActiveTrip('1')).id, original.id);
  });
  await test('native task cleans up after termination between save and stopping location', async () => {
    const h = harness(), e = h.engine(); await e.startRecording('1', data);
    await h.journal().discardTrip('1'); assert.equal(h.state.native, true);
    await h.tasks.get(e.TRIP_LOCATION_TASK)({ data: { locations: [] } }); assert.equal(h.state.native, false);
  });
  console.log(`${count} tracking recovery checks passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
