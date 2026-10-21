/* global __dirname */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react'),server=require('react-dom/server'),native=require('react-native-web');
let dark=false,width=390,slots=[],cursor=0,handlers=[],selectors=[],params,reportError=false,placeholder=false,incomeMissing=false;
const text=n=>Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):typeof n==='string'||typeof n==='number'?String(n):'';
const platforms=['uber','uber_eats','lyft','doordash','grubhub','instacart','spark','amazon_flex','shipt','other'];
const income={id:7,user_id:1,amount:42,source:'gig_platform',platform:'lyft',received_at:'2025-01-01T12:00:00Z',created_at:'2025-01-01T12:00:00Z',notes:'Recorded note'};
const load=Module._load;
Module._load=function(id,parent,main){
 if(id==='react'&&(/IncomeForm\.tsx$|income\/\[id\]\/index\.tsx$|FreeTierReport\.tsx$/.test(parent.filename)))return {...React,useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];}};
 if(id==='react-native')return {...native,Platform:{OS:'ios',isPad:false},Pressable:p=>{handlers.push({label:p.accessibilityLabel??text(p.children),...p});return React.createElement(native.Pressable,p);}};
 if(id==='react-native-safe-area-context')return{SafeAreaView:native.View};
 if(id==='@react-native-async-storage/async-storage')return{getItem:async()=>null,setItem:async()=>{}};
 if(id==='@/theme/theme'||(id==='./theme'&&parent.filename.includes('/theme/')))return{useAppTheme:()=>({dark})};
 if(id==='@/theme/icons')return{Ionicons:()=>null};
 if(id==='@/constants/platform-icons')return{platformIcons:Object.fromEntries(platforms.map(p=>[p,{uri:'test:'+p}]))};
 if(id==='expo-router'){const Stack=()=>null;Stack.Screen=()=>null;return{Stack,router:{push(){},back(){}},useLocalSearchParams:()=>({id:'7'})};}
 if(id==='@/hooks/use-is-tablet')return{useIsTablet:()=>width>=768};
 if(id==='@/components/ui/ScreenHeader')return{ScreenHeader:p=>React.createElement(native.Text,null,p.title)};
 if(id==='@/components/ui/CompactSelect')return{CompactSelect:p=>{selectors.push(p);return React.createElement(native.Text,null,p.label);}};
 if(id==='@/features/income/hooks/use-income-detail')return{useIncomeDetail:()=>({data:incomeMissing?{...income,platform:null,notes:null,business_name:null,source:'business'}:income})};
 if(id==='@/features/income/hooks/use-delete-income')return{useDeleteIncome:()=>({mutateAsync:async()=>{}})};
 if(id==='@/features/income/components/DeleteIncomeModal')return{DeleteIncomeModal:()=>null};
 if(id==='@/features/reports/hooks/use-current-report')return{useCurrentReport:p=>{params=p;return{data:{total_income:99},isLoading:false,isError:reportError,isPlaceholderData:placeholder,refetch(){}};}};
 if(id==='@/features/reports/components/ReportBody')return{ReportBody:p=>React.createElement(native.Text,null,'report-total:'+p.report.total_income)};
 if(id==='@/features/reports/components/ReportPresentation')return{ReportLoadState:()=>React.createElement(native.Text,null,'report-loading')};
 if(id==='@/features/reports/components/ReportControls')return{ReportControls:p=>{assert.equal(p.premium,false);return React.createElement(native.Text,null,'report-controls');}};
 if(id==='@/components/ui/PremiumButton')return{__esModule:true,default:p=>React.createElement(native.Text,null,p.features.join(' '))};
 if(id==='@/features/users/hooks/use-monthly-goal')return{useMonthlyGoal:()=>({data:{goal:1000,current:100}})};
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));return load.call(this,id,parent,main);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,f);
const {dashboardLayout}=require(root+'/src/features/reports/utils/dashboard-layout.ts');
const {addressDisplay}=require(root+'/src/features/trips/utils/address-display.ts');
assert.equal(addressDisplay('105 Calico Loop, Calico Loop, Grantville, GA'),'105 Calico Loop\nGrantville, GA');
assert.equal(addressDisplay('123 Main St, 123 Main St, City, GA'),'123 Main St\nCity, GA');
assert.equal(addressDisplay('12 Road, Suite 2, City, GA'),'12 Road\nSuite 2, City, GA');
assert.equal(addressDisplay(null),null);assert.equal(addressDisplay('  '),null);
for(const height of [320,480,560,680,760,1000,1300])for(const active of [false,true]){const l=dashboardLayout(height,active);assert(l.gap>=8&&l.gap<=16);assert(l.actionHeight>=48);assert(l.amountSize>=32);assert(l.padding>=12);assert(l.density<=dashboardLayout(height,false).density);}
const {IncomeForm}=require(root+'/src/features/income/components/IncomeForm.tsx'),IncomeDetails=require(root+'/app/income/[id]/index.tsx').default,Free=require(root+'/app/reports/FreeTierReport.tsx').default;
const core=require(root+'/src/i18n/core.ts');
function render(Screen,reset=false){if(reset)slots=[];cursor=0;handlers=[];selectors=[];return server.renderToStaticMarkup(React.createElement(Screen,{onSubmit(){}}));}
let count=0;
for(const lang of ['en','es'])for(dark of [false,true])for(width of [320,390,430,768,1024]){
 core.setRuntimeLanguage(lang);let html=render(IncomeForm,true);assert.equal(handlers.filter(p=>p.accessibilityState?.selected!==undefined).length,10);assert.equal(handlers.filter(p=>p.accessibilityState?.selected).length,1);assert(!html.includes('No platform'));const uber=handlers.find(p=>p.label==='Uber');uber.onPress();render(IncomeForm);assert.equal(handlers.find(p=>p.label==='Uber').accessibilityState.selected,true);
 html=render(IncomeDetails,true);assert.equal((html.match(/Income Details/g)||[]).length,1);assert(html.includes('42.00'));assert(html.includes('Lyft'));assert(html.includes('Recorded note'));incomeMissing=true;html=render(IncomeDetails,true);assert(!html.includes('test:lyft'));assert(!html.includes('undefined'));incomeMissing=false;
 render(Free,true);const now=new Date();assert.equal(params.year,now.getFullYear());const selectYear=selectors.find(p=>p.label===(lang==='es'?'Año':'Year'));assert(selectYear.choices.some(c=>c.value===String(now.getFullYear()-2)));selectYear.onChange(String(now.getFullYear()-2));selectors.find(p=>p.label===(lang==='es'?'Mes':'Month')).onChange('12');html=render(Free);assert.equal(params.year,now.getFullYear()-2);assert.equal(params.month,12);assert(html.includes('report-total:99'));assert(!html.includes('Review previous years'));assert(!html.includes('report-controls'));
 reportError=true;html=render(Free);assert(selectors.length===2);assert(!html.includes('report-total:99'));reportError=false;placeholder=true;html=render(Free);assert(!html.includes('report-total:99'));placeholder=false;count++;
}
console.log(`PASS ${count} localized light/dark phone/tablet Income and Free Reports scenarios; platform selection, historical years/months, loading/error selectors and stale totals; bounded Dashboard sizing and display-only addresses.`);
