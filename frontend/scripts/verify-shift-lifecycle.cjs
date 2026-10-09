const assert = require('node:assert/strict');
const { harness } = require('./verify-trip-recovery.cjs');
let count = 0;
async function test(name, fn) { await fn(); count++; console.log(`PASS ${name}`); }
(async () => {
  await test('duration uses 30-minute increments and persists an actual end', async () => {
    const h=harness(), d=h.load('@/features/shifts/duration'), j=h.load('@/features/shifts/journal');
    const start=Date.parse('2026-09-30T11:00:00Z');
    assert.equal(d.plannedEndAt(start,90),'2026-09-30T12:30:00.000Z'); assert.equal(d.SHIFT_DURATIONS.length,97);
    assert.equal(d.plannedEndAt(start,0),null);
    for(const n of [-30,31,2900,NaN]) assert.throws(()=>d.plannedEndAt(start,n));
    const e=await j.startShift('1',null,d.plannedEndAt(start,90));
    assert.equal((await harness(h.disk).load('@/features/shifts/journal').activeShift('1')).data.planned_end_at,e.data.planned_end_at);
  });
  await test('legacy categories preserved; reviewed saves queued offline; account isolated', async () => {
    const h=harness(), j=h.load('@/features/shifts/journal'), e=await j.startShift('1','spark',null);
    const segment={client_id:'old',started_at:e.data.started_at,ended_at:e.data.started_at,distance_miles:2,category:'personal',excluded:false,platform_client_id:null};
    await j.editShift('1',e.data.client_id,e=>e.data.segments.push(segment,{...segment,client_id:'new',reviewed:false},{...segment,client_id:'excluded',excluded:true}));
    await j.requestTripSave('1',e.data.client_id);
    const saved=(await harness(h.disk).load('@/features/shifts/journal').listShifts('1'))[0].data.segments;
    assert.equal(saved[0].category,'personal');assert(saved[0].save_requested);assert(!saved[1].save_requested);assert(!saved[2].save_requested);
    await assert.rejects(j.requestTripSave('2',e.data.client_id));
  });
  await test('converted source stays immutable and remote saved status survives restart', async()=>{
    const h=harness(), j=h.load('@/features/shifts/journal'), e=await j.startShift('1',null,null);
    await j.editShift('1',e.data.client_id,e=>e.data.segments.push({client_id:'s',started_at:e.data.started_at,ended_at:e.data.started_at,distance_miles:2,category:'personal',excluded:false,platform_client_id:null}));
    const remote=(await j.listShifts('1'))[0].data;remote.segments[0].converted_at=new Date().toISOString();remote.segments[0].trip_id=4;
    await j.importShiftHistory('1',[remote]);await j.editShift('1',e.data.client_id,e=>{e.data.segments[0].category='business';});
    const s=(await harness(h.disk).load('@/features/shifts/journal').listShifts('1'))[0].data.segments[0];assert.equal(s.category,'personal');assert.equal(s.trip_id,4);
  });
  await test('idle deadline ends once; manual Trip defers end and recorder stays alive', async()=>{
    const h=harness(), j=h.load('@/features/shifts/journal'), engine=h.engine();
    await engine.startRecording('1',{category:'business',platform:'spark',trackingMethod:'manual'});
    const e=await j.startShift('1','spark',new Date(Date.now()-1000).toISOString());
    await engine.checkShiftDeadline('1');assert(await j.activeShift('1'));assert(h.state.native);
    await engine.endShiftRecording('1',e.data.client_id);assert(h.state.native);
    const b=await j.startShift('2',null,new Date(Date.now()-1000).toISOString());
    assert(await j.autoEndIfDue('2',false));assert.equal(await j.autoEndIfDue('2',false),false);
    assert(await j.claimEndedNotice('2',b.data.client_id));assert.equal(await j.claimEndedNotice('2',b.data.client_id),false);
  });
  await test('driving past deadline waits for sustained stop; GPS gap is not a stop', async()=>{
    const original=Date.now;let now=original();Date.now=()=>now;
    try {
      const h=harness(), j=h.load('@/features/shifts/journal'), e=await j.startShift('1','lyft',new Date(now+20000).toISOString());
      for(let i=0;i<5;i++){now+=10000;await j.recordShiftPoints(e.data.client_id,[h.point(i*10,now)]);}
      assert((await j.activeShift('1')).detector.driving);assert.equal(await j.autoEndIfDue('1',false),false);
      now+=180000;await j.recordShiftPoints(e.data.client_id,[{...h.point(40,now),speed:0}]);
      assert.equal(await j.autoEndIfDue('1',false),false);
      for(let i=0;i<j.DETECTION.stopMs/10000+2;i++){now+=10000;await j.recordShiftPoints(e.data.client_id,[{...h.point(40,now),speed:0}]);}
      await j.autoEndIfDue('1',false);assert.equal(await j.activeShift('1'),null);const saved=(await j.listShifts('1'))[0];assert(saved.autoEnded);assert.equal(saved.data.segments.length,1);
    } finally {Date.now=original;}
  });
  await test('warning replacement, logout cancellation, ended notification once', async()=>{
    const h=harness(), j=h.load('@/features/shifts/journal'), n=h.load('expo-notifications'), notices=[];let scheduled=[];
    Object.assign(n,{getPermissionsAsync:async()=>({granted:true}),getAllScheduledNotificationsAsync:async()=>scheduled,SchedulableTriggerInputTypes:{DATE:'date'},cancelScheduledNotificationAsync:async id=>{scheduled=scheduled.filter(n=>n.identifier!==id);},scheduleNotificationAsync:async req=>{notices.push(req);if(req.trigger)scheduled.push(req);return req.identifier;}});
    const service=h.load('@/features/shifts/notifications');const e=await j.startShift('1',null,new Date(Date.now()+3600000).toISOString());
    await service.reconcileShiftNotifications('1',await j.listShifts('1'));assert.equal(scheduled.length,1);assert.equal(scheduled[0].trigger.date.getTime(),Date.parse(e.data.planned_end_at)-600000);
    await j.editShift('1',e.data.client_id,e=>{e.data.planned_end_at=new Date(Date.now()+7200000).toISOString();});
    await service.reconcileShiftNotifications('1',await j.listShifts('1'));assert.equal(scheduled.length,1);assert.equal(notices.length,2);
    await service.reconcileShiftNotifications(null,[]);assert.equal(scheduled.length,0);
    await j.editShift('1',e.data.client_id,e=>{e.data.planned_end_at=new Date(Date.now()-1000).toISOString();});await j.autoEndIfDue('1',false);
    await service.reconcileShiftNotifications('1',await j.listShifts('1'));await service.reconcileShiftNotifications('1',await j.listShifts('1'));
    assert.equal(notices.filter(n=>!n.trigger).length,1);
  });
  console.log(`${count} Shift lifecycle groups passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
