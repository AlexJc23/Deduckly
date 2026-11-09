/* global __dirname */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
for(const custom of [false,true]){
 const resolver=(_context,name)=>({type:'sourceFile',filePath:name});
 const base={transformer:{},resolver:{assetExts:['svg','png'],sourceExts:['ts','tsx'],...(custom?{resolveRequest:resolver}:{})}};
 const mock=name=>{if(name==='expo/metro-config')return{getDefaultConfig:()=>base};throw Error('Unexpected dependency: '+name);};
 mock.resolve=name=>name;
 const context={require:mock,module:{exports:{}},__dirname:root};
 vm.runInNewContext(fs.readFileSync(path.join(root,'metro.config.js'),'utf8'),context);
 const config=context.module.exports;
 assert.equal(config.resolver.resolveRequest,custom?resolver:undefined,'SDK 58 retains its default resolver without the SDK 54 socket workaround');
 assert(config.resolver.assetExts.includes('png'));
 assert(!config.resolver.assetExts.includes('svg'));
 assert(config.resolver.sourceExts.includes('svg'));
 assert.equal(config.transformer.babelTransformerPath,'react-native-svg-transformer/expo');
 if(custom)for(const file of ['messageSocket.native.ts','setupFastRefresh.ts','asset.svg'])assert.equal(config.resolver.resolveRequest({},file,'ios').filePath,file);
}
console.log('PASS SDK 58 Metro default/custom resolver and reload sockets are preserved, with SVG transformation enabled.');
