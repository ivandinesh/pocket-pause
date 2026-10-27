const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
let active='snake',dialog=false,button;const events={};
const page={querySelector:s=>s==='[data-resume]'?button:{append:b=>button=b}};
const document={hidden:false,dispatchEvent(){},querySelector:s=>s==='.page.active'?{id:active+'Page'}:dialog?{}:null,getElementById:()=>page,createElement:()=>({dataset:{},remove(){button=null}}),addEventListener:(n,f)=>(events[n]??=[]).push(f)};
class HTMLDialogElement{querySelector(){return null}showModal(){dialog=true}}
const ctx={document,HTMLDialogElement,CustomEvent:class{constructor(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('app/game-session.js','utf8')+';this.session=GameSession',ctx);
assert(ctx.session.canPlay('snake'));new HTMLDialogElement().showModal();assert(!ctx.session.canPlay('snake'));dialog=false;assert(!ctx.session.canPlay('snake'));button.onclick();assert(ctx.session.canPlay('snake'));
assert(ctx.session.blocksInput({closest:()=>({})}));document.hidden=true;events.visibilitychange[0]();assert(!ctx.session.canPlay('snake'));document.hidden=false;assert(!ctx.session.canPlay('snake'));button.onclick();assert(ctx.session.canPlay('snake'));
const html=fs.readFileSync('dist/index.html','utf8');assert(html.includes("GameSession.canPlay('tetris')"));assert(html.includes("GameSession.canPlay('pac')"));assert(html.includes("GameSession.canPlay('sudoku')"));assert(!html.includes("$('pacLevel').onchange="));
console.log('PASS: dialog and visibility pause require explicit resume; editable input guard; generated arcade/timer hooks and staged Pac-Man selection.');
