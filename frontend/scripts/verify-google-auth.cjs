/* global __dirname */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ts=require('typescript');
async function run(result,tokens={access_token:'access',refresh_token:'refresh'},url='https://example.invalid'){
 const saved=[],temporary=[],exchanges=[];
 const mocks={
  'expo-web-browser':{maybeCompleteAuthSession(){},openAuthSessionAsync:async()=>result},
  'expo-linking':{createURL:()=> 'deduckly://oauth/callback'},
  'expo-auth-session':{AuthRequest:class{async getAuthRequestConfigAsync(){this.codeChallenge='challenge';this.codeVerifier='verifier'}},ResponseType:{Code:'code'},CodeChallengeMethod:{S256:'S256'}},
  '@/api/client':{api:{post:async(route,body)=>{
    if(route.endsWith('/start'))return {data:{state:'state',authorization_url:'https://accounts.google.com/o/oauth2/v2/auth'}};
    exchanges.push(body);return {data:tokens};
  }}},
  '@/config/env':{ENV:{API_URL:url}},
  '@/features/auth/services/auth-service.service':{saveTokens:async(...args)=>saved.push(args)},
  '@/features/auth/services/twofa-storage.service':{setTemporaryToken:token=>temporary.push(token)},
 };
 const code=ts.transpileModule(fs.readFileSync(path.join(root,'src/features/auth/api/google-auth.api.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};new Function('require','module','exports',code)(name=>{assert(name in mocks,name);return mocks[name]},mod,mod.exports);
 return {result:await mod.exports.startGoogleLogin(),saved,temporary,exchanges};
}
(async()=>{
 const valid={type:'success',url:'deduckly://oauth/callback?state=state&code=exchange'};
 let h=await run(valid);assert.equal(h.result,true);assert.deepEqual(h.saved,[['access','refresh']]);assert.deepEqual(h.exchanges,[{state:'state',code:'exchange',code_verifier:'verifier'}]);
 h=await run(valid,{access_token:'temporary',requires_2fa:true});assert.equal(h.result,'two-factor');assert.deepEqual(h.saved,[]);assert.deepEqual(h.temporary,['temporary']);
 for(const result of [{type:'cancel'},...['?state=wrong&code=exchange','?code=exchange','?state=state&code=exchange&code=other','?state=state&access_token=full&refresh_token=full','?state=state&error=cancelled'].map(q=>({type:'success',url:'deduckly://oauth/callback'+q})),{type:'success',url:'other://oauth/callback?state=state&code=exchange'}]){
  h=await run(result);assert.equal(h.result,false);assert.deepEqual(h.saved,[]);assert.deepEqual(h.temporary,[]);assert.deepEqual(h.exchanges,[]);
 }
 await assert.rejects(run(valid,undefined,'http://example.invalid'),/could not be completed/);
 console.log('PASS Google client: HTTPS exchange, normal/2FA, cancellation, state, duplicate code, legacy token links, wrong callback');
})().catch(e=>{console.error(e);process.exitCode=1});
