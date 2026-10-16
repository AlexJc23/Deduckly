/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..'), ts = require('typescript'), cache = {};
function load(file) {
 file=path.normalize(file);
 if(cache[file])return cache[file];
 const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',code)(name=>{
  assert(name.startsWith('.'),'Unexpected dependency '+name);
  return load(path.join(path.dirname(file),name)+'.ts');
 },module,module.exports);
 return cache[file]=module.exports;
}
const {analyzeIntegratedOffer:analyze}=load('src/features/offer-analyzer/utils/integrated.ts');
const {analyzeOffer:legacy}=load('src/features/offer-analyzer/utils/verdict.ts');
const {analyzePremiumOffer:legacyPro}=load('src/features/offer-analyzer/utils/premium.ts');
const {fuelAssumptions}=load('src/features/vehicles/assumptions.ts');
const a={economy:25,price:3.25,fuelType:'gasoline',vehicle:'Test Car',source:'Saved manual fuel price'};
const prefs={costPerMile:0,minimumProfit:12,minimumHourRate:20,minimumDollarsPerMile:1.9,preferredMaxDistance:30};
let count=0;
function test(name,fn){fn();count++;console.log('PASS '+name);}
test('requested $15 / 20mi example',()=>{
 const r=analyze({payout:15,distance:20},null,a);
 assert.equal(r.fuel.cost,2.60);assert.equal(r.fuel.afterFuel,12.40);assert.equal(r.dollarsPerMile,.62);
});
test('fuel changes Free verdict, not just presentation',()=>{
 const input={payout:20,distance:10};
 assert.equal(legacy(input).verdict,'great');assert.equal(analyze(input,null,a).verdict,'good');
});
test('fuel changes Pro recommendation with unchanged targets',()=>{
 const input={payout:20,distance:10};
 assert.equal(legacyPro(input,prefs).recommendation,'accept');
 const r=analyze(input,prefs,a);assert.equal(r.recommendation,'consider');
 const check=r.premiumChecks.find(c=>c.title==='Dollars Per Mile');
 assert.equal(check.target,1.9);assert.equal(check.actual,1.87);assert(!check.passed);
});
test('total vehicle cost never adds fuel twice',()=>{
 const r=analyze({payout:20,distance:10,estimatedTime:30},{...prefs,costPerMile:.5},a);
 assert.equal(r.vehicleCost,5);assert.equal(r.estimatedProfit,15);assert.equal(r.profitHourlyRate,30);
 assert.equal(r.fuel.cost,1.3);assert.equal(r.fuel.afterFuel,18.7);
 const floor=analyze({payout:20,distance:10},{...prefs,costPerMile:.05},a);
 assert.equal(floor.vehicleCost,1.3);assert.equal(floor.estimatedProfit,18.7);
});
test('gross-only fallback preserves existing Free and Pro rules',()=>{
 for(const input of [{payout:18.5,distance:7.2},{payout:5,distance:10,estimatedTime:30}]){
  for(const [p,old] of [[null,legacy(input)],[prefs,legacyPro(input,prefs)]]){
   const r=analyze(input,p,null);assert.equal(r.fuel.cost,null);
   const {fuel,reasons,...rest}=r;const {reasons:oldReasons,...oldRest}=old;
   assert.deepEqual(rest,oldRest);assert.deepEqual(reasons.slice(0,-1),oldReasons);
   assert(reasons.at(-1).includes('gross-only'));
  }
 }
});
test('missing/invalid economy or price explicitly falls back',()=>{
 for(const patch of [{economy:null},{economy:0},{price:null},{price:NaN},{price:-1},{fuelType:'other'}]){
  const r=analyze({payout:20,distance:10},null,{...a,...patch});
  assert.equal(r.fuel.cost,null);assert.equal(r.verdict,'great');
 }
});
test('optional duration stays optional; actual duration produces adjusted hourly',()=>{
 const no=analyze({payout:20,distance:10},prefs,a);
 assert.equal(no.hourlyRate,null);assert.equal(no.profitHourlyRate,null);
 assert(!no.premiumChecks.some(c=>c.title==='Hourly Earnings'));
 assert.equal(analyze({payout:20,distance:10,estimatedTime:30},null,a).hourlyRate,37.4);
 assert.throws(()=>analyze({payout:20,distance:10,estimatedTime:-1},null,a));
 assert.throws(()=>analyze({payout:20,distance:0},null,a));
});
test('optional additional miles count exactly once and validate',()=>{
 const r=analyze({payout:15,distance:10,additionalMiles:10},null,a);
 assert.equal(r.fuel.cost,2.6);assert.equal(r.fuel.drivingMiles,20);assert.equal(r.dollarsPerMile,.62);
 const pro=analyze({payout:15,distance:10,additionalMiles:10},{...prefs,preferredMaxDistance:15},a);
 assert.equal(pro.premiumChecks.find(c=>c.title==='Trip Distance').actual,20);
 for(const additionalMiles of [-1,NaN,Infinity])assert.throws(()=>analyze({payout:15,distance:10,additionalMiles},null,a));
});
test('gasoline diesel hybrid and EV use the unified verdict',()=>{
 for(const fuelType of ['gasoline','diesel','hybrid'])assert.equal(analyze({payout:15,distance:20},null,{...a,fuelType}).fuel.cost,2.6);
 const ev=analyze({payout:15,distance:20},null,{...a,fuelType:'electric',economy:25,price:.2});
 assert.equal(ev.fuel.cost,1);assert.equal(ev.dollarsPerMile,.7);
});
test('cost above payout safely declines, no fabricated profit',()=>{
 const r=analyze({payout:1,distance:20},null,a);assert.equal(r.fuel.afterFuel,-1.6);assert.equal(r.verdict,'skip');
});
const vehicle={id:'v',year:2020,make:'Test',model:'Car',fuel_type:'gasoline',combined_mpg:25,custom_mpg:null,is_default:true,deleted:false};
const journal={version:1,owner:'A',vehicles:[vehicle],pending:[],prices:{gasoline:'3.25'},quotes:{},postalCode:'30301'};
test('default vehicle automatic for both tiers; changed default updates next analysis',()=>{
 for(const pro of [false,true]){
  const r=analyze({payout:15,distance:20},null,fuelAssumptions(journal,pro));assert.equal(r.fuel.cost,2.6);
  const changed={...journal,vehicles:[{...vehicle,is_default:false},{...vehicle,id:'v2',combined_mpg:50}]};
  assert.equal(analyze({payout:15,distance:20},null,fuelAssumptions(changed,pro)).fuel.cost,1.3);
 }
});
test('manual preference wins; Pro valid cache works; stale cache unavailable',()=>{
 const quote={fuel_type:'gasoline',unit:'USD/US-gallon',price:4,source:'Licensed test provider',location:'30301',observed_at:new Date(Date.now()-3600000).toISOString()};
 const j={...journal,quotes:{'30301:gasoline':quote}};
 assert.equal(fuelAssumptions(j,true).price,3.25);
 const automatic={...j,prices:{}};
 assert.equal(fuelAssumptions(automatic,true).price,4);assert.equal(fuelAssumptions(automatic,false).price,null);
 assert.equal(fuelAssumptions({...automatic,quotes:{'30301:gasoline':{...quote,observed_at:new Date(Date.now()-90000000).toISOString()}}},true).price,null);
 const stale={...a,observedAt:new Date(Date.now()-90000000).toISOString(),source:'Licensed provider'};
 assert.equal(analyze({payout:20,distance:10},null,stale).fuel.cost,null);
});
test('offline saved data is sufficient; no user or vehicle means no private assumptions',()=>{
 assert.equal(analyze({payout:15,distance:20},null,fuelAssumptions(journal,false)).fuel.afterFuel,12.4);
 assert.equal(fuelAssumptions(null,true),null);assert.equal(fuelAssumptions({...journal,vehicles:[]},true),null);
});
test('one Analyzer, no per-offer vehicle/MPG controls; Settings entry preserved',()=>{
 const screen=fs.readFileSync(path.join(root,'app/offer-analyzer/screens/OfferAnalyzerScreen.tsx'),'utf8');
 assert(screen.includes('analyzeIntegratedOffer'));assert(!screen.includes('EnergyPanel'));
 assert(!screen.includes('Picker'));assert(!screen.includes('saveLocalVehicle'));
 assert(fs.readFileSync(path.join(root,'app/(tabs)/settings.tsx'),'utf8').includes('/settings/vehicles'));
 assert(fs.readFileSync(path.join(root,'app/screens/PreferenceScreen.tsx'),'utf8').includes('<FuelPreferences'));
 const editor=fs.readFileSync(path.join(root,'app/settings/vehicles.tsx'),'utf8');
 assert(editor.includes('<VehicleForm'));
 assert(!editor.includes('Find year'));
 assert(fs.readFileSync(path.join(root,'src/features/vehicles/VehicleForm.tsx'),'utf8').includes('onSave(d)'));
});
console.log(`PASS ${count} unified fuel integration checks`);
