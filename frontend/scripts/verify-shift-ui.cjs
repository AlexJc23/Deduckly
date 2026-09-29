/* global __dirname */
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require('typescript'), React = require('react'), server = require('react-dom/server'), native = require('react-native-web');
let dark = false, entries = [], width = 320;
const original = Module._load;
Module._load = function(id, parent, isMain) {
  if(id === 'react-native') return {...native, useWindowDimensions:()=>({width,height:800,scale:1,fontScale:1.5})};
  if(id === 'react-native-safe-area-context') return { SafeAreaView:native.View };
  if(id === '@react-native-async-storage/async-storage') return { getItem:async()=>null, setItem:async()=>{} };
  if(id === '@/theme/theme' || (id === './theme' && parent.filename.includes('/theme/'))) return { useAppTheme:()=>({dark}) };
  if(id === 'expo-router') return { router:{back(){},push(){}}, useLocalSearchParams:()=>({id:entries[0]?.data.client_id}) };
  if(id === '@/features/shifts/context') return { useShifts:()=>({owner:'1',entries,syncError:false,sync:async()=>{}}) };
  if(id === '@/features/shifts/journal') return {};
  if(id === '@/features/tracking/services/background-tracking') return {getRecordingMode:()=> 'background',subscribeToRecording:()=>()=>{}};
  if(id.startsWith('@/')) id=path.join(root,'src',id.slice(2));
  return original.call(this,id,parent,isMain);
};
for(const ext of ['.ts','.tsx']) require.extensions[ext]=(module,file)=>{
  module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
};
const core=require(root+'/src/i18n/core.ts');
const {spanish}=require(root+'/src/i18n/es.ts');
const Screen=require(root+'/app/shifts.tsx').default;
const sources=['app/shifts.tsx','src/features/shifts/entry-point.tsx'];
for(const file of sources) {
  const content=fs.readFileSync(path.join(root,file),'utf8');
  for(const match of content.matchAll(/\bt\('([^']+)'\)/g)) assert(spanish[match[1]], `Missing Spanish: ${match[1]}`);
}
const fixture={owner:'1',local:true,dirty:true,sequence:1,detector:{miles:0,driving:false},data:{client_id:'s',revision:0,started_at:'2026-09-28T08:00:00Z',ended_at:null,planned_end_at:null,platform_sessions:[{client_id:'p',platform:'spark',started_at:'2026-09-28T08:00:00Z',ended_at:null}],segments:[{client_id:'seg',started_at:'2026-09-28T08:00:00Z',ended_at:'2026-09-28T09:00:00Z',distance_miles:5,category:'personal',platform_client_id:'p',excluded:false}]}};
let renders=0;
for(const language of ['en','es']) for(const w of [320,390,1024]) for(const isDark of [false,true]) for(const state of ['empty','active','ended']) {
  width=w;dark=isDark;core.setRuntimeLanguage(language);
  entries=state==='empty'?[]:[JSON.parse(JSON.stringify(fixture))];
  if(state==='ended'){entries[0].local=true;entries[0].data.ended_at='2026-09-28T10:00:00Z';}
  const html=server.renderToStaticMarkup(React.createElement(Screen));
  assert(html.includes(language==='es'?'Modo turno':'Shift Mode'));
  assert(html.includes(language==='es'?'Historial de turnos':'Shift history'));
  if(state!=='empty') assert(html.includes(language==='es'?'Revisar tramos':'Review segments'));
  assert(!html.includes('NaN')); renders++;
}
const source=fs.readFileSync(path.join(root,'app/shifts.tsx'),'utf8');
assert(source.includes('maxWidth: 760'));assert(source.includes("flexWrap: 'wrap'"));assert(source.includes('minHeight: 48'));assert(source.includes('ScrollView'));
console.log(`PASS ${renders} Shift renders (English/Spanish, light/dark, small phone/phone/tablet, empty/active/ended) and responsive constraints. Native pixel layout still needs device checks.`);
