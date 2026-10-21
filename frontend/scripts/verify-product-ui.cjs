/* global __dirname */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react'),server=require('react-dom/server'),native=require('react-native-web');
let dark=false,width=320,fontScale=1,handlers=[],selectors=[],slots=[],cursor=0,assumptions=null,calls=[],failSave=false;
const initialTrip={id:7,user_id:1,start_time:'2026-10-10T12:00:00Z',end_time:'2026-10-10T12:30:00Z',distance_miles:'12.4',platform:'lyft',category:'business',start_address:'123 Long Street, Building 400, Suite 250, A very long locality, Georgia 30000',end_address:null};
let trip={...initialTrip}; let entries=[], shiftCalls=[], alerts=[]; const owner='1';
const original=Module._load;
const text=n=>Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):typeof n==='string'||typeof n==='number'?String(n):'';
Module._load=function(id,parent,isMain){
 if(id==='react'&&(parent.filename.endsWith('/app/trips/[id]/index.tsx') || parent.filename.endsWith('/app/shifts.tsx')))return {...React,useState(initial){const index=cursor++;if(!(index in slots))slots[index]=typeof initial==='function'?initial():initial;return[slots[index],v=>{slots[index]=typeof v==='function'?v(slots[index]):v;}];}};
 if(id==='@/theme/icons')return{Ionicons:()=>null};
 if(id==='@/constants/platform-icons')return{platformIcons:{lyft:{uri:'test:lyft'},spark:{uri:'test:spark'},uber:{uri:'test:uber'}},PlatformName:{}};
 if(id==='react-native')return {...native,TextInput:props=>{handlers.push({label:props.accessibilityLabel,...props});return React.createElement(native.TextInput,props);},Alert:{alert:(...args)=>alerts.push(args)},useWindowDimensions:()=>({width,height:800,scale:1,fontScale}),Pressable:props=>{handlers.push({label:props.accessibilityLabel??text(props.children),...props});return React.createElement(native.Pressable,props);}};
 if(id==='@react-native-picker/picker'){const Picker=({children})=>React.createElement('select',{},children);Picker.Item=({label,value})=>React.createElement('option',{value},label);return{Picker};}
 if(id==='@/features/shifts/context')return{useShifts:()=>({owner,entries,syncError:false,sync:async()=>shiftCalls.push('sync')})};
 if(id==='@/features/shifts/notifications')return{requestShiftNotifications:async()=>{}};
 if(id==='@/features/shifts/journal')return{editShift:async(o,id,fn)=>{assert.equal(o,owner);fn(entries.find(e=>e.data.client_id===id));},switchPlatform:async(o,id,p)=>shiftCalls.push(['platform',o,id,p]),requestTripSave:async(o,id)=>shiftCalls.push(['save',o,id])};
 if(id==='@/features/tracking/services/background-tracking')return{getRecordingMode:()=> 'background',subscribeToRecording:()=>()=>{},startShiftRecording:async(o,p,end)=>{shiftCalls.push(['start',o,p,end]);return true;},endShiftRecording:async(o,id)=>shiftCalls.push(['end',o,id])};
 if(id==='react-native-safe-area-context')return{SafeAreaView:native.View};
 if(id==='@react-native-async-storage/async-storage')return{getItem:async()=>null,setItem:async()=>{}};
 if(id==='@/theme/theme'||(id==='./theme'&&parent.filename.includes('/theme/')))return{useAppTheme:()=>({dark})};
 if(id==='expo-router')return{router:{back(){},dismissTo(){}},useLocalSearchParams:()=>({id:'7'})};
 if(id==='@/features/trips/hooks/use-trips')return{useTrip:()=>({data:trip})};
 if(id==='@/features/auth/services/account-boundary')return{getAccountGeneration:()=>1,subscribeAccountBoundary:()=>()=>{}};
 if(id==='@/features/vehicles/use-vehicles'||(id==='./use-vehicles'&&parent.filename.includes('/vehicles/')))return{useVehicles:()=>({owner:'1',data:{vehicles:[{id:'v1',year:2020,make:'Test',model:'Car',deleted:false}]}})};
 if(id==='@/features/vehicles/use-fuel-assumptions')return{useFuelAssumptions:()=>({assumptions})};
 if(id==='@/features/trips/hooks/use-update-trip')return{useUpdateTrip:()=>({isPending:false,mutateAsync:async input=>{calls.push(input);if(failSave)throw Error('offline');trip={...trip,...input.trip};}})};
 if(id==='@/features/trips/hooks/use-delete-trip')return{useDeleteTrip:()=>({isPending:false,mutateAsync:async id=>{calls.push({deleted:id});}})};
 if(id==='@/features/trips/components/DeleteTripModal')return{DeleteTripModal:props=>{if(props.visible)handlers.push({label:'confirmed-delete',onPress:props.onDelete});return null;}};
 if(id==='@/components/ui/CompactSelect'){
  const {CompactSelect}=original.call(this,path.join(root,'src/components/ui/CompactSelect.tsx'),parent,isMain);
  return{CompactSelect:props=>{selectors.push(props);return React.createElement(CompactSelect,props);}};
 }
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));return original.call(this,id,parent,isMain);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const {default:Screen}=require(root+'/app/trips/[id]/index.tsx');
const ShiftScreen=require(root+'/app/shifts.tsx').default;
const {estimateConsumption,estimateEnergy}=require(root+'/src/features/vehicles/energy.ts');
const {elapsedMinutes,shiftMiles,platformName}=require(root+'/src/features/shifts/presentation.ts');
const core=require(root+'/src/i18n/core.ts'),{spanish}=require(root+'/src/i18n/es.ts');
const render=()=>{handlers=[];selectors=[];cursor=0;return server.renderToStaticMarkup(React.createElement(Screen));};
let renders=0;
for(const language of ['en','es'])for(const w of [320,390,430,768,1024,1366])for(const scale of [1,1.5,2])for(const theme of [false,true])for(const fuel of ['gasoline','electric','missing']){
 core.setRuntimeLanguage(language);width=w;fontScale=scale;dark=theme;slots=[];trip={...initialTrip};
 assumptions=fuel==='missing'?null:{vehicle:'2012 Honda Odyssey',fuelType:fuel,economy:fuel==='electric'?28:22,price:fuel==='electric'?.16:3.94,source:'Saved manual fuel price'};
 const html=render();assert(html.includes(language==='es'?'Detalles del viaje':'Trip Details'));assert(html.includes(initialTrip.start_address.replace(', ', '\n')));assert.equal(trip.start_address,initialTrip.start_address);assert(html.includes(language==='es'?'Dirección no disponible':'Address unavailable'));assert(!html.includes('NaN'));assert(!html.includes('Infinity'));
 if(assumptions)assert(html.includes(language==='es'?spanish['Based on current saved vehicle and price settings, not historical trip data.']:'Based on current saved vehicle and price settings, not historical trip data.'));
 renders++;
}
(async()=>{
 core.setRuntimeLanguage('en');slots=[];assumptions={vehicle:'Test EV',fuelType:'electric',economy:28,price:null,source:'Fuel price unavailable'};
 assert(render().includes('Estimated consumption'));assert(!render().includes('$0.00'));
 handlers.find(h=>h.label==='Edit trip').onPress();render();selectors.find(s=>s.label==='Category').onChange('personal');selectors.find(s=>s.label==='Platform').onChange('uber');render();
 handlers.find(h=>h.label==='Save changes').onPress();await new Promise(setImmediate);assert.deepEqual(calls.at(-1),{tripId:7,trip:{category:'personal',platform:'uber'}});assert(render().includes('Personal'));assert(!render().includes('Save changes'));
 trip={...trip,platform:null};slots=[];render();handlers.find(h=>h.label==='Edit trip').onPress();render();assert(selectors.find(s=>s.label==='Platform').choices.some(c=>c.value===''));handlers.find(h=>h.label==='Save changes').onPress();await new Promise(setImmediate);assert(!Object.hasOwn(calls.at(-1).trip,'platform'));render();
 handlers.find(h=>h.label==='Edit trip').onPress();render();selectors.find(s=>s.label==='Category').onChange('business');failSave=true;render();handlers.find(h=>h.label==='Save changes').onPress();await new Promise(setImmediate);assert(render().includes('Save changes'));assert.equal(selectors.find(s=>s.label==='Category').value,'business');failSave=false;
 handlers.find(h=>h.label==='Estimate assumptions +').onPress();assert(render().includes('No expense is recorded'));handlers.find(h=>h.label==='Estimate assumptions −').onPress();assert(!render().includes('No expense is recorded'));
 handlers.find(h=>h.label==='Delete Trip').onPress();render();await handlers.find(h=>h.label==='confirmed-delete').onPress();assert.deepEqual(calls.at(-1),{deleted:7});
 assert.deepEqual(estimateConsumption(20,'gasoline',25,3.25),{units:.8,cost:2.6});assert.deepEqual(estimateConsumption(20,'electric',25,.2),{units:5,cost:1});assert.equal(estimateConsumption(20,'diesel',25,null).cost,null);assert.equal(estimateConsumption(20,'hybrid',25,3).cost,2.4);
 for(const miles of [0,NaN,-1])assert.equal(estimateConsumption(miles,'gasoline',25,3),null);assert.equal(estimateConsumption(20,'gasoline',null,3),null);assert.equal(estimateConsumption(20,'electric',25,-1).cost,null);
 assert.equal(estimateEnergy({payout:15,miles:20,economy:25,price:3.25,fuelType:'gasoline'}).afterFuel,12.4);
 assert.equal(elapsedMinutes(initialTrip.start_time,initialTrip.end_time,0),30);assert.equal(platformName('uber_eats'),'Uber Eats');
 assert.equal(shiftMiles({data:{segments:[{distance_miles:3,excluded:false},{distance_miles:5,excluded:true}]},detector:{driving:true,miles:1.25}}),4.25);
 for(const file of ['app/trips/[id]/index.tsx','src/features/shifts/entry-point.tsx','src/components/ui/CompactSelect.tsx']){
  const source=fs.readFileSync(path.join(root,file),'utf8');for(const match of source.matchAll(/\bt\('([^']+)'/g))assert(spanish[match[1]],'Spanish: '+match[1]);assert(!source.includes('numberOfLines={1}'));assert(!source.includes('allowFontScaling={false}'));
 }
 const tripSource=fs.readFileSync(path.join(root,'app/trips/[id]/index.tsx'),'utf8');assert(tripSource.includes('${generation}:${query.data.user_id}:${query.data.id}'));assert(tripSource.includes('maxWidth:760'));assert(tripSource.includes('ScrollView'));assert(!tripSource.includes('start_lat'));
 // Notes controls are capability-gated for old servers; new-server notes save through the same API.
 slots=[];trip={...initialTrip};assert(!render().includes('Notes (optional)'));
 trip={...initialTrip,notes:'Saved delivery note'};slots=[];assert(render().includes('Saved delivery note'));
 handlers.find(h=>h.label==='Edit trip').onPress();render();handlers.find(h=>h.label==='Trip notes').onChangeText('Lunch delivery');render();handlers.find(h=>h.label==='Save changes').onPress();await new Promise(setImmediate);assert.equal(calls.at(-1).trip.notes,'Lunch delivery');assert(render().includes('Lunch delivery'));
 handlers.find(h=>h.label==='Edit trip').onPress();render();handlers.find(h=>h.label==='Trip notes').onChangeText('   ');render();handlers.find(h=>h.label==='Save changes').onPress();await new Promise(setImmediate);assert.equal(calls.at(-1).trip.notes,null);
 // Execute the real Shift screen event closures with controlled local services.
 const renderShift=()=>{handlers=[];selectors=[];cursor=0;return server.renderToStaticMarkup(React.createElement(ShiftScreen));};
 slots=[];entries=[];renderShift();handlers.find(h=>h.accessibilityLabel==='Lyft').onPress();renderShift();handlers.find(h=>h.label==='Start Shift').onPress();await new Promise(setImmediate);assert.deepEqual(shiftCalls.find(c=>Array.isArray(c)&&c[0]==='start'),['start','1','lyft',null]);
 entries=[{owner:'1',local:true,dirty:true,sequence:1,detector:{driving:false,miles:0},data:{client_id:'s',revision:0,started_at:initialTrip.start_time,ended_at:null,planned_end_at:null,platform_sessions:[],segments:[]}}];slots=[];renderShift();
 handlers.find(h=>h.accessibilityLabel==='DoorDash').onPress();await new Promise(setImmediate);assert.deepEqual(shiftCalls.find(c=>Array.isArray(c)&&c[0]==='platform'),['platform','1','s','doordash']);renderShift();
 handlers.find(h=>h.label==='Change planned end').onPress();renderShift();handlers.find(h=>h.label==='Update planned end').onPress();await new Promise(setImmediate);assert.equal(entries[0].data.planned_end_at,null);renderShift();
 handlers.find(h=>h.label==='Save Trips').onPress();await new Promise(setImmediate);assert.deepEqual(shiftCalls.find(c=>Array.isArray(c)&&c[0]==='save'),['save','1','s']);renderShift();
 handlers.find(h=>h.label==='End Shift').onPress();assert.equal(shiftCalls.some(c=>Array.isArray(c)&&c[0]==='end'),false);alerts.at(-1)[2].find(b=>b.style==='destructive').onPress();await new Promise(setImmediate);assert.deepEqual(shiftCalls.find(c=>Array.isArray(c)&&c[0]==='end'),['end','1','s']);
 console.log('PASS Shift start/platform selection, platform change, optional planned-end update, Save Trips and confirmed ending call existing owner-scoped services.');
 console.log(`PASS ${renders} localized Trip renders across six widths, Dynamic Type settings and themes; real native layout still needs device testing.`);
 console.log('PASS category/platform save handlers, unchanged missing platform, offline failure retention, disclosure, confirmed delete, gas/EV/missing-price estimates, immutable mileage, account-keyed editor, Shift summary helpers.');
})().catch(e=>{console.error(e);process.exitCode=1;});
