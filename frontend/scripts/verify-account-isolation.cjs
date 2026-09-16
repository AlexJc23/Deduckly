/* global __dirname */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..'), ts = require('typescript');
function harness() {
 const disk = new Map([['access_token','A'],['refresh_token','RA']]);
 let request, success, failure, releaseLogin;
 const calls = [];
 let sdkUser = null, blockLogin = false;
 const sdk = {
  configure(){calls.push('configure')}, isAnonymous: async()=> sdkUser===null,
  async logIn(id){ calls.push('login:'+id); if(blockLogin) await new Promise(r=>{releaseLogin=r}); sdkUser=id; return {customerInfo:{}}; },
  async logOut(){calls.push('logout');sdkUser=null},
  async purchasePackage(){calls.push('purchase:'+sdkUser);return {customerInfo:{}}},
  async restorePurchases(){calls.push('restore:'+sdkUser);return {}},getOfferings:async()=>({}),
 };
 class AxiosError extends Error {constructor(m,c){super(m);this.code=c}}
 const api = async c=> {await request(c);return success({config:c,data:{}})};
 api.interceptors={request:{use:fn=>request=fn},response:{use:(s,f)=>{success=s;failure=f}}};
 const mocks={
  'axios': {AxiosError,create:()=>api},
  '@/features/tracking/services/background-tracking':{pauseRecording:async()=>calls.push('pause')},
  'expo-secure-store':{getItemAsync:async k=>disk.get(k)??null,setItemAsync:async(k,v)=>disk.set(k,v),deleteItemAsync:async k=>disk.delete(k)},
  '@/config/env':{ENV:{API_URL:'https://example.invalid',REVENUECAT_IOS_API_KEY:'test'}},
  'react-native-purchases':sdk,
 };
 const cache=new Map();
 function load(name,parent=root+'/entry.ts') {
  if(mocks[name]) return mocks[name];
  if(!name.startsWith('@/')&&!name.startsWith('.'))return require(name);
  let f=name.startsWith('@/')?path.join(root,'src',name.slice(2)):path.resolve(path.dirname(parent),name);
  if(!/\.tsx?$/.test(f))f+=fs.existsSync(f+'.ts')?'.ts':'.tsx';
  if(cache.has(f))return cache.get(f).exports;
  const mod={exports:{}};cache.set(f,mod);
  const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',code)(n=>load(n,f),mod,mod.exports);return mod.exports;
 }
 const boundary=load('@/features/auth/services/account-boundary'), auth=load('@/features/auth/services/auth-service.service');
 const {queryClient:q}=load('@/providers/query-client');
 load('@/api/client');
 const {createAccountBilling}=load('@/features/subscriptions/services/account-billing');
 return {auth,boundary,q,disk,calls,load,mocks,billing:createAccountBilling(()=> 'test'),request:c=>request(c),success:r=>success(r),failure:e=>failure(e),block:()=>{blockLogin=true},release:()=>{blockLogin=false;releaseLogin()}};
}
(async()=>{
 for (const action of ['logout','invalidated','login']) {
  const h=harness();h.q.setQueryData(['current-user'],{id:'A'});h.q.setQueryData(['trips'],['A']);
  if(action==='logout')await h.auth.clearTokens();
  if(action==='invalidated')await h.auth.invalidateSessionForToken('A');
  if(action==='login')await h.auth.saveTokens('B','RB');
  assert.equal(h.q.getQueryCache().getAll().length,0,action);
 }
 const h=harness();let resolve;
 const config=await h.request({headers:{}});
 const pending=h.q.fetchQuery({queryKey:['current-user'],queryFn:()=>new Promise(r=>{resolve=r})});
 const canceled=assert.rejects(pending);
 await h.auth.saveTokens('B','RB');await canceled;
 h.q.setQueryData(['current-user'],{id:'B'});resolve({id:'A'});await Promise.resolve();
 assert.equal(h.q.getQueryData(['current-user']).id,'B');
 assert.throws(()=>h.success({config,data:{id:'A'}}),/changed/);
 await assert.rejects(h.failure({config,response:{status:401}}),/changed/);
 h.q.setQueryData(['preserve'],1);await h.auth.saveRefreshedTokens('RB','B2','RB2');assert.equal(h.q.getQueryData(['preserve']),1);
 const mutationHarness=harness();const mc=await mutationHarness.request({headers:{}});
 const mutation=mutationHarness.q.getMutationCache().build(mutationHarness.q,{
  mutationFn:async()=>{
   const response=mutationHarness.success({config:mc,data:{id:77,owner:'A'}});
   queueMicrotask(()=>mutationHarness.auth.saveTokens('B','RB'));
   return response.data;
  },
  onSuccess:data=>mutationHarness.q.setQueryData(['expense',77],data),
 });
 await mutation.execute().catch(error=>assert.match(error.message,/changed/));await new Promise(r=>setImmediate(r));
 assert.equal(mutationHarness.q.getQueryData(['expense',77]),undefined);
 const b=h.billing;await b.logIn('B');await b.purchasePackage({});
 await h.auth.clearTokens();assert.equal(b.getSnapshot().ready,false);await assert.rejects(b.restorePurchases(),/not ready/);
 await b.logOut();assert(h.calls.includes('logout'));
 await h.auth.saveTokens('C','RC');h.block();const login=b.logIn('C');
 await Promise.resolve();await Promise.resolve();assert.equal(b.getSnapshot().ready,false);
 await assert.rejects(b.purchasePackage({}),/not ready/);
 h.release();await login;await b.restorePurchases();assert.equal(h.calls.at(-1),'restore:C');
 const overlap=harness();overlap.block();
 const first=assert.rejects(overlap.billing.logIn('A'),/changed/);
 await Promise.resolve();await Promise.resolve();
 await overlap.auth.clearTokens();await overlap.auth.saveTokens('B','RB');
 const second=overlap.billing.logIn('B');
 assert.equal(overlap.billing.getSnapshot().ready,false);
 overlap.release();await first;await second;
 assert.deepEqual(overlap.calls.filter(x=>x.startsWith('login:')||x==='logout'),['login:A','logout','login:B']);
 assert.equal(overlap.billing.getSnapshot().userId,'B');
 const failed=harness();failed.mocks['react-native-purchases'].logIn=async()=>{throw new Error('SDK failure')};
 await assert.rejects(failed.billing.logIn('A'),/SDK failure/);
 assert.equal(failed.billing.getSnapshot().ready,false);
 await assert.rejects(failed.billing.restorePurchases(),/not ready/);
 const guest=harness();let options;
 guest.mocks['@tanstack/react-query']={useQuery:o=>{options=o;return {}}};
 guest.mocks['../context/auth.context']={useAuth:()=>({isAuthenticated:false,isLoading:false})};
 guest.load('@/features/auth/hooks/use-current-user').useCurrentUser();assert.equal(options.enabled,false);
 console.log('PASS account isolation: explicit/automatic cleanup, B login, late queries/responses/401, refresh preservation, SDK reset/serialization/readiness, guest guard');
})().catch(e=>{console.error(e);process.exitCode=1});
