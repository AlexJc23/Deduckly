/* global __dirname */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(mocks={}) {
 const cache={};
 function load(file){
  file=path.normalize(file);if(cache[file])return cache[file];
  const module={exports:{}};
  const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',code)(name=>{
   if(Object.hasOwn(mocks,name))return mocks[name];
   if(name.startsWith('.'))return load(path.join(path.dirname(file),name)+'.ts');
   throw Error('Unexpected import '+name);
  },module,module.exports);return cache[file]=module.exports;
 }
 return load;
}
const load=loader(),{createVehicleCatalog}=load('src/features/vehicles/catalog-flow.ts');
const {parseFuelPrice,createFuelPriceSaver,withFuelPrice}=load('src/features/vehicles/fuel-price-input.ts');
const {analyzeIntegratedOffer}=load('src/features/offer-analyzer/utils/integrated.ts');
const empty={year:0,make:'',model:'',trim:null,fuel_type:'gasoline',city_mpg:null,highway_mpg:null,combined_mpg:null,custom_mpg:null,kwh_per_100_miles:null,epa_id:null,is_default:true};
const detail=id=>({...empty,year:2020,make:'Test',model:'Car',trim:id==='101'?'Automatic / Front-Wheel Drive':'Automatic / All-Wheel Drive',epa_id:id,city_mpg:25,highway_mpg:35,combined_mpg:id==='101'?29:22});
const items=(...values)=>values.map(value=>({text:value,value}));
let groups=0;async function test(name,fn){await fn();groups++;console.log('PASS '+name);}
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 await test('progressive EPA chain, engine variants, defaults and explicit save boundary',async()=>{
  const calls=[];const flow=createVehicleCatalog(empty,async(p,params)=>{
   calls.push({p,params});
   if(p.endsWith('/year'))return items('2020','2021');
   if(p.endsWith('/make'))return items('Test');
   if(p.endsWith('/model'))return items('Car');
   if(p.endsWith('/options'))return [{text:'2.0 L FWD Automatic',value:'101'},{text:'3.0 L AWD Automatic',value:'102'}];
   return detail(p.split('/').pop());
  },()=>{});
  await flow.start();await flow.year('2020');await flow.make('Test');await flow.model('Car');
  assert.equal(flow.getState().configurations.length,2);assert(!flow.getState().ready);
  await flow.configuration('101');assert.equal(flow.getState().draft.combined_mpg,29);
  assert(flow.getState().draft.trim.includes('2.0 L'));assert(flow.getState().draft.is_default);
  await flow.configuration('102');assert.equal(flow.getState().draft.combined_mpg,22);
  assert(flow.getState().draft.trim.includes('AWD'));
  await flow.configuration('102');assert.equal(calls.length,6);
  assert(calls.every(c=>c.p.includes('/catalog')),'Selection must not save the vehicle');
 });
 await test('dependent selections and old economy reset, no duplicate menu requests',async()=>{
  let requests=0;const flow=createVehicleCatalog(detail('101'),async(p)=>{requests++;return p.endsWith('/options')?items('101','102'):items('2020','Test','Car');},()=>{});
  await flow.start();const prior=requests;await flow.year('2021');
  assert.equal(flow.getState().draft.make,'');assert.equal(flow.getState().draft.combined_mpg,null);
  assert.equal(flow.getState().draft.epa_id,null);assert.equal(flow.getState().models.length,0);
  await flow.year('2020');assert.equal(requests,prior+1);
  await flow.year('2020');assert.equal(requests,prior+1);
 });
 await test('late earlier-year response cannot overwrite newer choices',async()=>{
  const pending={};const flow=createVehicleCatalog(empty,(p,params)=>new Promise(resolve=>{pending[params.year]=resolve;}),()=>{});
  const first=flow.year('2020'),second=flow.year('2021');
  pending[2021](items('New make'));await second;
  pending[2020](items('Old make'));await first;
  assert.equal(flow.getState().draft.year,2021);assert.deepEqual(flow.getState().makes,items('New make'));assert(!flow.getState().loading);
 });
 await test('late configuration response cannot replace a new year or canceled form',async()=>{
  let finish;let updates=0;
  const flow=createVehicleCatalog({...detail('101'),epa_id:null},p=>p.includes('catalog-details')?new Promise(r=>{finish=r;}):Promise.resolve(items('Test')),()=>{updates++;});
  const pending=flow.configuration('101');await flow.year('2021');finish(detail('101'));await pending;
  assert.equal(flow.getState().draft.year,2021);assert.equal(flow.getState().draft.combined_mpg,null);
  let resolve;const disposed=createVehicleCatalog(empty,()=>new Promise(r=>{resolve=r;}),()=>{updates++;});
  const start=disposed.start();disposed.dispose();const before=updates;resolve(items('2020'));await start;assert.equal(updates,before);
 });
 await test('single configuration auto-loads EPA economy without an extra selection',async()=>{
  const flow=createVehicleCatalog({...empty,year:2020,make:'Test'},async p=>p.endsWith('/options')?items('101'):detail('101'),()=>{});
  await flow.model('Car');assert(flow.getState().ready);assert.equal(flow.getState().draft.combined_mpg,29);
 });
 await test('editing preserves saved override; unavailable lookup leaves manual fallback',async()=>{
  const initial={...detail('101'),custom_mpg:31};
  const flow=createVehicleCatalog(initial,async()=>{throw Error('offline');},()=>{});
  await flow.start();assert(flow.getState().error);assert.equal(flow.getState().draft.custom_mpg,31);assert(flow.getState().ready);
  flow.manual(true);flow.change('custom_mpg',32);assert.equal(flow.getState().draft.custom_mpg,32);assert(flow.getState().manual);
  flow.change('model','Different car');assert.equal(flow.getState().draft.epa_id,null);assert.equal(flow.getState().draft.combined_mpg,null);assert.equal(flow.getState().draft.custom_mpg,32);
  const blank=createVehicleCatalog(empty,async()=>[],()=>{});await blank.start();assert(blank.getState().error.includes('No matching'));
  blank.manual(true);blank.change('make','Manual');blank.change('model','Car');blank.change('year',2020);
  assert.equal(blank.getState().draft.make,'Manual');
 });
 await test('manual fallback during configuration lookup never carries old EPA economy',async()=>{
  let finish;const flow=createVehicleCatalog(detail('101'),()=>new Promise(r=>{finish=r;}),()=>{});
  const lookup=flow.configuration('102');assert.equal(flow.getState().draft.combined_mpg,null);
  flow.manual(true);assert.equal(flow.getState().draft.epa_id,null);
  finish(detail('102'));await lookup;assert.equal(flow.getState().draft.combined_mpg,null);assert(flow.getState().manual);
 });
 await test('failed configuration can be selected again; requests are retried safely',async()=>{
  let attempt=0;const flow=createVehicleCatalog({...empty,year:2020,make:'Test',model:'Car'},async()=>{if(++attempt===1)throw Error('offline');return detail('101');},()=>{});
  await flow.configuration('101');assert(!flow.getState().ready);
  await flow.configuration('101');assert(flow.getState().ready);assert.equal(attempt,2);
 });
 await test('blank price is valid; invalid prices cannot be persisted',async()=>{
  assert.deepEqual(parseFuelPrice(''),{valid:true,price:null});assert.equal(parseFuelPrice('3,259').price,3.259);assert(parseFuelPrice('0').valid);assert.equal(parseFuelPrice('.18').price,.18);assert(parseFuelPrice('.18').valid);
  for(const input of ['-1','101','NaN','1e2','.','2.55555'])assert(!parseFuelPrice(input).valid);
  const saves=[];const save=createFuelPriceSaver(async v=>saves.push(v));
  for(const v of ['', '-1','NaN'])await save(v);assert.equal(saves.length,0);
  await Promise.all([save('3.25'),save('3.250')]);assert.deepEqual(saves,['3.25']);
  await save('4');await save('3.25');assert.deepEqual(saves,['3.25','4','3.25']);
  const clear=createFuelPriceSaver(async v=>saves.push(v),true);await clear('');assert.equal(saves.at(-1),'');
 });
 await test('a failed committed price can retry without losing the valid value',async()=>{
  let calls=0;const save=createFuelPriceSaver(async()=>{if(++calls===1)throw Error('disk');});
  await assert.rejects(save('3.25'));await save('3.25');assert.equal(calls,2);
 });
 await test('price changes the unified verdict; blank excludes fuel; extra miles default zero',async()=>{
  const a={economy:25,price:3.25,fuelType:'gasoline',vehicle:'Test Car',source:'Saved manual fuel price'};
  const offer={payout:20.8,distance:10,additionalMiles:0};
  assert.equal(analyzeIntegratedOffer(offer,null,withFuelPrice(a,1,true)).verdict,'great');
  const higher=analyzeIntegratedOffer(offer,null,withFuelPrice(a,4,true));assert.equal(higher.verdict,'good');assert.equal(higher.fuel.cost,1.6);
  const blank=analyzeIntegratedOffer(offer,null,withFuelPrice(a,null,true));assert.equal(blank.fuel.cost,null);assert(blank.reasons.at(-1).includes('gross-only'));
  assert.equal(blank.fuel.drivingMiles,10);
 });
 // Execute the actual price-editor hook with a small deterministic hook harness.
 function harness(){
  const slots=[];let cursor=0,effects=[];
  const equal=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
  const react={
   useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
   useRef(value){const i=cursor++;return slots[i]??(slots[i]={current:value});},
   useMemo(fn,deps){const i=cursor++;if(!slots[i]||!equal(slots[i].deps,deps))slots[i]={value:fn(),deps};return slots[i].value;},
   useEffect(fn,deps){const i=cursor++;if(!slots[i]||!equal(slots[i].deps,deps)){slots[i]={deps};effects.push(fn);}},
  };
  const hook=loader({react})('src/features/vehicles/use-fuel-price-editor.ts').useFuelPriceEditor;
  return (initial,scope,save)=>{cursor=0;const result=hook(initial,scope,save);const ready=effects;effects=[];ready.forEach(fn=>fn());return result;};
 }
 await test('saved price prefills, typing makes no saves, blur/Analyze commit once',async()=>{
  const render=harness(),saves=[],save=async v=>saves.push(v);
  let field=render('3.25','A:gasoline',save);assert.equal(field.value,'3.25');
  field.change('4');field=render('3.25','A:gasoline',save);assert.equal(saves.length,0);
  field.commit();field.commit();await tick();assert.deepEqual(saves,['4']);
  field=render('4','A:gasoline',save);field.change('');field=render('4','A:gasoline',save);
  field.commit();await tick();assert.equal(saves.length,1);assert.equal(field.parsed.price,null);
 });
 await test('asynchronous provider prefill cannot overwrite typing; account switch clears price',async()=>{
  const render=harness(),save=async()=>{};
  let field=render('','A:gasoline',save);render('3.2','A:gasoline',save);field=render('3.2','A:gasoline',save);assert.equal(field.value,'3.2');
  field.change('4');render('3.3','A:gasoline',save);field=render('3.3','A:gasoline',save);assert.equal(field.value,'4');
  field=render('','B:gasoline',save);assert.equal(field.value,'');assert(!field.dirty);
  field=render('.18','B:electric',save);assert.equal(field.value,'.18');
 });
 await test('pending saves retain their original account callback',async()=>{
  const render=harness(),calls=[];
  let a=render('3.25','A:gasoline',async v=>calls.push(['A',v]));a.change('4');a=render('3.25','A:gasoline',async v=>calls.push(['A',v]));a.commit();
  const b=render('','B:gasoline',async v=>calls.push(['B',v]));assert.equal(b.value,'');await tick();assert.deepEqual(calls,[['A','4']]);
 });
 const form=fs.readFileSync(path.join(root,'src/features/offer-analyzer/components/OfferForm.tsx'),'utf8');
 assert(!form.includes('Additional / return miles'));assert(form.includes('Current Gas Price (optional)'));assert(form.includes('additionalMiles: 0'));
 assert(!fs.readFileSync(path.join(root,'app/settings/vehicles.tsx'),'utf8').includes('Find year'));
 console.log(`PASS ${groups} vehicle UX and committed-price groups`);
})().catch(e=>{console.error(e);process.exitCode=1;});
