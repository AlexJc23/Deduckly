const assert = require('node:assert/strict');
const { harness } = require('./verify-trip-recovery.cjs');
let count = 0;
async function test(name, fn) { await fn(); count++; console.log('PASS', name); }
async function drive(h, j, id, clock, from=0) {
  for(let i=0;i<5;i++){clock.now+=10000;await j.recordShiftPoints(id,[h.point(from+i*10,clock.now)]);}
}
(async()=>{
  const original=Date.now, clock={now:original()}; Date.now=()=>clock.now;
  try {
    await test('endpoints survive detector restart and sustained stop without stationary drift',async()=>{
      let h=harness(), j=h.load('@/features/shifts/journal'); const e=await j.startShift('1','spark',null);
      await drive(h,j,e.data.client_id,clock);
      h=harness(h.disk);j=h.load('@/features/shifts/journal');
      for(let i=0;i<j.DETECTION.stopMs/10000+2;i++){clock.now+=10000;await j.recordShiftPoints(e.data.client_id,[{...h.point(40+i*.01,clock.now),speed:0}]);}
      const s=(await j.activeShift('1')).data.segments[0];
      assert.equal(s.start_lat,40); assert.equal(s.start_lng,-74);assert.equal(s.end_lat,40.004);assert(s.distance_miles>0);
    });
    await test('platform split retains the shared endpoint and correct new origin',async()=>{
      const h=harness(),j=h.load('@/features/shifts/journal'),e=await j.startShift('1','spark',null);
      await drive(h,j,e.data.client_id,clock);await j.switchPlatform('1',e.data.client_id,'lyft');
      await drive(h,j,e.data.client_id,clock,40);await j.endShift('1',e.data.client_id);
      const s=(await j.listShifts('1'))[0].data.segments;
      assert.equal(s.length,2);assert.equal(s[0].end_lat,s[1].start_lat);assert.equal(s[1].end_lat,40.008);
      assert.notEqual(s[0].platform_client_id,s[1].platform_client_id);
    });
    await test('addresses persist before upload; response-loss retries are unchanged',async()=>{
      const h=harness(),j=h.load('@/features/shifts/journal'),e=await j.startShift('1',null,null);
      await drive(h,j,e.data.client_id,clock);await j.endShift('1',e.data.client_id);
      let calls=0;h.load('expo-location').reverseGeocodeAsync=async()=>{calls++;return [{name:'Street',city:'Atlanta'}];};
      const sync=h.load('@/features/shifts/sync');h.state.lostResponse=true;await assert.rejects(sync.syncShifts());
      const pending=await j.prepareShiftUpload('1');assert.equal(pending.segments[0].start_address,'Street, Atlanta');
      h.state.lostResponse=false;await sync.syncShifts();assert.equal(calls,2);assert.deepEqual(h.state.remoteShifts[0],pending);
    });
    await test('geocoder failure preserves coordinates and still uploads',async()=>{
      const h=harness(),j=h.load('@/features/shifts/journal'),e=await j.startShift('1',null,null);
      await drive(h,j,e.data.client_id,clock);await j.endShift('1',e.data.client_id);
      h.load('expo-location').reverseGeocodeAsync=async()=>{throw Error('Unavailable');};
      await h.load('@/features/shifts/sync').syncShifts();assert.equal(h.state.remoteShifts[0].segments[0].start_lat,40);
      assert.equal(h.state.remoteShifts[0].segments[0].start_address,undefined);
    });
    await test('account switch during geocoding prevents upload and preserves owner data',async()=>{
      const h=harness(),j=h.load('@/features/shifts/journal'),e=await j.startShift('1',null,null);
      await drive(h,j,e.data.client_id,clock);await j.endShift('1',e.data.client_id);
      h.load('expo-location').reverseGeocodeAsync=async()=>{h.state.generation++;h.state.owner='2';return [{name:'Street'}];};
      await h.load('@/features/shifts/sync').syncShifts();assert.equal(h.state.remoteShifts.length,0);assert.equal((await j.listShifts('2')).length,0);
      assert((await j.listShifts('1'))[0].dirty);
    });
    await test('legacy segment has no guessed endpoints and remains uploadable',async()=>{
      const h=harness(),j=h.load('@/features/shifts/journal'),e=await j.startShift('1',null,null);
      await j.editShift('1',e.data.client_id,e=>e.data.segments.push({client_id:'legacy',started_at:e.data.started_at,ended_at:e.data.started_at,distance_miles:2,category:'personal',excluded:false,platform_client_id:null}));
      let calls=0;h.load('expo-location').reverseGeocodeAsync=async()=>{calls++;return [];};
      await h.load('@/features/shifts/sync').syncShifts();assert.equal(calls,0);assert.equal(h.state.remoteShifts[0].segments[0].start_lat,undefined);
    });
  } finally { Date.now=original; }
  console.log(`${count} Shift location checks passed`);
})().catch(error=>{console.error(error);process.exitCode=1;});
