/* global __dirname */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react'),server=require('react-dom/server'),native=require('react-native-web');
let handlers=[],inputs=[],slots={},cursors={},premium=false,captured=null;
const fuel={assumptions:{economy:25,price:3.25,fuelType:'gasoline',vehicle:'Test Car',source:'Saved manual fuel price'},owner:'1',data:{prices:{gasoline:'3.25'}}};
let priceValue='3.25';
const original=Module._load;
Module._load=function(id,parent,main){
 if(id==='react'&& /OfferForm\.tsx|OfferAnalyzerScreen\.tsx/.test(parent.filename))return{...React,useEffect(){},useSyncExternalStore:()=>1,useRef:()=>({current:null}),useState(initial){const key=parent.filename,n=cursors[key]??0;cursors[key]=n+1;slots[key]??=[];if(!(n in slots[key]))slots[key][n]=typeof initial==='function'?initial():initial;return[slots[key][n],value=>{slots[key][n]=typeof value==='function'?value(slots[key][n]):value;}];}};
 if(id==='react-native')return{...native,Platform:{OS:'ios'},Keyboard:{dismiss(){}},useWindowDimensions:()=>({width:390,height:844,fontScale:1,scale:1}),TextInput:p=>{inputs.push(p);return React.createElement(native.TextInput,p)},Pressable:p=>{handlers.push(p);return React.createElement(native.Pressable,p)}};
 if(id==='react-native-safe-area-context')return{SafeAreaView:native.View};
 if(id==='@/theme/theme'||(id==='./theme'&&parent.filename.includes('/theme/')))return{useAppTheme:()=>({dark:true})};
 if(id==='@/theme/icons')return{Ionicons:()=>null};
 if(id==='@/components/ui/BackButton')return{BackHeader:()=>null};
 if(id==='@/components/ui/PremiumButton')return{__esModule:true,default:()=>null};
 if(id==='@react-native-async-storage/async-storage')return{getItem:async()=>null,setItem:async()=>{}};
 if(id==='@/features/auth/services/account-boundary')return{subscribeAccountBoundary:()=>()=>{},getAccountGeneration:()=>1};
 if(id==='@/features/vehicles/store')return{savePrice:async()=>{}};
 if(id==='@/features/vehicles/use-fuel-assumptions')return{useFuelAssumptions:()=>fuel};
 if(id==='@/features/vehicles/use-fuel-price-editor')return{useFuelPriceEditor:()=>({value:priceValue,parsed:{valid:true,price:priceValue===''?null:Number(priceValue)},dirty:true,commit(){},change:v=>{priceValue=v}})};
 if(id==='@/features/settings/hooks/usePreferences')return{usePreferences:()=>({preferences:{costPerMile:.5,minimumProfit:10,minimumHourlyRate:20,minimumDollarsPerMile:2,preferredMaxDistance:20}})};
 if(id==='@/features/subscriptions/hooks/use-premium')return{usePremium:()=>({isPremium:premium})};
 if(id==='@/features/offer-analyzer/components/OfferResultCard')return{OfferResultCard:({result})=>{captured=result;return React.createElement(native.Text,{},'RESULT '+result.payout)}};
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));return original.call(this,id,parent,main);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const Screen=require(root+'/app/offer-analyzer/screens/OfferAnalyzerScreen.tsx').default;
const {dailyMotivation,motivations}=require(root+'/src/features/dashboard/motivation.ts');
const core=require(root+'/src/i18n/core.ts'),{spanish}=require(root+'/src/i18n/es.ts');
function render(){cursors={};handlers=[];inputs=[];captured=null;return server.renderToStaticMarkup(React.createElement(Screen));}
const label=p=>JSON.stringify(p.children);
for(const lang of ['en','es'])for(premium of [false,true]){
 core.setRuntimeLanguage(lang);slots={};priceValue='3.25';
 let html=render();assert.equal(inputs.length,4);assert(!html.includes('RESULT'));inputs[0].onChangeText('18.50');inputs[1].onChangeText('7.2');
 render();handlers.find(p=>label(p).includes('Analyze Offer')).onPress();html=render();assert.equal(inputs.length,0);assert(html.includes(lang==='es'?'Oferta analizada':'Analyzed offer'));assert(html.includes('RESULT'));assert(html.indexOf(lang==='es'?'Oferta analizada':'Analyzed offer')<html.indexOf('RESULT'));assert.equal(captured.fuel.cost,.94);
 handlers.find(p=>p.accessibilityState?.expanded===false).onPress();html=render();assert(!html.includes('RESULT'));assert.equal(inputs[0].value,'18.50');assert.equal(inputs[1].value,'7.2');assert.equal(inputs[3].value,'3.25');
 inputs[0].onChangeText('5');inputs[2].onChangeText('30');inputs[3].onChangeText('4');render();handlers.find(p=>label(p).includes('Analyze Offer')).onPress();render();assert.equal(captured.fuel.cost,1.15);assert(captured.hourlyRate!==null);
 handlers.find(p=>p.accessibilityState?.expanded===false).onPress();render();inputs[3].onChangeText('');render();handlers.find(p=>label(p).includes('Analyze Offer')).onPress();render();assert.equal(captured.fuel.cost,null);
}
for(const phrase of motivations)assert(spanish[phrase]);
assert.equal(dailyMotivation(new Date(2026,9,16,1)),dailyMotivation(new Date(2026,9,16,23,59)));
assert.notEqual(dailyMotivation(new Date(2026,9,16)),dailyMotivation(new Date(2026,9,17)));
assert(motivations.includes(dailyMotivation(new Date(2026,11,31))));
const dashboard=fs.readFileSync(root+'/app/(tabs)/dashboard.tsx','utf8');assert(!dashboard.includes('>Deduckly<'));assert(!dashboard.includes('View your trips'));assert(dashboard.includes('<ScrollView'));assert(!dashboard.includes('scrollEnabled={false}'));assert(dashboard.includes('fontScale<=1'));assert(dashboard.includes('s.shiftButton'));assert(dashboard.includes('summary.businessTrips'));
console.log('PASS 4 real Analyzer form/collapse/edit/reanalysis flows (Free/Pro, EN/ES), optional price, retained values and stale-result removal; daily localized motivation and Dashboard guardrails.');
