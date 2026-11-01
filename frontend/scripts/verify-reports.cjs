const fs=require('fs'), path=require('path'), Module=require('module');
const root=path.resolve(__dirname,'..');
const resolve=p=>require.resolve(p,{paths:[root]});
const ts=require(resolve('typescript'));
const React=require(resolve('react'));
const ReactDOM=require(resolve('react-dom/server'));
const native=require(resolve('react-native-web'));
let width=390, fontScale=1, dark=false;
const original=Module._load;
Module._load=function(id,parent,isMain){
 if(id==='react' && parent.filename.endsWith('/ReportBody.tsx')) return {...React,useState:()=>[true,()=>{}]};
 if (id === '@react-native-async-storage/async-storage') return { getItem: async () => null, setItem: async () => {} };
 if(id==='react-native') return {...native,useWindowDimensions:()=>({width,height:844,scale:1,fontScale})};
 if(id==='@/theme/theme' || (id==='./theme' && parent.filename.includes('/theme/'))) return {useAppTheme:()=>({dark})};
 if(id==='react-native-safe-area-context') return {SafeAreaView:native.View};
 if(id==='expo-router') return {router:{push(){}}};
 if(id.startsWith('@/')) id=path.join(root,'src',id.slice(2));
 return original.call(this,id,parent,isMain);
};
for(const ext of ['.ts','.tsx']) require.extensions[ext]=(module,file)=>{
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});
 module._compile(out.outputText,file);
};
const {ReportBody}=require(root+'/src/features/reports/components/ReportBody.tsx');
const report={year:2026,month:9,total_income:5400,total_expenses:870,total_miles:1260,mileage_deduction:850,deductible_expense_total:440,total_deductions:1290,net_profit:4110,taxable_income:4110,estimated_tax_owed:411,estimated_tax_savings:129,tax_method:'standard_mileage',expense_breakdown:{fuel:{amount:430,count:8},meals:{amount:240,count:6},supplies:{amount:100,count:2},parking:{amount:60,count:3},phone:{amount:40,count:1}}};
fs.mkdirSync(path.join(require('os').tmpdir(),'deduckly-report-qa'),{recursive:true});
for(const [label,w,scale,data] of [['phone',390,1,report],['phone-430',430,1,{...report,total_income:185,total_expenses:20,total_miles:194.83}],['phone-440',440,1,report],['small',320,1,report],['tablet',1024,1,report],['large-text',390,1.7,report],['empty',390,1,{...report,total_income:0,total_expenses:0,total_miles:0,expense_breakdown:{}}]]){
 width=w;fontScale=scale;
 const body=ReactDOM.renderToStaticMarkup(React.createElement(native.View,{style:{maxWidth:1000,width:'100%',alignSelf:'center',padding:20}},React.createElement(ReportBody,{report:data})));
 fs.writeFileSync(path.join(require('os').tmpdir(),'deduckly-report-qa',label+'.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reports layout QA · ${label}</title><style>body{margin:0;background:#F6F8FB} ${native.StyleSheet.getSheet().textContent}</style><div style="max-width:${w}px;margin:auto">${body}</div>`);
}
const assert=require('assert/strict');
const {buildReportParams}=require(root+'/src/features/reports/utils/build-report-params.ts');
const RealDate=Date;
global.Date=class extends RealDate {constructor(...args){super(...(args.length?args:[2027,0,15]));}};
assert.deepEqual(buildReportParams('last-month'),{year:2026,month:12});global.Date=RealDate;
const {buildExpenseChartData}=require(root+'/src/features/reports/utils/build-expense-chart.ts');
const chart=buildExpenseChartData(report.expense_breakdown);
assert.equal(chart.reduce((n,c)=>n+c.value,0),870);assert.equal(chart.length,5);assert.ok(chart[4].category.startsWith('Other ('));
assert.ok(Math.abs(chart.reduce((n,c)=>n+c.percent,0)-100)<0.0001);
assert.equal(buildExpenseChartData({a:{amount:0}}).length,0);
const {money,miles,localDateString,reportPeriodLabel}=require(root+'/src/features/reports/utils/report-display.ts');
assert.equal(money(undefined),'—');assert.equal(money('1234.5'),'$1,234.50');assert.equal(miles(1260),'1,260 mi');
assert.equal(localDateString(new Date(2026,8,1)),'2026-09-01');assert.match(reportPeriodLabel({startDate:new Date(2026,8,1),endDate:new Date(2026,8,6)}),/Sep 1, 2026.*Sep 6, 2026/);
console.log('Passed: January rollover, category aggregation, percentages, zero-data chart, currency/mileage formatting, local dates, custom period labels. Rendered seven report layouts, including 430- and 440-point phones.');

// Both report variants must retain the established financial sections.
const core=require(root+'/src/i18n/core.ts');
let preserved=0;
for(const lang of ['en','es'])for(dark of [false,true])for(const w of [320,390,430,768,1024])for(const version of [undefined,2]){
 core.setRuntimeLanguage(lang);width=w;
 const data={...report,report_version:version,vehicle_rows:[],rate_periods:[],caveats:[]};
 const html=ReactDOM.renderToStaticMarkup(React.createElement(ReportBody,{report:data}));
 for(const label of ['At a glance','Where your money went','From income to deductions','Tax estimates'])assert(html.includes(core.translate(label)),label+' missing from report '+version);
 assert(html.includes('411.00'));assert(html.includes('870.00'));preserved++;
}
core.setRuntimeLanguage('en');
const emptyHtml=ReactDOM.renderToStaticMarkup(React.createElement(ReportBody,{report:{...report,report_version:2,total_income:'0',total_expenses:'0',total_miles:'0',estimated_tax_owed:null,estimated_tax_savings:null,vehicle_rows:[],rate_periods:[],caveats:[]}}));
assert(emptyHtml.includes('No income, expenses, or mileage recorded'));
assert(emptyHtml.includes('Tax estimates are unavailable'));
console.log('PASS '+preserved+' original/vehicle report renders preserve financial sections in English/Spanish, both themes and five widths; decimal-string empty totals and unavailable tax estimates.');

const mixedHtml=ReactDOM.renderToStaticMarkup(React.createElement(ReportBody,{report:{...report,report_version:2,vehicle_rows:[{vehicle_id:'a',vehicle_name:'A',method:'standard_mileage'},{vehicle_id:'b',vehicle_name:'B',method:'actual_expenses'}],caveats:[],rate_periods:[]}}));
assert(mixedHtml.includes('Methods vary by vehicle'));
assert(!mixedHtml.includes('Mileage deduction + deductible expenses'));
console.log('PASS mixed vehicle methods do not display a false standard-mileage formula.');

const {getCurrentMonthAndYear}=require(root+'/src/features/reports/utils/date.ts');
const monthBoundary=new Date('2026-11-01T03:30:00Z');
assert.deepEqual(getCurrentMonthAndYear('America/Los_Angeles',monthBoundary),{year:2026,month:10,day:31});
assert.deepEqual(getCurrentMonthAndYear('Asia/Tokyo',monthBoundary),{year:2026,month:11,day:1});
assert.deepEqual(getCurrentMonthAndYear('invalid-zone',monthBoundary),{year:2026,month:10,day:31});
console.log('PASS Free reporting period uses account timezone and a safe timezone fallback at the month boundary.');
