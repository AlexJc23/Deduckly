/* global __dirname */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react'),server=require('react-dom/server'),native=require('react-native-web');
let dark=false,width=320,premium=false,fuel='gasoline';
const profile=()=>({id:'v',version:1,year:2020,make:'Test',model:'Car',trim:'Test configuration',fuel_type:fuel,custom_mpg:30,combined_mpg:25,kwh_per_100_miles:28,is_default:true,deleted:false});
const original=Module._load;
Module._load=function(id,parent,isMain){
 if(id==='react-native')return {...native,useWindowDimensions:()=>({width,height:800,scale:1,fontScale:1.5})};
 if(id==='@react-native-picker/picker'){const Picker=({children})=>React.createElement('select',{},children);Picker.Item=({label,value})=>React.createElement('option',{value},label);return{Picker};}
 if(id==='@/theme/icons')return {Ionicons:()=>null};
 if(id==='react-native-safe-area-context')return{SafeAreaView:native.View};
 if(id==='@react-native-async-storage/async-storage')return{getItem:async()=>null,setItem:async()=>{}};
 if(id==='@/theme/theme'||(id==='./theme'&&parent.filename.includes('/theme/')))return{useAppTheme:()=>({dark})};
 if(id==='expo-router')return{router:{back(){},push(){}}};
 if(id==='@/api/client')return{api:{}};
 if(id==='@/features/auth/services/account-boundary')return{getAccountGeneration:()=>1};
 if(id==='@/features/subscriptions/hooks/use-premium')return{usePremium:()=>({isPremium:premium})};
 if(id==='@/features/vehicles/use-vehicles'||(id==='./use-vehicles'&&parent.filename.includes('/vehicles/')))return{useVehicles:()=>({owner:'1',data:{vehicles:[profile()],pending:[],prices:{gasoline:'3.5',electric:'.16'},quotes:{}},sync:async()=>{}})};
 if(id==='@/features/vehicles/store'||(id==='./store'&&parent.filename.includes('/vehicles/')))return{};
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));
 return original.call(this,id,parent,isMain);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const core=require(root+'/src/i18n/core.ts'),{spanish}=require(root+'/src/i18n/es.ts');
const Screen=require(root+'/app/settings/vehicles.tsx').default;
const {EnergyPanel}=require(root+'/src/features/vehicles/EnergyPanel.tsx');
let renders=0;
for(const language of ['en','es'])for(const w of [320,390,1024])for(const d of [false,true])for(const pro of [false,true])for(const f of ['gasoline','electric']){
 width=w;dark=d;premium=pro;fuel=f;core.setRuntimeLanguage(language);
 const html=server.renderToStaticMarkup(React.createElement(Screen));
 assert(html.includes(language==='es'?'Mis vehículos':'My Vehicles'));assert(html.includes('Test configuration'));
 const result=server.renderToStaticMarkup(React.createElement(EnergyPanel,{offer:{payout:18.5,distance:7.2}}));
 assert(!result.includes('NaN'));assert(!result.includes('Infinity'));
 if(pro)assert(result.includes(language==='es'?'Ingresos estimados':'Estimated earnings'));
 assert.equal(result.includes(language==='es'?'Obtener precio local':'Get local price'),pro);
 renders+=2;
}
for(const file of ['app/settings/vehicles.tsx','src/features/vehicles/EnergyPanel.tsx']){
 const s=fs.readFileSync(path.join(root,file),'utf8');
 for(const m of s.matchAll(/\bt\('([^']+)'\)/g))assert(spanish[m[1]],'Missing Spanish: '+m[1]);
 for(const m of s.matchAll(/(?:title|label)="([^"]+)"/g))assert(spanish[m[1]],'Missing Spanish: '+m[1]);
}
console.log(`PASS ${renders} vehicle/energy renders: English/Spanish, Free/Pro, gas/EV, light/dark, phone/tablet; localization coverage. Native interaction still needs device testing.`);
