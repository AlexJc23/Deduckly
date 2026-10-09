const assert = require('node:assert/strict');
const { harness } = require('./verify-trip-recovery.cjs');
let count=0, clock=Date.parse('2026-10-05T12:00:00Z');
const original=Date.now;Date.now=()=>clock;
async function test(name,fn){await fn();count++;console.log('PASS',name);}
async function setup(planned=null){
  let h=harness(),j=h.load('@/features/shifts/journal');const e=await j.startShift('1','spark',planned);
  const sim={h,j,e,x:0,last:null};
  sim.send=async(x,seconds=5,speed=10,extra={})=>{
    clock+=seconds*1000;sim.x=x;
    const p={latitude:40+x/111195,longitude:-74,timestamp:clock,accuracy:5,speed,heading:0,...extra};sim.last=p;
    await sim.j.recordShiftPoints(e.data.client_id,[p]);return p;
  };
  sim.drive=async()=>{for(let i=0;i<6;i++)await sim.send(sim.x+50);};
  sim.stop=()=>sim.send(sim.x,5,0);
  sim.wait=async(seconds,drift=0)=>{const x=sim.x;for(let i=0;i<seconds/10;i++)await sim.send(x+(i%2?drift:0),10,0);sim.x=x;};
  sim.read=async()=> (await sim.j.listShifts('1'))[0];
  sim.restart=()=>{sim.h=harness(sim.h.disk);sim.j=sim.h.load('@/features/shifts/journal');};
  await sim.send(0,1,0);return sim;
}
(async()=>{try{
 await test('sustained movement starts once using an earlier trustworthy buffered point',async()=>{
  const s=await setup();await s.wait(30);const origin=s.last;
  await s.drive();const d=(await s.read()).detector;
  assert(d.driving);assert.equal(d.start,origin.timestamp);assert.equal(d.first.latitude,origin.latitude);
  assert(d.start<clock-15000);assert.equal((await s.read()).data.segments.length,0);
 });
 await test('one-second samples confirm movement and recent buffer stays bounded',async()=>{
  const s=await setup();await s.wait(300);
  for(let i=0;i<40;i++)await s.send(s.x+10,1);
  const d=(await s.read()).detector;assert(d.driving);assert(d.recent.length<=90);assert(d.miles>.2);
 });
 await test('poor, invalid, stale, impossible and future points never become start',async()=>{
  const s=await setup();const good=s.last;
  await s.j.recordShiftPoints(s.e.data.client_id,[{...good,latitude:NaN},{...good,accuracy:-1,timestamp:clock+1},{...good,accuracy:NaN,timestamp:clock+2},{...good,accuracy:90,timestamp:clock+3},{...good,timestamp:clock+120000}]);
  await s.send(500,5,0,{accuracy:40});await s.send(0,5,0,{accuracy:40});await s.send(0,5,0);
  await s.drive();const d=(await s.read()).detector;assert(d.driving);assert.equal(d.first.accuracy,5);assert.equal(d.first.latitude,40);
 });
 await test('short red light resumes the same segment and clears candidate stop',async()=>{
  const s=await setup();await s.drive();const start=(await s.read()).detector.start;
  await s.stop();await s.wait(90);assert((await s.read()).detector.stopPoint);
  await s.drive();const e=await s.read();assert(e.detector.driving);assert.equal(e.detector.start,start);assert.equal(e.data.segments.length,0);assert.equal(e.detector.stopPoint,undefined);
 });
 await test('five-minute railroad stop remains one segment with no stop mileage',async()=>{
  const s=await setup();await s.drive();await s.stop();const miles=(await s.read()).detector.miles;
  await s.wait(300);assert.equal((await s.read()).detector.miles,miles);
  await s.drive();await s.stop();await s.wait(370);const e=await s.read();
  assert.equal(e.data.segments.length,1);assert(e.data.segments[0].distance_miles>.35);assert(e.data.segments[0].distance_miles<.40);
 });
 await test('stop-and-go congestion does not fragment or duplicate mileage',async()=>{
  const s=await setup();await s.drive();for(let i=0;i<5;i++){await s.stop();await s.wait(120);await s.drive();}
  await s.stop();await s.wait(370);const segments=(await s.read()).data.segments;
  assert.equal(segments.length,1);assert(Math.abs(segments[0].distance_miles-1800/1609.344)<.03);
 });
 await test('stationary GPS drift cannot add miles, move endpoint or restart driving',async()=>{
  const s=await setup();await s.drive();const stop=await s.stop(),miles=(await s.read()).detector.miles;
  await s.wait(300,5);const d=(await s.read()).detector;
  assert.equal(d.miles,miles);assert.deepEqual(d.stopPoint,stop);assert.equal(d.stoppedSince,stop.timestamp);
 });
 await test('confirmed stop uses original arrival coordinates and time',async()=>{
  const s=await setup();await s.drive();const arrival=await s.send(s.x+50,5,0);
  await s.wait(370,3);const e=await s.read();assert.equal(e.data.segments.length,1);
  const segment=e.data.segments[0];assert.equal(segment.end_lat,arrival.latitude);assert.equal(segment.ended_at,new Date(arrival.timestamp).toISOString());assert(!e.detector.driving);
 });
 await test('six-minute threshold retains a five-minute stop and finalizes at six',async()=>{
  const s=await setup();await s.drive();const arrival=await s.stop();await s.wait(350);
  assert.equal((await s.read()).data.segments.length,0);assert((await s.read()).detector.driving);
  await s.wait(10);const segments=(await s.read()).data.segments;assert.equal(segments.length,1);
  assert.equal(segments[0].ended_at,new Date(arrival.timestamp).toISOString());
 });
 await test('two sustained stops produce two legitimate drives',async()=>{
  const s=await setup();await s.drive();await s.stop();await s.wait(370);
  await s.drive();await s.stop();await s.wait(370);const seg=(await s.read()).data.segments;
  assert.equal(seg.length,2);assert.notEqual(seg[0].client_id,seg[1].client_id);assert(seg[0].ended_at<seg[1].started_at);
 });
 await test('planned end waits through driving and temporary stop then ends once',async()=>{
  const s=await setup(new Date(clock+45000).toISOString());await s.drive();await s.stop();await s.wait(300);
  assert.equal(await s.j.autoEndIfDue('1',false),false);assert.equal((await s.read()).data.ended_at,null);
  await s.drive();const arrival=await s.stop();await s.wait(370);
  const e=await s.read();assert(e.autoEnded);assert(e.data.ended_at);assert.equal(e.data.segments.length,1);assert.equal(e.data.segments[0].ended_at,new Date(arrival.timestamp).toISOString());
  assert(await s.j.claimEndedNotice('1',s.e.data.client_id));assert.equal(await s.j.claimEndedNotice('1',s.e.data.client_id),false);
 });
 await test('restart during temporary stop preserves candidate, miles and one segment',async()=>{
  const s=await setup();await s.drive();const stop=await s.stop();await s.wait(300);const before=await s.read();
  s.restart();await s.j.setShiftRecording('1');assert.deepEqual((await s.read()).detector,before.detector);
  await s.wait(70);const e=await s.read();assert.equal(e.data.segments.length,1);assert.equal(e.data.segments[0].end_lat,stop.latitude);
  await s.j.recordShiftPoints(s.e.data.client_id,[s.last]);assert.equal((await s.read()).data.segments.length,1);
 });
 await test('GPS silence neither finalizes nor adds an unobserved connecting line',async()=>{
  const s=await setup(new Date(clock+60000).toISOString());await s.drive();const miles=(await s.read()).detector.miles;
  clock+=600000;s.restart();await s.j.setShiftRecording('1');assert.equal((await s.read()).data.segments.length,0);assert.equal(await s.j.autoEndIfDue('1',false),false);
  await s.send(s.x+5000,5,10);assert.equal((await s.read()).detector.miles,miles);
  await s.drive();await s.stop();await s.wait(370);assert.equal((await s.read()).data.segments.length,1);
 });
 await test('gap during possible stop restarts observation confidence',async()=>{
  const s=await setup();await s.drive();await s.stop();await s.wait(300);clock+=300000;
  await s.stop();assert.equal((await s.read()).data.segments.length,0);await s.wait(130);assert.equal((await s.read()).data.segments.length,0);
  await s.wait(240);assert.equal((await s.read()).data.segments.length,1);
 });
 await test('high native speed and poor accuracy cannot confirm a stop on time alone',async()=>{
  const s=await setup();await s.drive();await s.stop();const x=s.x;
  for(let i=0;i<80;i++)await s.send(x,10,10);
  assert.equal((await s.read()).data.segments.length,0);
  for(let i=0;i<80;i++)await s.send(x,10,0,{accuracy:40});
  assert.equal((await s.read()).data.segments.length,0);await s.stop();await s.wait(370);assert.equal((await s.read()).data.segments.length,1);
 });
 await test('missing native speed uses displacement; it does not require a new sensor',async()=>{
  const s=await setup();for(let i=0;i<6;i++)await s.send(s.x+50,5,-1);
  await s.send(s.x,5,-1);for(let i=0;i<74;i++)await s.send(s.x,10,-1);
  assert.equal((await s.read()).data.segments.length,1);
 });
 await test('Save Trips sync carries detected boundaries with idempotent retries',async()=>{
  const s=await setup();await s.drive();const arrival=await s.stop();await s.wait(370);
  const original=(await s.read()).data.segments[0];await s.j.editShift('1',s.e.data.client_id,e=>{e.data.segments[0].reviewed=true;});await s.j.requestTripSave('1',s.e.data.client_id);
  s.h.load('expo-location').reverseGeocodeAsync=async({latitude})=>[{name:String(latitude)}];
  const sync=s.h.load('@/features/shifts/sync');s.h.state.lostResponse=true;await assert.rejects(sync.syncShifts());
  const pending=await s.j.prepareShiftUpload('1');s.h.state.lostResponse=false;await sync.syncShifts();await sync.syncShifts();
  const segment=s.h.state.remoteShifts[0].segments[0];assert.equal(segment.start_lat,original.start_lat);assert.equal(segment.end_lat,arrival.latitude);assert.equal(segment.end_address,String(arrival.latitude));assert(segment.save_requested);assert.equal(s.h.state.remoteShifts.length,1);assert.deepEqual(segment,pending.segments[0]);
 });
 await test('shared background callback uses the detector and preserves manual consumer',async()=>{
  const h=harness(),engine=h.engine(),j=h.load('@/features/shifts/journal');await engine.startShiftRecording('1','spark',new Date(clock+30000).toISOString());
  await engine.startRecording('1',{category:'business',platform:'spark',trackingMethod:'manual'});
  const start=clock;
  for(let i=0;i<7;i++){clock+=5000;const p={...h.point(i*5,clock),speed:10};await h.tasks.get(engine.TRIP_LOCATION_TASK)({data:{locations:[h.location(p)]}});}
  assert((await j.activeShift('1')).detector.driving);
  for(let i=0;i<75;i++){clock+=10000;await h.tasks.get(engine.TRIP_LOCATION_TASK)({data:{locations:[h.location({...h.point(30,clock),speed:0})]}});}
  assert(h.state.native);assert(await h.journal().getActiveTrip('1'));const shift=await j.activeShift('1');assert(shift);assert.equal(shift.data.segments.length,1);assert(Date.parse(shift.data.segments[0].started_at)>=start);
  await engine.endShiftRecording('1',shift.data.client_id);assert(h.state.native);
 });
 await test('moderate-speed driving with 25m accuracy is not lost to per-hop noise',async()=>{
  const s=await setup();await s.send(0,5,0,{accuracy:25});
  for(let i=0;i<10;i++)await s.send(s.x+20,5,4,{accuracy:25});
  assert((await s.read()).detector.driving);assert((await s.read()).detector.miles>.09);
 });
 await test('next drive starts from retained stationary anchor after finalization',async()=>{
  const s=await setup();await s.drive();await s.stop();await s.wait(360);
  const anchor=s.last;assert.equal((await s.read()).data.segments.length,1);
  await s.drive();const d=(await s.read()).detector;assert(d.driving);assert.equal(d.first.latitude,anchor.latitude);assert.equal(d.start,anchor.timestamp);
 });
 await test('legacy GPS-gap waiting flag can recover without inventing another segment',async()=>{
  const s=await setup(new Date(clock+10000).toISOString());
  await s.j.editShift('1',s.e.data.client_id,e=>{e.waitingForStop=true;});
  await s.stop();await s.wait(370);const e=await s.read();assert(e.autoEnded);assert.equal(e.data.segments.length,0);
 });
 await test('slow queue movement resumes without losing its measured distance',async()=>{
  const s=await setup();await s.drive();await s.stop();await s.wait(60);const before=(await s.read()).detector.miles;
  for(let i=0;i<20;i++)await s.send(s.x+5,5,1);
  const e=await s.read();assert.equal(e.data.segments.length,0);assert.equal(e.detector.stopPoint,undefined);assert(e.detector.miles-before>.05);assert(e.detector.miles-before<.075);
 });
 await test('wandering stationary fixes cannot create a drive from idle',async()=>{
  const s=await setup();for(let i=0;i<50;i++)await s.send(i%2?20:-20,5,0);
  const e=await s.read();assert(!e.detector.driving);assert.equal(e.detector.miles,0);assert.equal(e.data.segments.length,0);
 });
 await test('delayed background batches use sample time rather than delivery time',async()=>{
  const s=await setup();const start=clock,points=[];
  for(let i=1;i<=6;i++)points.push({latitude:40+i*50/111195,longitude:-74,timestamp:start+i*5000,accuracy:5,speed:10,heading:0});
  const arrival={...points.at(-1),timestamp:start+35000,speed:0};points.push(arrival);
  for(let i=1;i<=73;i++)points.push({...arrival,timestamp:arrival.timestamp+i*10000});
  clock=points.at(-1).timestamp+300000;await s.j.setShiftRecording('1');await s.j.recordShiftPoints(s.e.data.client_id,points);
  const e=await s.read();assert.equal(e.data.segments.length,1);assert.equal(e.data.segments[0].ended_at,new Date(arrival.timestamp).toISOString());
 });
 await test('failed checkpoint leaves prior state and replay finalizes only once',async()=>{
  const s=await setup();await s.drive();await s.stop();await s.wait(350);const before=await s.read();
  s.h.state.failWrite=true;await assert.rejects(s.send(s.x,10,0));s.h.state.failWrite=false;assert.deepEqual(await s.read(),before);
  await s.j.recordShiftPoints(s.e.data.client_id,[s.last]);await s.j.recordShiftPoints(s.e.data.client_id,[s.last]);assert.equal((await s.read()).data.segments.length,1);
 });
 console.log(`${count} deterministic Shift detection groups passed`);
}finally{Date.now=original;}})().catch(e=>{console.error(e);process.exitCode=1;});
