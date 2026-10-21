/* global __dirname */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react'),server=require('react-dom/server'),native=require('react-native-web');
let dark=false,width=390,fontScale=1,handlers=[],selectors=[],slots=[],cursor=0,calls=[],fail=false,pending=false,owner='1',requests=[],apiMode='normal';
const texts=n=>Array.isArray(n)?n.map(texts).join(''):n&&typeof n==='object'?texts(n.props?.children??n.props?.text):typeof n==='string'||typeof n==='number'?String(n):'';
const api={get:async(url,options)=>{requests.push({url,options});if(apiMode==='missing'&&url.endsWith('vehicle-summary'))throw {response:{status:404,data:{detail:'Not Found'}}};if(apiMode==='denied'&&url.endsWith('vehicle-summary'))throw {response:{status:404,data:{detail:'Vehicle not found'}}};return{data:url.includes('tax-settings')?null:{url}};},put:async(url,data)=>{requests.push({url,data});if(fail)throw Error('offline');return{data};},post:async(url,data)=>({data:{url,data}})};
const original=Module._load;
Module._load=function(id,parent,main){
 if(id==='react'&&/Feedback|feedback\/form|ReportControls/.test(parent.filename))return{...React,useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useEffect(){}};
 if(id==='react-native')return{...native,useWindowDimensions:()=>({width,height:844,scale:1,fontScale}),KeyboardAvoidingView:props=>{handlers.push({kind:'keyboard',...props});return React.createElement(native.View,props);},TextInput:props=>{handlers.push({kind:'input',...props});return React.createElement(native.TextInput,props);},Pressable:props=>{handlers.push({label:props.accessibilityLabel??texts(props.children),...props});return React.createElement(native.Pressable,props);}};
 if(id==='react-native-safe-area-context')return{SafeAreaView:native.View};
 if(id==='@/theme/theme'||(id==='./theme'&&parent.filename.includes('/theme/')))return{useAppTheme:()=>({dark})};
 if(id==='@react-native-async-storage/async-storage')return{getItem:async()=>null,setItem:async()=>{}};
 if(id==='@/api/client')return{api};
 if(id==='@/theme/icons')return{Ionicons:()=>null};
 if(id==='expo-router')return{router:{back:()=>calls.push('back')},useLocalSearchParams:()=>({type:'invalid'})};
 if(id==='@/components/ui/ScreenHeader')return{ScreenHeader:()=>null};
 if(id==='@/features/feedback/utils/feedback-metadata')return{getFeedbackMetadata:()=>({platform:'ios'})};
 if(id==='@/features/feedback/hooks/use-submit-feedback')return{useSubmitFeedback:()=>({isPending:pending,mutateAsync:async data=>{calls.push(data);if(fail)throw Error('offline');}})};
 if(id==='@/features/auth/hooks/use-current-user')return{useCurrentUser:()=>({data:{id:Number(owner),tax_method:'standard_mileage'}})};
 if(id==='@/features/auth/api/user.api')return{updateCurrentUser:async data=>{calls.push(data);}};
 if(id==='@/features/vehicles/use-vehicles'||(id==='./use-vehicles'&&parent.filename.includes('/vehicles/')))return{useVehicles:()=>({owner,data:{vehicles:[{id:'v'+owner,year:2020,make:'Test',model:'Car',deleted:false}]}})};
 if(id==='@tanstack/react-query')return{useQuery:()=>({data:null,isPending:false,isError:false}),useQueryClient:()=>({invalidateQueries:async key=>calls.push(key)})};
 if(id==='@/components/ui/CompactSelect')return{CompactSelect:props=>{selectors.push(props);return React.createElement(native.Text,null,props.label+' '+props.choices.map(c=>c.label).join(' '));}};
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));return original.call(this,id,parent,main);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const {default:Feedback}=require(root+'/app/settings/feedback/form.tsx');
const {VehicleReportBody}=require(root+'/src/features/reports/components/VehicleReportBody.tsx');
const {ReportControls}=require(root+'/src/features/reports/components/ReportControls.tsx');
const {VehicleAssignment}=require(root+'/src/features/vehicles/VehicleAssignment.tsx');
const {reportingDisclosures}=require(root+'/src/features/settings/components/ReportingDisclosures.tsx');
const {getReport,exportCsv}=require(root+'/src/features/reports/api/reports.api.ts');
const core=require(root+'/src/i18n/core.ts'),{spanish}=require(root+'/src/i18n/es.ts');
const render=(component,props={})=>{handlers=[];selectors=[];cursor=0;return server.renderToStaticMarkup(React.createElement(component,props));};
const data={report_version:2,total_income:100,total_expenses:20,total_miles:10,personal_miles:5,total_deductions:7.6,parking_tolls:0,non_vehicle_deductions:0,calculation_complete:false,vehicle_rows:[{vehicle_id:null,vehicle_name:'Unassigned vehicle',method:'standard_mileage',business_miles:10,personal_miles:5,standard:7.6,actual:null,business_use_percentage:null}],rate_periods:[{rate:'.760',miles:10,effective_start:'2026-07-01',effective_end:'2026-12-31'}],caveats:['Estimates only. Selecting a reporting method does not file an IRS election.']};
let count=0;
for(const language of ['en','es'])for(width of [320,390,430,768,1366])for(fontScale of [1,2])for(dark of [false,true]){
 core.setRuntimeLanguage(language);slots=[];let html=render(Feedback);assert(!html.includes('NaN'));assert.equal(native.StyleSheet.flatten(handlers.find(h=>h.kind==='keyboard').style).backgroundColor,dark?'#081320':'#F8FAFC');
 for(const h of handlers.filter(h=>h.kind==='input')){assert.equal(h.keyboardAppearance,dark?'dark':'light');assert(h.placeholderTextColor);}
 for(const advanced of [false,true]){html=render(VehicleReportBody,{report:{...data,advanced}});assert(html.includes('$7.60'));assert(html.includes(language==='es'?'Millas personales':'Personal miles'));assert(html.includes('2026-07-01'));assert(!html.includes('NaN'));}
 count++;
}
(async()=>{
 core.setRuntimeLanguage('en');dark=false;slots=[];render(Feedback);await handlers.find(h=>h.label==='Submit Feedback').onPress();assert(render(Feedback).includes('Enter a title'));
 handlers.find(h=>h.accessibilityLabel==='Title').onChangeText(' A report ');handlers.find(h=>h.accessibilityLabel==='Description').onChangeText(' Details ');render(Feedback);fail=true;await handlers.find(h=>h.label==='Submit Feedback').onPress();assert(render(Feedback).includes('Your message is still here'));assert.equal(handlers.find(h=>h.accessibilityLabel==='Title').value,' A report ');fail=false;await handlers.find(h=>h.label==='Submit Feedback').onPress();assert.equal(calls.at(-2).type,'general');assert.equal(calls.at(-2).title,'A report');assert.equal(calls.at(-1),'back');
 slots=[];const props={year:2026,premium:true,vehicleId:'',onVehicle:()=>{},method:'standard_mileage',onMethod:()=>{}};render(ReportControls,props);handlers.find(h=>h.label.includes('Review yearly mileage')).onPress();render(ReportControls,props);
 handlers.find(h=>h.accessibilityLabel==='Documented total vehicle miles').onChangeText('1000');handlers.find(h=>h.accessibilityLabel==='Documented business miles').onChangeText('600');render(ReportControls,props);await handlers.find(h=>h.label==='Save assumptions').onPress();assert.equal(requests.at(-1).url,'/api/v1/vehicles/v1/tax-settings/2026');assert.equal(requests.at(-1).data.business_miles,'600');
 render(VehicleAssignment,{value:null,onChange:()=>{}});assert.equal(selectors[0].value,'');assert(selectors[0].choices.some(c=>c.value==='v1'));owner='2';render(VehicleAssignment,{value:null,onChange:()=>{}});assert(!selectors[0].choices.some(c=>c.value==='v1'));assert(selectors[0].choices.some(c=>c.value==='v2'));
 requests=[];apiMode='missing';await getReport({year:2026});assert.deepEqual(requests.map(r=>r.url),['/api/v1/reports/vehicle-summary','/api/v1/reports']);requests=[];apiMode='denied';await assert.rejects(getReport({year:2026,vehicleId:'other'}));assert.equal(requests.length,1);apiMode='normal';await exportCsv({...data,year:2026,tax_method:'actual_expenses',vehicle_filter:'v1',report_fingerprint:'abc'});assert.equal(requests.at(-1).options.params.expected_fingerprint,'abc');assert.equal(requests.at(-1).options.params.vehicle_id,'v1');
 for(const copy of reportingDisclosures)assert(spanish[copy],copy);
 for(const file of ['src/features/reports/components/ReportControls.tsx','src/features/reports/components/VehicleReportBody.tsx','src/features/vehicles/VehicleAssignment.tsx','app/settings/feedback/form.tsx']){
  for(const m of fs.readFileSync(path.join(root,file),'utf8').matchAll(/\bt\('([^']+)'/g))assert(spanish[m[1]],'Missing Spanish: '+m[1]);
 }
 console.log(`PASS ${count} Feedback and ${count*2} Report renders: English/Spanish, themes, five widths, Dynamic Type; feedback validation/failure retention/submission, vehicle isolation, assumptions persistence, API fallback scope, canonical export parameters.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
