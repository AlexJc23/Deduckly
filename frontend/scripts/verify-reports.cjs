const fs=require('fs'), path=require('path'), Module=require('module');
const root=path.resolve(__dirname,'..');
const resolve=p=>require.resolve(p,{paths:[root]});
const ts=require(resolve('typescript'));
const React=require(resolve('react'));
const ReactDOM=require(resolve('react-dom/server'));
const native=require(resolve('react-native-web'));
let width=390, fontScale=1;
const original=Module._load;
Module._load=function(id,parent,isMain){
 if (id === '@react-native-async-storage/async-storage') return { getItem: async () => null, setItem: async () => {} };
 if(id==='react-native') return {...native,useWindowDimensions:()=>({width,height:844,scale:1,fontScale})};
 if(id==='@/theme/theme' || (id==='./theme' && parent.filename.includes('/theme/'))) return {useAppTheme:()=>({dark:false})};
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
