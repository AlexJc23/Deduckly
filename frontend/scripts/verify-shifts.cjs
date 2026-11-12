const assert = require('node:assert/strict');
const { harness } = require('./verify-trip-recovery.cjs');
let count = 0;
async function test(name, fn) { await fn(); console.log('PASS', name); count++; }
const trip = { category: 'business', platform: 'spark', trackingMethod: 'automatic' };
(async () => {
  await test('shared lifecycle A-D: either consumer survives ending/canceling the other', async () => {
    for (const endFirst of ['trip', 'cancel', 'shift']) {
      const h = harness(), e = h.engine(), j = h.load('@/features/shifts/journal');
      await e.startShiftRecording('1','spark',null); const shift = await j.activeShift('1');
      await e.startRecording('1',trip); assert.equal(h.state.starts,1);
      if (endFirst === 'shift') {
        await e.endShiftRecording('1',shift.data.client_id); assert(h.state.native); assert(await h.journal().getActiveTrip('1'));
        await e.endRecording('1');
      } else {
        await (endFirst === 'cancel' ? e.cancelRecording('1') : e.endRecording('1'));
        assert(h.state.native); assert(await j.recordingShift()); await e.endShiftRecording('1',shift.data.client_id);
      }
      assert.equal(h.state.native,false);
    }
    const h=harness(), e=h.engine(), j=h.load('@/features/shifts/journal');
    await e.startShiftRecording('1',null,null); await e.endShiftRecording('1',(await j.activeShift('1')).data.client_id); assert.equal(h.state.native,false);
  });
  await test('an individual Trip owns its GPS fixes and the Shift stays active', async () => {
    const h=harness(), e=h.engine(), j=h.load('@/features/shifts/journal');
    await e.startShiftRecording('1','spark',null); await e.startRecording('1',trip);
    await h.tasks.get(e.TRIP_LOCATION_TASK)({data:{locations:[h.location(h.point(10)),h.location(h.point(20)),h.location(h.point(30))]}});
    assert((await h.journal().getActiveTrip('1')).distanceMiles>0);
    assert.equal((await j.activeShift('1')).detector.miles,0);
    const shift=await j.activeShift('1'); await e.endShiftRecording('1',shift.data.client_id);
    assert(await h.journal().getActiveTrip('1')); assert.equal((await h.journal().pendingTrips('1')).length,0);
    const done=(await j.listShifts('1'))[0]; assert(done.data.segments.every(s=>s.ended_at<=done.data.ended_at));
  });
  await test('a mid-drive individual Trip splits Shift detection and old callbacks cannot bridge it', async () => {
    const original = Date.now; let now = new Date(2026, 10, 10, 10).getTime(); Date.now = () => now;
    try {
      const h = harness(), e = h.engine(), j = h.load('@/features/shifts/journal');
      const step = async (i) => {
        now += 10_000;
        await h.tasks.get(e.TRIP_LOCATION_TASK)({data:{locations:[h.location(h.point(i, now))]}});
      };
      await e.startShiftRecording('1', 'spark', null);
      for (let i = 0; i < 60; i += 10) await step(i);
      const before = await j.activeShift('1'); assert(before.detector.driving);
      now += 1000;
      await e.startRecording('1', trip);
      const startedAt = (await h.journal().getActiveTrip('1')).startTime;
      assert.equal((await j.activeShift('1')).data.segments.length, 1);
      for (let i = 60; i < 120; i += 10) await step(i);
      assert.equal((await j.activeShift('1')).detector.miles, 0);
      const endedAt = now;
      await e.endRecording('1');
      const first = (await j.activeShift('1')).data.segments[0];
      assert(Date.parse(first.ended_at) <= startedAt);
      await h.tasks.get(e.TRIP_LOCATION_TASK)({data:{locations:[h.location(h.point(111, endedAt - 2000))]}});
      assert.equal((await j.activeShift('1')).detector.last, undefined);
      for (let i = 120; i < 180; i += 10) await step(i);
      await e.endShiftRecording('1', before.data.client_id);
      const segments = (await j.listShifts('1'))[0].data.segments;
      assert.equal(segments.length, 2);
      assert(Date.parse(segments[1].started_at) > endedAt);
      assert.equal((await h.journal().pendingTrips('1')).length, 1);
    } finally { Date.now = original; }
  });
  await test('the recorded default vehicle survives a default change and reaches both upload paths', async () => {
    const h = harness(), e = h.engine(), j = h.load('@/features/shifts/journal');
    const key = '@deduckly/vehicles:v1:1';
    const saveDefault = id => h.disk.set(key, JSON.stringify({
      version:1, owner:'1', vehicles:[{id,is_default:true,deleted:false,version:1,make:'Make',model:'Model'}],
      pending:[], prices:{}, quotes:{}
    }));
    saveDefault('start-vehicle');
    await e.startShiftRecording('1', null, null);
    await e.startRecording('1', trip);
    saveDefault('next-vehicle');
    assert.equal((await j.activeShift('1')).vehicleId, 'start-vehicle');
    assert.equal((await h.journal().getActiveTrip('1')).vehicleId, 'start-vehicle');
    await h.tasks.get(e.TRIP_LOCATION_TASK)({data:{locations:[h.location(h.point(10)),h.location(h.point(20)),h.location(h.point(30))]}});
    await e.endRecording('1');
    assert.equal((await h.journal().pendingTrips('1'))[0].payload.vehicle_id, 'start-vehicle');
    h.state.beforeShiftUpload = (_, config) => assert.equal(config.params.vehicle_id, 'start-vehicle');
    await h.load('@/features/shifts/sync').syncShifts();
    await h.load('@/features/tracking/services/trip-journal-sync').syncRecordedTrips();
    assert.equal(h.state.remote[0].vehicle_id, 'start-vehicle');
  });
  await test('cold vehicle cache checks the server and an offline lookup does not block recording', async () => {
    for (const offline of [false, true]) {
      const h = harness(), engine = h.engine(), shifts = h.load('@/features/shifts/journal');
      h.state.remoteVehicles = [
        { id: 'deleted-default', is_default: true, deleted: true },
        { id: 'saved-default', is_default: true, deleted: false },
      ];
      h.state.vehicleLookupFails = offline;
      await engine.startShiftRecording('1', null, null);
      await engine.startRecording('1', trip);
      const expected = offline ? undefined : 'saved-default';
      assert.equal((await shifts.activeShift('1')).vehicleId, expected);
      assert.equal((await h.journal().getActiveTrip('1')).vehicleId, expected);
    }
  });
  await test('restart restores Shift alone and both consumers; logout isolates owners', async () => {
    for (const withTrip of [false,true]) {
      const h=harness(), e=h.engine(); await e.startShiftRecording('1','spark',null);
      if(withTrip) await e.startRecording('1',trip);
      const resumed=harness(h.disk), engine=resumed.engine(), journal=resumed.load('@/features/shifts/journal');
      await engine.resumeRecording('1'); assert(resumed.state.native); assert(await journal.recordingShift());
      assert.equal(!!await resumed.journal().getRecordingTrip(),withTrip);
      await engine.pauseRecording(); assert.equal(resumed.state.native,false);
      await engine.resumeRecording('2'); assert.equal(await journal.recordingShift(),null); assert.deepEqual(await journal.listShifts('2'),[]);
      assert(await journal.activeShift('1')); await engine.resumeRecording('1'); assert(resumed.state.native);
    }
  });
  await test('offline platform history, planned end and edits survive restart', async () => {
    const h=harness(), j=h.load('@/features/shifts/journal');
    const e=await j.startShift('1','spark',null);
    await j.switchPlatform('1',e.data.client_id,'doordash'); await j.switchPlatform('1',e.data.client_id,'spark');
    const recovered=await harness(h.disk).load('@/features/shifts/journal').activeShift('1');
    assert.deepEqual(recovered.data.platform_sessions.map(p=>p.platform),['spark','doordash','spark']);
    assert.equal(recovered.data.platform_sessions.filter(p=>!p.ended_at).length,1);
    await j.endShift('1',e.data.client_id); assert.equal(await j.activeShift('1'),null);
    assert((await j.listShifts('1'))[0].dirty);
  });
  await test('lost response retries stable snapshot; newer offline edits are not acknowledged away', async () => {
    const h=harness(), j=h.load('@/features/shifts/journal'), sync=h.load('@/features/shifts/sync');
    const e=await j.startShift('1','spark',null); h.state.lostResponse=true;
    await assert.rejects(sync.syncShifts()); const pending=await j.prepareShiftUpload('1');
    await j.switchPlatform('1',e.data.client_id,'uber');
    assert.deepEqual(await j.prepareShiftUpload('1'),pending);
    h.state.lostResponse=false; await sync.syncShifts();
    assert.equal(h.state.remoteShifts.length,1); assert.equal(h.state.remoteShifts[0].revision,2);
    assert.equal((await j.listShifts('1'))[0].dirty,false);
  });
  await test('conflicts and account changes keep pending data; failed storage preserves prior state', async () => {
    const h=harness(), j=h.load('@/features/shifts/journal'), sync=h.load('@/features/shifts/sync');
    const e=await j.startShift('1',null,null); h.state.rejectUpload=true;
    await assert.rejects(sync.syncShifts()); assert((await j.listShifts('1'))[0].pending);
    h.state.rejectUpload=false; h.state.switchAfterPost=true; await sync.syncShifts();
    assert((await j.listShifts('1'))[0].pending); assert.deepEqual(await j.listShifts('2'),[]);
    h.state.failWrite=true; await assert.rejects(j.endShift('1',e.data.client_id)); h.state.failWrite=false;
    assert(await j.activeShift('1'));
  });
  await test('conservative detector ignores stationary noise, records driving, stops and excludes without accounting', async () => {
    const original=Date.now; let now=original(); Date.now=()=>now;
    try {
      const h=harness(), j=h.load('@/features/shifts/journal'); const e=await j.startShift('1','spark',null);
      for(let i=0;i<5;i++){ now+=1000; await j.recordShiftPoints(e.data.client_id,[h.point(0,now)]); }
      assert.equal((await j.activeShift('1')).data.segments.length,0);
      for(let i=1;i<=4;i++){ now+=10000; await j.recordShiftPoints(e.data.client_id,[h.point(i*10,now)]); }
      for(let i=0;i<j.DETECTION.stopMs/10000+2;i++){ now+=10000; await j.recordShiftPoints(e.data.client_id,[{...h.point(40,now),speed:0}]); }
      const saved=await j.activeShift('1'); assert.equal(saved.data.segments.length,1); assert(saved.data.segments[0].distance_miles>.05); assert.equal(saved.data.segments[0].category,'business');
      await j.editShift('1',e.data.client_id,entry=>{entry.data.segments[0].category='personal';entry.data.segments[0].reviewed=true;entry.data.segments[0].excluded=true;});
      const restored=(await harness(h.disk).load('@/features/shifts/journal').listShifts('1'))[0]; assert(restored.data.segments[0].excluded); assert.equal(restored.data.segments[0].category,'personal'); assert(restored.data.segments[0].reviewed); assert.equal(restored.data.segments[0].start_lat,saved.data.segments[0].start_lat); assert.equal(restored.data.segments[0].platform_client_id,saved.data.segments[0].platform_client_id);
      assert.equal((await h.journal().pendingTrips('1')).length,0);
    } finally { Date.now=original; }
  });
  await test('Shift storage corruption cannot prevent manual Trip recording', async () => {
    const h=harness(), e=h.engine(); h.disk.set('@deduckly/shift-journal:v1','broken');
    await e.startRecording('1',trip); assert(h.state.native);
    const before=await h.journal().getActiveTrip('1');
    await h.tasks.get(e.TRIP_LOCATION_TASK)({data:{locations:[h.location(h.point(1)),h.location(h.point(2))]}});
    const after=await h.journal().getActiveTrip('1'); assert(after.distanceMiles > before.distanceMiles);
  });
  await test('identical client IDs across accounts cannot select the wrong recorder', async () => {
    const h=harness(), j=h.load('@/features/shifts/journal'); const a=await j.startShift('1',null,null);
    const saved=JSON.parse(h.disk.get('@deduckly/shift-journal:v1'));
    saved.entries.push({...JSON.parse(JSON.stringify(saved.entries[0])),owner:'2'});
    h.disk.set('@deduckly/shift-journal:v1',JSON.stringify(saved));
    await j.setShiftRecording('2'); assert.equal((await j.recordingShift()).owner,'2');
    await j.endShift('1',a.data.client_id); assert.equal((await j.recordingShift()).owner,'2');
    assert.equal((await j.listShifts('2'))[0].data.ended_at,null);
  });
  await test('Shift corruption does not overwrite stored records', async () => {
    const h=harness(); h.disk.set('@deduckly/shift-journal:v1','broken'); const j=h.load('@/features/shifts/journal');
    await assert.rejects(j.startShift('1',null,null)); assert.equal(h.disk.get('@deduckly/shift-journal:v1'),'broken');
  });
  await test('competing active Shift recovers after local end, restart and lost acknowledgement', async () => {
    const h=harness(), j=h.load('@/features/shifts/journal');
    const e=await j.startShift('1','spark',null);
    const id=e.data.client_id;
    const rejectActive=payload=>{ if (!payload.ended_at) throw { response: { status: 409, data: { detail: 'Another shift is active' } } }; };
    h.state.beforeShiftUpload=rejectActive;
    const shiftSync=h.load('@/features/shifts/sync');
    await assert.rejects(shiftSync.syncShifts(), error=>error.response.status===409);
    // Manual Trips are independent even while this account has a blocked Shift.
    const tripJournal=h.journal();
    const manual=await tripJournal.beginTrip('1',trip,h.point());
    await tripJournal.recordPoints(manual.id,[h.point(1),h.point(2),h.point(3),h.point(4)]);
    await tripJournal.finishTrip('1');
    assert.equal(await h.load('@/features/tracking/services/trip-journal-sync').syncRecordedTrips(),null);
    assert.equal((await tripJournal.pendingTrips('1')).length,0);
    assert.equal(h.state.remote.length,1);
    const frozen=await j.prepareShiftUpload('1');
    await j.editShift('1',id,entry=>entry.data.segments.push({
      client_id:'recorded-segment', started_at:entry.data.started_at, ended_at:entry.data.started_at,
      distance_miles:2.25, category:'business', excluded:false, platform_client_id:entry.data.platform_sessions[0].client_id,
      start_lat:40, start_lng:-74, start_address:'Original address',
    }));
    await j.endShift('1',id);
    assert.deepEqual(await j.prepareShiftUpload('1'),frozen);
    const resumed=harness(h.disk), restored=resumed.load('@/features/shifts/journal');
    resumed.state.beforeShiftUpload=rejectActive;
    resumed.state.lostResponse=true;
    await assert.rejects(resumed.load('@/features/shifts/sync').syncShifts(),/Response lost/);
    const ended=await restored.prepareShiftUpload('1');
    assert.equal(ended.client_id,id);assert.equal(ended.revision,frozen.revision);assert(ended.ended_at);
    assert.equal(ended.segments[0].start_address,'Original address');
    assert.equal(ended.segments[0].distance_miles,2.25);
    resumed.state.lostResponse=false;
    await resumed.load('@/features/shifts/sync').syncShifts();
    assert.equal(resumed.state.remoteShifts.length,1);assert.equal(await restored.prepareShiftUpload('1'),null);
  });
  await test('a revision conflict preserves the frozen snapshot and does not block unrelated records', async () => {
    const h=harness(), j=h.load('@/features/shifts/journal');
    const first=await j.startShift('1',null,null);
    const frozen=await j.prepareShiftUpload('1');
    await j.endShift('1',first.data.client_id);
    const second=await j.startShift('1',null,null);
    const attempts=[];
    h.state.beforeShiftUpload=data=>{
      attempts.push(data.client_id);
      if(data.client_id===first.data.client_id)throw {response:{status:409,data:{detail:'Shift revision conflict'}}};
    };
    await assert.rejects(h.load('@/features/shifts/sync').syncShifts(),error=>error.response.status===409);
    assert.deepEqual(attempts,[first.data.client_id,second.data.client_id]);
    assert.deepEqual(await j.prepareShiftUpload('1'),frozen);
    assert((await j.listShifts('1'))[0].data.ended_at);
    assert.deepEqual(h.state.remoteShifts.map(item=>item.client_id),[second.data.client_id]);
  });
  await test('server-only history reflects another device ending a Shift and ignores older history', async () => {
    const h=harness(), j=h.load('@/features/shifts/journal');
    const snapshot={client_id:'remote-shift',revision:1,started_at:'2026-11-01T15:00:00Z',ended_at:null,platform_sessions:[],segments:[],planned_end_at:null};
    await j.importShiftHistory('1',[snapshot]);
    const ended={...snapshot,revision:2,ended_at:'2026-11-01T16:00:00Z'};
    await j.importShiftHistory('1',[ended,snapshot]);
    assert.deepEqual((await j.listShifts('1'))[0].data,ended);
  });
  console.log(`${count} Shift checks passed`);
})().catch(error=>{console.error(error);process.exitCode=1;});
