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
  await test('one location batch reaches both consumers without combining their accounting', async () => {
    const h=harness(), e=h.engine(), j=h.load('@/features/shifts/journal');
    await e.startShiftRecording('1','spark',null); await e.startRecording('1',trip);
    await h.tasks.get(e.TRIP_LOCATION_TASK)({data:{locations:[h.location(h.point(10)),h.location(h.point(20)),h.location(h.point(30))]}});
    assert((await h.journal().getActiveTrip('1')).distanceMiles>0);
    assert((await j.activeShift('1')).detector.miles>0);
    const shift=await j.activeShift('1'); await e.endShiftRecording('1',shift.data.client_id);
    assert(await h.journal().getActiveTrip('1')); assert.equal((await h.journal().pendingTrips('1')).length,0);
    const done=(await j.listShifts('1'))[0]; assert(done.data.segments.every(s=>s.ended_at<=done.data.ended_at));
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
      const saved=await j.activeShift('1'); assert.equal(saved.data.segments.length,1); assert(saved.data.segments[0].distance_miles>.05); assert.equal(saved.data.segments[0].category,'personal');
      await j.editShift('1',e.data.client_id,entry=>{entry.data.segments[0].category='business';entry.data.segments[0].excluded=true;});
      const restored=(await harness(h.disk).load('@/features/shifts/journal').listShifts('1'))[0]; assert(restored.data.segments[0].excluded);
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
  console.log(`${count} Shift checks passed`);
})().catch(error=>{console.error(error);process.exitCode=1;});
