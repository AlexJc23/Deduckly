/* global __dirname */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const ts=require(require.resolve('typescript',{paths:[root]}));
async function run(result){
 const saved=[],temporary=[];
 const mocks={
  'expo-web-browser':{maybeCompleteAuthSession(){},openAuthSessionAsync:async()=>result},
  'expo-linking':{createURL:()=> 'deduckly://oauth/callback'},
  '@/config/env':{ENV:{API_URL:'https://example.invalid'}},
  '@/features/auth/services/auth-service.service':{saveTokens:async(...args)=>saved.push(args)},
  '@/features/auth/services/twofa-storage.service':{setTemporaryToken:token=>temporary.push(token)},
 };
 const code=ts.transpileModule(fs.readFileSync(path.join(root,'src/features/auth/api/google-auth.api.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};new Function('require','module','exports',code)(name=>{assert(name in mocks,name);return mocks[name]},mod,mod.exports);
 return {result:await mod.exports.startGoogleLogin(),saved,temporary};
}
(async()=>{
 let h=await run({type:'success',url:'deduckly://oauth/callback?access_token=temp&requires_2fa=true'});
 assert.equal(h.result,'two-factor');assert.deepEqual(h.saved,[]);assert.deepEqual(h.temporary,['temp']);
 h=await run({type:'success',url:'deduckly://oauth/callback?access_token=access&refresh_token=refresh'});
 assert.equal(h.result,true);assert.deepEqual(h.saved,[['access','refresh']]);assert.deepEqual(h.temporary,[]);
 for(const result of [{type:'cancel'},{type:'success',url:'deduckly://oauth/callback?requires_2fa=true'},{type:'success',url:'deduckly://oauth/callback?access_token=temp&requires_2fa=true&refresh_token=refresh'},{type:'success',url:'deduckly://oauth/callback?access_token=partial'}]){
  h=await run(result);assert.equal(h.result,false);assert.deepEqual(h.saved,[]);assert.deepEqual(h.temporary,[]);
 }
 console.log('PASS Google client: 2FA, normal login, cancellation, missing and conflicting credentials (6 cases)');
})().catch(e=>{console.error(e);process.exitCode=1});
