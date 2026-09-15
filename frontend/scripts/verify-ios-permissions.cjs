const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, mocks) {
 const m = { exports: {} };
 const code = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(id => Object.hasOwn(mocks,id) ? mocks[id] : require(id),m,m.exports);return m.exports;
}
async function scenario(initial, result, failSetup=false) {
 let status=initial, requests=0, advances=0, slots=[], i=0, mounted=false, refresh, action;
 const Component=load('src/features/onboarding/components/ios-permission-screen.tsx',{
  react:{useState:v=>{const n=i++;if(!(n in slots))slots[n]=v;return [slots[n],v=>slots[n]=v];},useEffect:fn=>{if(!mounted){mounted=true;fn();}}},
  'react-native':{AppState:{addEventListener:(_,fn)=>{refresh=fn;return {remove(){}};}}},
  'expo-router':{Stack:{Screen:'StackScreen'}},
  './onboarding-screen':{OnboardingScreen:'OnboardingScreen'},
 }).IOSPermissionScreen;
 const props={content:{title:'Location',action:'Enable location',features:[]},getPermission:async()=>status,requestPermission:async()=>{requests++;status=result;return status;},deniedMessage:'Needs Settings',onGranted:async()=>{if(failSetup)throw Error('offline');},onboarding:{loading:false,runAction:fn=>{action=Promise.resolve().then(fn).then(ok=>{if(ok)advances++;}).catch(()=>{});}}};
 function render(){i=0;const tree=Component(props);assert.equal(tree.props.children[0].props.options.gestureEnabled,false);return tree.props.children[1].props;}
 render();await Promise.resolve();let view=render();
 assert.equal(view.onSkip,undefined);
 assert.equal(requests,0,'no automatic permission prompt');
 await view.onContinue();await action;view=render();
 return {view,requests,advances,async next(){view.onContinue();await action;return {requests,advances};},async settingsGranted(){status={granted:true,status:'granted',canAskAgain:true};refresh('active');await Promise.resolve();view=render();view.onContinue();await action;return {requests,advances};}};
}
(async()=>{
 const unknown={granted:false,status:'undetermined',canAskAgain:true};
 const granted={granted:true,status:'granted',canAskAgain:true};
 const denied={granted:false,status:'denied',canAskAgain:false};
 let s=await scenario(unknown,granted);assert.equal(s.requests,1);assert.equal(s.advances,1);
 s=await scenario(unknown,denied);assert.equal(s.requests,1);assert.equal(s.advances,0);assert.equal(s.view.screen.action,'Continue without access');assert.equal(s.view.onboarding.settings,true);assert.deepEqual(await s.next(),{requests:1,advances:1});
 s=await scenario(denied,granted);assert.equal(s.requests,0);assert.equal(s.advances,1);
 s=await scenario({...denied,canAskAgain:true},granted);assert.equal(s.requests,0,'do not re-prompt a known denial');
 s=await scenario(unknown,denied);assert.deepEqual(await s.settingsGranted(),{requests:1,advances:1});
 s=await scenario(unknown,granted,true);assert.equal(s.advances,0);assert.equal(s.view.screen.action,'Continue without access');assert.deepEqual(await s.next(),{requests:1,advances:1});
 console.log('PASS iOS permission screen: single neutral action, explicit request, denial recovery, no re-prompt, Settings refresh, setup failure escape, disabled back gesture.');
})();
