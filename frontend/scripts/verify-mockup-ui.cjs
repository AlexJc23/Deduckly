/* global __dirname */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react'),server=require('react-dom/server'),native=require('react-native-web');
let dark=true,width=390,fontScale=1,manual=false,entries=[],report={total_income:123.45,total_miles:12.4,saved_trip_count:3,trip_breakdown:[{platform:"lyft",miles:12.4,trip_count:2}]},goal={goal:200,current:123.45},handlers=[],navigated=[],availableWidth=0,availableHeight=702,measuredContentHeight=620,zeroCursor=0,scrollProps,alerts=[];
const original=Module._load;
const text=n=>Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):typeof n==='string'||typeof n==='number'?String(n):'';
Module._load=function(id,parent,main){
 if(id==='react'&&parent.filename.endsWith('/app/(tabs)/dashboard.tsx'))return{...React,useState(initial){const state=React.useState(initial);return initial===0?[[availableWidth,availableHeight,measuredContentHeight][zeroCursor++],()=>{}]:state;}};
 if(id==='react-native')return{...native,ScrollView:props=>{scrollProps=props;return React.createElement(native.ScrollView,props);},useWindowDimensions:()=>({width,height:844,scale:1,fontScale}),Pressable:props=>{handlers.push({label:props.accessibilityLabel??text(props.children),...props});return React.createElement(native.Pressable,props);}};
 if(id==='react-native-safe-area-context')return{SafeAreaView:native.View};
 if(id==='@react-native-async-storage/async-storage')return{getItem:async()=>null,setItem:async()=>{}};
 if(id==='@/theme/theme'||(id==='./theme'&&parent.filename.includes('/theme/')))return{useAppTheme:()=>({dark})};
 if(id==='@/i18n/alerts')return{localizedAlert:(...args)=>alerts.push(args)};
 if(id==='@/theme/icons')return{Ionicons:({name})=>React.createElement(native.Text,{'aria-hidden':true}, {'person':'●','time-outline':'◷','trail-sign-outline':'╱','calendar-outline':'▦','receipt-outline':'▤','analytics-outline':'⌁','chevron-forward':'›','add-circle-outline':'⊕','play':'▶','navigate':'➤'}[name]??'')};
 if(id==='@/constants/platform-icons'){const icons={};for(const p of ['lyft','uber','uber_eats','spark','doordash','grubhub','instacart','amazon_flex','shipt','other'])icons[p]={uri:'data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/platform-icons',p+'.png')).toString('base64')};return{platformIcons:icons};}
 if(id==='expo-router')return{router:{push:p=>navigated.push(p),replace(){}},useLocalSearchParams:()=>({})};
 if(id==='@/features/auth/hooks/use-current-user')return{useCurrentUser:()=>({data:{first_name:'Alex'}})};
 if(id==='@/features/reports/hooks/use-today-report')return{useTodayReport:()=>({data:report,isLoading:false,isError:false,refetch:async()=>{}})};
 if(id==='@/features/users/hooks/use-daily-goal')return{useDailyGoal:()=>({data:goal})};
 if(id==='@/features/tracking/context/tracking.context')return{useTracking:()=>({isTracking:manual,isReady:true,trackingNotice:null,startTrackingFromSiri:async()=>true})};
 if(id==='@/features/tracking/components/StartTripModal')return{StartTripModal:()=>null};
 if(id==='@/features/shifts/context'||(id==='./context'&&parent.filename.includes('/shifts/')))return{useShifts:()=>({owner:'1',entries})};
 if(id==='@/services/siri.service')return{getPendingTrip:async()=>null};
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));return original.call(this,id,parent,main);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const Screen=require(root+'/app/(tabs)/dashboard.tsx').default;
const core=require(root+'/src/i18n/core.ts'),{spanish}=require(root+'/src/i18n/es.ts'),{dashboardSummary}=require(root+'/src/features/reports/utils/dashboard-summary.ts');
const fixture={owner:'1',local:true,dirty:false,detector:{driving:true,miles:2.25},data:{client_id:'s',started_at:new Date(Date.now()-7200000).toISOString(),ended_at:null,planned_end_at:new Date(Date.now()+3600000).toISOString(),segments:[{distance_miles:97.66,excluded:false}],platform_sessions:[{platform:'lyft',ended_at:null}]}};
const render=()=>{zeroCursor=0;handlers=[];return server.renderToStaticMarkup(React.createElement(Screen));};
let renders=0;
for(const lang of ['en','es'])for(width of [320,390,430,768,1024,1366])for(fontScale of [1,1.5,2])for(dark of [false,true])for(const active of [false,true]){
 core.setRuntimeLanguage(lang);entries=active?[fixture]:[];manual=false;const html=render();
 assert.equal(html.includes('dashboard-compact'),fontScale<=1.2);assert.equal(scrollProps.bounces,false);assert.equal(scrollProps.scrollEnabled,availableHeight>0&&measuredContentHeight>availableHeight+1);assert(html.includes('$123.45'));assert(html.includes('12.4'));assert(!html.includes('NaN'));assert(!html.includes('Infinity'));assert.equal(html.includes('99.91'),active);
 const earnings=lang==='es'?spanish["Today's Earnings"]:"Today's Earnings",analyzer=lang==='es'?'Analizador de ofertas':'Offer Analyzer';assert(html.indexOf(earnings)<html.indexOf(analyzer));
 assert.equal(html.includes(lang==='es'?spanish['View Shift']:'View Shift'),active);assert(html.includes('62%'));assert.equal(dashboardSummary(report,goal).progress,62);assert.equal(dashboardSummary(report,goal).businessTrips,2);assert(!html.includes('>Deduckly<'));assert(!html.includes('View your trips'));assert(html.includes(lang==='es'?spanish['Track your earnings']:'Track your earnings'));renders++;
}
// Only measured overflow enables scrolling; ordinary spare height is distributed by the parent.
for(availableHeight of [560,702,880])for(measuredContentHeight of [400,900])for(manual of [false,true])for(const active of [false,true]){entries=active?[fixture]:[];fontScale=1;render();assert.equal(scrollProps.scrollEnabled,measuredContentHeight>availableHeight+1);assert.equal(native.StyleSheet.flatten(scrollProps.style).flex,1);assert.equal(native.StyleSheet.flatten(scrollProps.contentContainerStyle).flexGrow,1);assert.equal(native.StyleSheet.flatten(scrollProps.contentContainerStyle).justifyContent,"flex-start");assert.equal(typeof scrollProps.onContentSizeChange,"function");assert.equal(scrollProps.alwaysBounceVertical,false);}
availableHeight=702;measuredContentHeight=620;
// Primary actions stay in the requested order; saved counts never include detected mileage.
core.setRuntimeLanguage('en');entries=[];manual=false;let idle=render();
const order=['Start Shift','Start a Trip','Offer Analyzer','Add Income','Add Expense'];
for(let i=1;i<order.length;i++)assert(idle.indexOf(order[i-1])<idle.indexOf(order[i]),'Dashboard action order: '+order[i]);
handlers.find(h=>h.label==='Mileage breakdown').onPress();assert.equal(alerts.at(-1)[0],'Mileage breakdown');assert(alerts.at(-1)[1].includes('12.4'));assert(!alerts.at(-1)[1].includes('NaN'));
assert(idle.includes('Active shift elapsed time'));assert(idle.includes('Trips saved'));
entries=[fixture];const activeHtml=render();assert(!activeHtml.includes('Start Shift'));assert(activeHtml.indexOf('View Shift')<activeHtml.indexOf('Start a Trip'));assert(activeHtml.includes('2h 0m'));
// Measure the content area, not full device width: the sidebar and Split View consume width.
for(width of [768,1024,1366])for(availableWidth of [390,600,680,900])for(fontScale of [1,2])for(const active of [false,true]){
 entries=active?[fixture]:[];manual=false;const body=render();
 assert.equal(body.includes('dashboard-actions-grid'),availableWidth>=680&&fontScale<=1.3);
 assert(body.includes('$123.45'));assert(body.includes('Add Income'));assert(body.includes('Add Expense'));assert(body.includes('Offer Analyzer'));
 assert.equal(body.includes('View Shift'),active);
}
availableWidth=0;fontScale=1;
core.setRuntimeLanguage('en');entries=[];manual=true;let html=render();assert(html.includes('Trip in Progress'));handlers.find(h=>h.label.includes('Trip in Progress')).onPress();assert.equal(navigated.at(-1),'/tracking/active');
handlers.find(h=>h.label==='Start Shift').onPress();assert.equal(navigated.at(-1),'/shifts');
for(const label of ['Add Income','Add Expense','Offer Analyzer','Profile']){handlers.find(h=>h.label.includes(label)).onPress();}assert(navigated.includes('/income/create'));assert(navigated.includes('/expense/create'));assert(navigated.includes('/settings/edit-profile'));
assert.deepEqual(dashboardSummary({total_income:100,total_miles:7,trip_breakdown:[{trip_count:2}]},{goal:200}).trips,2);assert(!dashboardSummary({trip_breakdown:[]},null).allTrips);assert.equal(dashboardSummary(undefined,undefined).income,null);assert.equal(dashboardSummary({total_income:300}, {goal:200}).progress,100);
for(const m of fs.readFileSync(root+'/app/(tabs)/dashboard.tsx','utf8').matchAll(/\bt\('([^']+)'/g))assert(spanish[m[1]],'Missing Spanish '+m[1]);
if(process.env.DEDUCKLY_UI_PREVIEW){dark=true;manual=false;entries=[fixture];const body=render(),css=native.StyleSheet.getSheet().textContent;fs.mkdirSync('/tmp/deduckly-mockup-preview',{recursive:true});fs.writeFileSync('/tmp/deduckly-mockup-preview/index.html','<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#081320}main{max-width:430px;margin:auto}'+css+'</style></head><body><main>'+body+'</main></body></html>');}
console.log(`PASS ${renders} Dashboard mockup renders, accurate report-only metrics, active-only Shift, progress clamping, old-backend count fallback, navigation and independent manual tracking.`);
