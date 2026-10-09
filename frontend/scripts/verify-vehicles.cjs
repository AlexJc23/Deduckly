/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root,'node_modules/typescript'));
function loader(mocks = {}) {
 const cache = {};
 function load(file) {
  if (cache[file]) return cache[file];
  const module = {exports:{}};
  const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',code)(name => {
   if(Object.hasOwn(mocks,name)) return mocks[name];
   if(name.startsWith('.')) return load(path.join(path.dirname(file),name)+'.ts');
   throw Error('Unexpected dependency '+name);
  },module,module.exports);
  return cache[file]=module.exports;
 }
 return load;
}
const energy=loader()('src/features/vehicles/energy.ts');
const base={payout:18.5,miles:7.2,economy:30,price:3.5,fuelType:'gasoline'};
for(const fuelType of ['gasoline','diesel','hybrid']) {
 assert.deepEqual(energy.estimateEnergy({...base,fuelType}),{drivingMiles:7.2,cost:.84,afterFuel:17.66});
}
assert.deepEqual(energy.estimateEnergy({...base,fuelType:'electric',economy:25,price:.16}),{drivingMiles:7.2,cost:.29,afterFuel:18.21});
assert.equal(energy.estimateEnergy({...base,additionalMiles:7.2}).cost,1.68);
assert.equal(energy.estimateEnergy({...base,price:0}).cost,0);
for(const change of [{miles:0},{miles:-1},{economy:0},{economy:null},{price:null},{price:-1},{price:NaN},{additionalMiles:-1},{fuelType:'other'}]) assert.equal(energy.estimateEnergy({...base,...change}),null);
const vehicle={id:'v',fuel_type:'gasoline',combined_mpg:25,custom_mpg:32,is_default:true,deleted:false};
assert.equal(energy.effectiveEconomy(vehicle),32);
assert.equal(energy.defaultVehicle([vehicle],false),null);
assert.equal(energy.defaultVehicle([vehicle],true),vehicle);
assert.equal(energy.defaultVehicle([{...vehicle,deleted:true}],true),null);
const now=Date.now(), quote={price:3,unit:'USD/US-gallon',fuel_type:'gasoline',source:'Test',location:'Test',observed_at:new Date(now-3600000).toISOString()};
assert(energy.usableQuote(quote,'gasoline',now));
assert(!energy.usableQuote(quote,'electric',now));
assert(!energy.usableQuote({...quote,observed_at:new Date(now-25*3600000).toISOString()},'gasoline',now));
assert(!energy.usableQuote({...quote,observed_at:new Date(now+1).toISOString()},'gasoline',now));
console.log('PASS fuel/EV math, overrides, additional mileage, missing/invalid values, Free/Pro default selection, quote age/units');
(async()=>{
 const disk=new Map(); let owner='A',generation=1,fail=false, responseLost=false, puts=0;
 const server=new Map(), operations=new Set();
 const mocks={
  '@react-native-async-storage/async-storage':{getItem:async k=>disk.get(k)??null,setItem:async(k,v)=>disk.set(k,v)},
  '@/features/auth/services/auth-service.service':{getAccessToken:async()=>owner},
  '@/features/tracking/services/tracking-owner':{trackingOwnerFromToken:x=>x},
  '@/features/auth/services/account-boundary':{getAccountGeneration:()=>generation,isAccountChanging:()=>false},
  '@/api/client':{api:{
   put:async(url,data,config)=>{
    assert.equal(config.deducklyOwnerId,owner); if(fail) throw Error('Offline'); puts++;
    const id=url.split('/').pop();
    if(!operations.has(data.operation_id)) {
     if(data.is_default) for(const v of server.values()) v.is_default=false;
     server.set(id,{...data,id,version:data.expected_version+1});operations.add(data.operation_id);
    }
    if(responseLost){responseLost=false;throw Error('Response lost');}
    return {data:server.get(id)};
   },get:async()=>({data:[...server.values()]})}},
 };
 let store=loader(mocks)('src/features/vehicles/store.ts');
 const data={year:2020,make:'Test',model:'Car',trim:null,fuel_type:'gasoline',city_mpg:null,highway_mpg:null,combined_mpg:25,custom_mpg:null,kwh_per_100_miles:null,epa_id:null,is_default:true};
 await store.saveLocalVehicle('A',data);
 let j=await store.readVehicles('A');const id=j.vehicles[0].id;
 await store.saveLocalVehicle('A',{...data,custom_mpg:30},id);
 await store.savePrice('A','gasoline','3.45');
 fail=true;await assert.rejects(store.syncVehicles('A')); assert.equal((await store.readVehicles('A')).pending.length,2);
 store=loader(mocks)('src/features/vehicles/store.ts'); // process restart, persisted outbox
 assert.equal((await store.readVehicles('A')).vehicles[0].custom_mpg,30);
 owner='B';generation++;
 assert.equal((await store.readVehicles('B')).vehicles.length,0);
 assert.equal((await store.readVehicles('B')).prices.gasoline,undefined);
 await assert.rejects(store.syncVehicles('A'));assert.equal(puts,0);
 owner='A';generation++;fail=false;responseLost=true;
 await assert.rejects(store.syncVehicles('A'));assert.equal(server.size,1);
 await store.syncVehicles('A');assert.equal(server.size,1);assert.equal(server.get(id).version,2);
 assert.equal((await store.readVehicles('A')).pending.length,0);
 assert.equal((await store.readVehicles('A')).prices.gasoline,'3.45');
 await store.saveLocalVehicle('A',data,id,true);await store.syncVehicles('A');
 assert.equal((await store.readVehicles('A')).vehicles.filter(v=>!v.deleted).length,0);
 assert.equal(server.size,1);
 // Late response after an account boundary cannot acknowledge or import A data.
 await store.saveLocalVehicle('A',data);
 mocks['@/api/client'].api.put=async()=>{owner='B';generation++;return {data:{}};};
 await assert.rejects(store.syncVehicles('A'));assert.equal((await store.readVehicles('A')).pending.length,1);
 assert.equal((await store.readVehicles('B')).vehicles.length,0);
 await store.saveQuote('B','30301',{...quote,fuel_type:'gasoline'});
 assert.equal((await store.readVehicles('B')).quotes['30301:gasoline'].price,3);
 assert.equal((await store.readVehicles('A')).quotes['30301:gasoline'],undefined);
 disk.set('@deduckly/vehicles:v1:C','broken');
 await assert.rejects(store.readVehicles('C'));assert.equal(disk.get('@deduckly/vehicles:v1:C'),'broken');
 console.log('PASS offline save/edit/delete, restart, retained manual prices, owner isolation, response-loss retry, stale response rejection');
})().catch(error=>{console.error(error);process.exitCode=1;});
