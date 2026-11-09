/* global __dirname */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react'),server=require('react-dom/server'),native=require('react-native-web');
let slots=[],cursor=0,buttons=[],inputs=[],calls=[],fuelType='gasoline',saved='3.49';
const original=Module._load;
Module._load=function(id,parent,main){
 if(id==='react'&&parent.filename.endsWith('/app/shifts.tsx'))return{...React,useEffect(){},useState(initial){const n=cursor++;if(!(n in slots))slots[n]=typeof initial==='function'?initial():initial;return[slots[n],value=>{slots[n]=typeof value==='function'?value(slots[n]):value;}];}};
 if(id==='react-native')return{...native,Keyboard:{dismiss(){}},useWindowDimensions:()=>({width:390,height:844,fontScale:1,scale:1})};
 if(id==='@/theme/components')return{...native,SafeAreaView:native.View,Pressable:p=>{buttons.push(p);return React.createElement(native.Pressable,p);},TextInput:p=>{inputs.push(p);return React.createElement(native.TextInput,p);}};
 if(id==='@/theme/theme')return{useAppTheme:()=>({dark:false})};
 if(id==='@/i18n/language')return{useLanguage:()=>({locale:'en-US',t:(value)=>value})};
 if(id==='@/components/ui/ScreenHeader'||id==='@/components/ui/PlatformTiles'||id==='@/components/ui/CompactSelect')return{ScreenHeader:()=>null,PlatformTiles:()=>null,CompactSelect:()=>null};
 if(id==='@/features/shifts/duration-picker')return{DurationPicker:()=>null};
 if(id==='@/features/shifts/notifications')return{requestShiftNotifications:async()=>{}};
 if(id==='expo-router')return{useLocalSearchParams:()=>({})};
 if(id==='@/features/shifts/context')return{useShifts:()=>({owner:'1',entries:[],sync:async()=>{}})};
 if(id==='@/features/shifts/journal')return{};
 if(id==='@/features/tracking/services/background-tracking')return{getRecordingMode:()=> 'background',subscribeToRecording:()=>()=>{},startShiftRecording:async()=>{calls.push('record');return true;}};
 if(id==='@/features/vehicles/use-fuel-assumptions')return{useFuelAssumptions:()=>({owner:'1',data:{prices:{[fuelType]:saved}},assumptions:{fuelType}})};
 if(id==='@/features/vehicles/store')return{savePrice:async(owner,type,value)=>calls.push({owner,type,value})};
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));return original.call(this,id,parent,main);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const Screen=require(root+'/app/shifts.tsx').default;
function render(){cursor=0;buttons=[];inputs=[];return server.renderToStaticMarkup(React.createElement(Screen));}
function text(node){return Array.isArray(node)?node.map(text).join(''):node&&typeof node==='object'?text(node.props?.children):String(node??'');}
async function start(){buttons.find(p=>text(p.children)==='Start Shift').onPress();await new Promise(resolve=>setImmediate(resolve));}
(async()=>{
 slots=[];render();assert.equal(inputs[0].value,'3.49');assert.equal(inputs[0].accessibilityLabel,'Fuel price (USD / US gallon)');
 inputs[0].onChangeText('4,25');render();await start();assert.deepEqual(calls,[{owner:'1',type:'gasoline',value:'4.25'},'record']);
 slots=[];calls=[];render();inputs[0].onChangeText('');render();await start();assert.deepEqual(calls,['record']);
 slots=[];calls=[];render();inputs[0].onChangeText('-2');const invalid=render();assert(invalid.includes('Enter a price from 0 to 100'));await start();assert.deepEqual(calls,[]);
 slots=[];calls=[];fuelType='electric';saved='0.18';render();assert.equal(inputs[0].accessibilityLabel,'Electricity price (USD / kWh)');inputs[0].onChangeText('.25');render();await start();assert.deepEqual(calls,[{owner:'1',type:'electric',value:'0.25'},'record']);
 console.log('PASS Shift fuel prefill, gallon/kWh labels, decimal comma, save before recording, optional blank, invalid price guard and EV storage.');
})().catch(error=>{console.error(error);process.exitCode=1;});
