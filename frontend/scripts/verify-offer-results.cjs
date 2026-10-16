/* global __dirname */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react'),server=require('react-dom/server'),native=require('react-native-web');
let expanded=false,handlers=[],width=320,fontScale=1,dark=false;
const original=Module._load;
Module._load=function(id,parent,isMain){
 if(id==='react')return {...React,useState(initial){return[expanded,set=>{expanded=typeof set==='function'?set(expanded):set;}];}};
 if(id==='react-native')return{...native,useWindowDimensions:()=>({width,height:800,scale:1,fontScale}),Pressable:props=>{handlers.push(props.onPress);return React.createElement(native.Pressable,props);}};
 if(id==='react-native-safe-area-context')return{SafeAreaView:native.View};
 if(id==='@/theme/icons')return{Ionicons:()=>null};
 if(id==='@/theme/theme'||(id==='./theme'&&parent.filename.includes('/theme/')))return{useAppTheme:()=>({dark})};
 if(id==='@react-native-async-storage/async-storage')return{getItem:async()=>null,setItem:async()=>{}};
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));
 return original.call(this,id,parent,isMain);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const {presentOfferResult:present}=require(root+'/src/features/offer-analyzer/utils/result-presentation.ts');
const {analyzeIntegratedOffer:analyze}=require(root+'/src/features/offer-analyzer/utils/integrated.ts');
const {OfferResultCard}=require(root+'/src/features/offer-analyzer/components/OfferResultCard.tsx');
const core=require(root+'/src/i18n/core.ts'),{spanish}=require(root+'/src/i18n/es.ts');
const a={economy:25,price:3.25,fuelType:'gasoline',vehicle:'2020 Test Car',source:'Saved manual fuel price'};
const prefs={costPerMile:.5,minimumProfit:10,minimumHourRate:20,minimumDollarsPerMile:1.9,preferredMaxDistance:30};
let groups=0;function test(name,fn){fn();groups++;console.log('PASS '+name);}
test('presentation preserves decisions and every engine value without mutating inputs',()=>{
 for(const payout of [40,20,5])for(const premium of [false,true])for(const duration of [null,30]){
  const result=analyze({payout,distance:10,estimatedTime:duration},premium?prefs:null,a),before=JSON.stringify(result),p=present(result);
  if(premium)assert.equal(p.recommendation,result.recommendation);
  else assert.equal(p.recommendation,result.verdict==='skip'?'decline':result.verdict==='average'?'consider':'accept');
  assert.equal(p.hero.value,result.fuel.afterFuel);assert.equal(p.primary.find(m=>m.group==='per-mile').value,result.dollarsPerMile);
  assert.equal(p.primary.find(m=>m.group==='per-hour')?.value,duration===null?undefined:premium?result.profitHourlyRate:result.hourlyRate);
  assert.equal(JSON.stringify(result),before);
 }
});
test('fuel-only and total vehicle-cost earnings remain distinct when different',()=>{
 const r=analyze({payout:20,distance:10,estimatedTime:30},prefs,a),p=present(r);
 assert.equal(p.hero.value,18.7);assert.equal(p.primary.find(m=>m.group==='earnings').value,15);
 assert.equal(p.primary.find(m=>m.group==='per-hour').value,30);
 assert.equal(p.details.find(m=>m.label==='Total estimated vehicle cost').value,5);
});
test('identical metrics are not repeated; zero fuel does not fabricate missing data',()=>{
 for(const price of [0,3.25])for(const costPerMile of [0,.5]){
  const p=present(analyze({payout:20,distance:10,estimatedTime:1},{...prefs,costPerMile},{...a,price}));
  const rows=[p.hero,...p.primary,...p.breakdown,...p.details].filter(Boolean);
  const keys=rows.map(m=>m.group+':'+m.value.toFixed(2));assert.equal(new Set(keys).size,keys.length);
  if(price===0)assert(p.hero.label.startsWith('Gross payout /'));
 }
});
test('gross-only fallback retains Pro vehicle allowance, omits unknown after-fuel amounts',()=>{
 for(const premium of [false,true]){
  const result=analyze({payout:20,distance:10},premium?prefs:null,null),p=present(result);
  assert(!p.hasFuel);assert.equal(p.hero.value,premium?15:20);
  assert(!p.primary.some(m=>m.group==='per-hour'));assert(!p.details.some(m=>m.group==='per-hour'));
  assert(!p.breakdown.some(m=>m.label.includes('fuel')));
 }
});
test('durationless result omits hourly rows and uses no fabricated Free score',()=>{
 const free=present(analyze({payout:20,distance:10},null,a));
 assert(!free.details.some(m=>m.unit==='score'));assert(!free.primary.some(m=>m.unit==='per-hour'));
 assert.equal(free.standardTargets.length,2);
 const premium=present(analyze({payout:20,distance:10},prefs,a));assert(premium.details.some(m=>m.unit==='score'));
 assert(!premium.checks.some(c=>c.title==='Hourly Earnings'));
});
let renders=0;
for(const language of ['en','es'])for(const w of [320,390,1024])for(const scale of [1,1.5,2])for(const theme of [false,true])for(const payout of [40,20,5])for(const duration of [null,30])for(const hasFuel of [false,true]){
 width=w;fontScale=scale;dark=theme;core.setRuntimeLanguage(language);
 const result=analyze({payout,distance:10,estimatedTime:duration},prefs,hasFuel?a:null);
 expanded=false;handlers=[];const html=server.renderToStaticMarkup(React.createElement(OfferResultCard,{result}));
 const label=language==='es'?spanish[result.recommendation.toUpperCase()]:result.recommendation.toUpperCase();assert(html.includes(label));
 assert(!html.includes('NaN'));assert(!html.includes('Infinity'));assert(!html.includes('Unavailable without duration'));
 assert(!html.includes('aria-expanded="true"'));assert(!html.includes('/100'));
 if(!hasFuel)assert(html.includes(language==='es'?spanish['Gross-only mileage · fuel excluded']:'Gross-only mileage'));
 handlers.at(-1)();assert(expanded);handlers=[];
 const details=server.renderToStaticMarkup(React.createElement(OfferResultCard,{result}));
 assert(details.includes('/100'));assert(details.includes(language==='es'?spanish['Why this result?']:'Why this result?'));
 if(duration===null)assert(details.includes(language==='es'?spanish['No duration entered; hourly estimates are omitted.']:'No duration entered'));
 handlers.at(-1)();assert(!expanded);renders+=2;
}
console.log(`PASS ${renders} result renders and actual disclosure handlers across three verdicts, duration/fuel states, English/Spanish, dark/light, phone/iPad and Dynamic Type scales`);
const file=fs.readFileSync(root+'/src/features/offer-analyzer/components/OfferResultCard.tsx','utf8');
assert(file.includes('accessibilityState={{ expanded }}'));assert(file.includes('accessibilityRole="header"'));assert(file.includes('setAccessibilityFocus'));
assert(!file.includes('numberOfLines'));assert(!file.includes('allowFontScaling={false}'));assert(!file.includes('LayoutAnimation'));
const screen=fs.readFileSync(root+'/app/offer-analyzer/screens/OfferAnalyzerScreen.tsx','utf8');
assert(screen.indexOf('<OfferForm')<screen.indexOf('<OfferResultCard'));assert(screen.includes('scrollTo({ y: 0, animated: false })'));
for(const label of ['ACCEPT','CONSIDER','DECLINE','Score','Why this result?','Gross-only mileage · fuel excluded'])assert(spanish[label]);
console.log(`PASS ${groups} presentation groups; immediate result visibility, no motion, focus and accessibility wiring`);
