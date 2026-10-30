const fs=require('fs'),vm=require('vm'),assert=require('assert');
const handlers={},windowEvents={},document={body:{inert:false},querySelector:()=>null};let timeout;
const ctx={navigator:{serviceWorker:{addEventListener:(name,fn)=>handlers[name]=fn}},document,setTimeout:fn=>{timeout=fn;return 1;},clearTimeout(){},addEventListener:(name,fn)=>windowEvents[name]=fn};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('seo/guide-client.js','utf8'),ctx);
let answer;const request=()=>handlers.message({data:{type:'DOPOP_SAFE_TO_UPDATE'},ports:[{postMessage:value=>answer=value}]});
request();assert.equal(answer.safe,true);assert(document.body.inert);handlers.message({data:{type:'DOPOP_UPDATE_CANCEL'}});assert(!document.body.inert);
document.querySelector=()=>({});request();assert.equal(answer.safe,false);assert(!document.body.inert);
document.querySelector=()=>null;request();handlers.controllerchange();assert(!document.body.inert);request();timeout();assert(!document.body.inert);request();windowEvents.pageshow();assert(!document.body.inert);
console.log('PASS: static guides acknowledge safe updates, defer for dialogs and release locks on cancellation, activation, timeout and history restoration.');
