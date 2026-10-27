const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('pwa/client.js','utf8');
const logic=source.slice(source.indexOf(' const safeHere='),source.indexOf(" window.addEventListener('beforeinstallprompt'"));
async function test(options={}){
 let requests=0,reloads=0;const handlers={},intervals=[];
 const context={atHome:()=>options.home!==false,document:{hidden:!!options.hidden,querySelector:()=>options.dialog?{}:null,addEventListener:(n,f)=>handlers[n]=f},navigator:{onLine:options.online!==false},registration:{waiting:{},update:async()=>{}},applyingUpdate:false,pendingReload:false,updateLocked:false,update:{},status:{},home:{},message:async()=>{requests++;return {ok:options.otherPlaying!==true,reason:'busy'}},location:{reload:()=>reloads++},window:{addEventListener(){}},MutationObserver:class{constructor(f){handlers.home=f}observe(){}},setInterval:f=>intervals.push(f),lastCheck:0,Date,showStatus(){},check(){},register(){}};
 vm.createContext(context);vm.runInContext(logic,context);context.maybeUpdate();await new Promise(setImmediate);
 return {context,requests:()=>requests,reloads:()=>reloads,handlers};
}
(async()=>{
 for(const option of [{home:false},{dialog:true},{hidden:true},{online:false}]){const t=await test(option);assert.equal(t.requests(),0);assert.equal(t.reloads(),0);}
 const home=await test();assert.equal(home.requests(),1);assert.equal(home.reloads(),0,'activation event, not request, triggers reload');
 const blocked=await test({otherPlaying:true});assert.equal(blocked.reloads(),0);assert.equal(blocked.context.home.inert,false);
 const playing=await test({home:false});playing.context.pendingReload=true;playing.context.maybeUpdate();assert.equal(playing.reloads(),0);
 const pending=await test();pending.context.pendingReload=true;pending.context.maybeUpdate();assert.equal(pending.reloads(),1);
 console.log('PASS: automatic update defers during games, dialogs, background/offline; rejected handshake does not reload; pending reload waits for home.');
})().catch(e=>{console.error(e);process.exit(1)});
