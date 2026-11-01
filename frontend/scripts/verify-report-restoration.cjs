/* global __dirname */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react'),server=require('react-dom/server'),native=require('react-native-web');
let slots=[],cursor=0,queries=[],controls,period,custom,exportProps,actions,buttons=[];
const base={year:2026,month:10,total_income:1000,tax_method:'standard_mileage',expense_breakdown:{phone:{amount:20,count:1}}};
const vehicle={...base,report_version:2,vehicle_rows:[],caveats:[]};
const text=n=>Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):String(n??'');
const original=Module._load;
Module._load=function(id,parent,main){
 if(id==='react'&&/PremiumReport\.tsx$/.test(parent.filename))return{...React,useState(initial){const index=cursor++;if(!(index in slots))slots[index]=typeof initial==='function'?initial():initial;return[slots[index],value=>{slots[index]=typeof value==='function'?value(slots[index]):value;}];}};
 if(id==='react-native')return{...native,Pressable:p=>{buttons.push(p);return React.createElement(native.Pressable,p);}};
 if(id==='@/theme/components')return{...native,SafeAreaView:native.View,Pressable:p=>{buttons.push(p);return React.createElement(native.Pressable,p);}};
 if(id==='@/i18n/language')return{useLanguage:()=>({locale:'en-US',t:v=>v}),Translated:p=>React.createElement(native.Text,null,p.text)};
 if(id==='@/hooks/use-is-tablet')return{useIsTablet:()=>false};
 if(id==='@/features/reports/hooks/use-current-report')return{useCurrentReport:(params,options)=>{queries.push({params,options});return{data:params.vehicleSummary?vehicle:{...base,vehicle_filter:params.vehicleId},isLoading:false,isError:false,isPlaceholderData:false,refetch(){}};}};
 if(id==='@/features/reports/components/ReportBody')return{ReportBody:p=>React.createElement(native.Text,null,'ORIGINAL REPORT '+p.report.total_income)};
 if(id==='@/features/reports/components/VehicleReportBody')return{VehicleReportBody:p=>{assert(p.detailsOnly);return React.createElement(native.Text,null,'VEHICLE DETAILS');}};
 if(id==='@/features/reports/components/ReportControls')return{ReportControls:p=>{controls=p;return null;}};
 if(id==='@/features/reports/components/ReportPeriodSelector')return{ReportPeriodSelector:p=>{period=p;return null;}};
 if(id==='@/features/reports/components/QuickActionCard')return{QuickActionsCard:p=>{actions=p;return null;}};
 if(id==='@/features/reports/modals/CustomReportModal')return{CustomReportModal:p=>{custom=p;return null;}};
 if(id==='@/features/reports/modals/ExportReportModal')return{ExportReportModal:p=>{exportProps=p;return null;}};
 if(id==='@/features/reports/components/ReportPresentation')return{ReportSection:p=>React.createElement(native.View,null,p.children),ReportLoadState:()=>null};
 if(id==='@/features/reports/utils/report-display')return{reportPeriodLabel:()=> 'Selected period'};
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));return original.call(this,id,parent,main);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const Screen=require(root+'/app/reports/PremiumReport.tsx').default;
function render(){cursor=0;queries=[];buttons=[];return server.renderToStaticMarkup(React.createElement(Screen));}
let html=render();assert(html.includes('ORIGINAL REPORT 1000'));assert(!html.includes('VEHICLE DETAILS'));assert.equal(queries[1].options.enabled,false);
buttons.find(b=>text(b.children)==='Show vehicle details').onPress();html=render();assert(html.includes('ORIGINAL REPORT 1000'));assert(html.includes('VEHICLE DETAILS'));assert.equal(queries[1].options.enabled,true);
buttons.find(b=>text(b.children).startsWith('Filters and reporting preferences')).onPress();render();
controls.onVehicle('saved-vehicle');render();assert.equal(queries[0].params.vehicleId,'saved-vehicle');assert.equal(queries[1].options.enabled,false);
controls.onMethod('actual_expenses');render();assert.equal(queries[0].params.method,'actual_expenses');
period.onSelect('custom');render();assert.equal(custom.visible,true);const start=new Date(2025,11,1),end=new Date(2025,11,20);custom.onGenerate(start,end);render();assert.equal(queries[0].params.startDate,start);assert.equal(queries[0].params.endDate,end);assert.equal(custom.visible,false);
actions.onExport();render();assert.equal(exportProps.visible,true);assert.equal(exportProps.report.vehicle_filter,'saved-vehicle');assert.equal(exportProps.report.total_income,1000);assert.equal(exportProps.report.report_version,undefined);
period.onSelect('last-year');render();assert.equal(queries[0].params.year,new Date().getFullYear()-1);assert.equal(exportProps.visible,false);
console.log('PASS Pro original report, optional vehicle details, vehicle filter, method change, custom dates, previous year, and export of the displayed report.');
