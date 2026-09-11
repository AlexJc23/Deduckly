// Forensic comparison: real AuthProvider/AuthGate effects, mocked native APIs/router.
// Does not claim to exercise native stack animations or live OAuth.
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname, '..');
const ts=require(root+'/node_modules/typescript');
const testModules=process.env.DEDUCKLY_TEST_MODULES;
if (!testModules) throw new Error('Set DEDUCKLY_TEST_MODULES to a temporary node_modules containing react-test-renderer@19.1.0. See docs/startup-navigation-regression.md.');
const React=require(path.join(testModules,'react'));
const {act,create}=require(path.join(testModules,'react-test-renderer'));
global.IS_REACT_ACT_ENVIRONMENT=true;
async function run(rev) {
 const disk=new Map(),cache=new Map(),listeners=new Set(),moves=[];let route='/',response,auth,instance;
 const router={replace(p){moves.push(p);route=p;listeners.forEach(f=>f())},push(p){route=p;listeners.forEach(f=>f())}};
 const client=async()=>({data:{}});client.interceptors={request:{use(){}},response:{use(_,fn){response=fn}}};
 class AxiosError extends Error{constructor(m,c){super(m);this.code=c}}
 const mocks={react:React,'react/jsx-runtime':require(path.join(testModules,'react/jsx-runtime')),'expo-router':{router,useRootNavigationState:()=>({key:'ready'})},'expo-secure-store':{getItemAsync:async k=>disk.get(k)??null,setItemAsync:async(k,v)=>disk.set(k,v),deleteItemAsync:async k=>disk.delete(k)},'@/features/tracking/services/background-tracking':{pauseRecording:async()=>{}},'@/config/env':{ENV:{API_URL:'https://example.invalid'}},'@/features/auth/api/auth.api':{logout:async()=>{}},axios:{create:()=>client,AxiosError}};
 function load(spec,parent=root+'/index.ts'){
  if(mocks[spec])return mocks[spec]; if(!spec.startsWith('@/')&&!spec.startsWith('.'))return require(require.resolve(spec,{paths:[root]}));
  let file=spec.startsWith('@/')?path.join(root,'src',spec.slice(2)):path.resolve(path.dirname(parent),spec);
  file=['.ts','.tsx'].map(ext=>file+ext).find(fs.existsSync);
  if(!file)throw Error(spec);if(cache.has(file))return cache.get(file).exports;
  const module={exports:{}};cache.set(file,module);
  const source=rev==='working'?fs.readFileSync(file,'utf8'):cp.execFileSync('git',['show',rev+':frontend/'+path.relative(root,file)],{cwd:root,encoding:'utf8'});
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',code)(s=>load(s,file),module,module.exports);return module.exports;
 }
 const {AuthProvider,useAuth}=load('@/features/auth/context/auth.context');
 const {AuthGate}=load('@/features/auth/components/auth-gate');
 const service=load('@/features/auth/services/auth-service.service');load('@/api/client');
 function Routes(){auth=useAuth();const r=React.useSyncExternalStore(f=>{listeners.add(f);return()=>listeners.delete(f)},()=>route);return r==='/'?React.createElement(AuthGate):null}
 await act(async()=>{instance=create(React.createElement(AuthProvider,null,React.createElement(Routes)))});
 assert.equal(route,'/(auth)/login');
 await act(async()=>router.push('/(auth)/register'));
 for(let n=0;n<4;n++) await act(async()=>{try{await response({response:{status:401},config:{headers:{}}})}catch{}});
 const result={revision:rev,loginReplacements:moves.filter(p=>p==='/(auth)/login').length,route};
 if(rev==='cf17239'){assert.equal(result.loginReplacements,5);assert.equal(route,'/(auth)/login')}
 else{assert.equal(result.loginReplacements,1);assert.equal(route,'/(auth)/register')}
 if(rev==='working'){
  await act(async()=>router.replace('/(auth)/login'));assert.equal(route,'/(auth)/login');
  await act(async()=>{await service.saveTokens('valid','refresh');auth.signIn();router.replace('/(tabs)/dashboard')});assert.equal(auth.isAuthenticated,true);
  const before=moves.length;await act(async()=>auth.signOut());assert.equal(moves.length,before+1);assert.equal(route,'/(auth)/login');
  await act(async()=>instance.unmount());await service.saveTokens('restored','refresh');route='/';moves.length=0;
  await act(async()=>{instance=create(React.createElement(AuthProvider,null,React.createElement(Routes)))});assert.equal(route,'/(tabs)/dashboard');assert.equal(auth.isAuthenticated,true);
 }
 await act(async()=>instance.unmount());console.log(JSON.stringify(result));
}
(async()=>{for(const rev of ['a0b91ce','cf17239','working'])await run(rev)})().catch(e=>{console.error(e);process.exitCode=1});
