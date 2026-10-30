const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
let active='snake',dialog=false,resumes=0;const events={};
const document={hidden:false,dispatchEvent(){resumes++},querySelector:s=>s==='.page.active'?{id:active+'Page'}:dialog?{}:null,addEventListener:(n,f)=>(events[n]??=[]).push(f)};
class HTMLDialogElement{querySelector(){return null}showModal(){dialog=true}}
const ctx={document,HTMLDialogElement,CustomEvent:class{constructor(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('app/game-session.js','utf8')+';this.session=GameSession',ctx);
const session=ctx.session;
function key(key,repeat=false,editable=false){let stopped=false,prevented=false;for(const fn of events.keydown){fn({key,repeat,target:{closest:()=>editable?{}:null},stopImmediatePropagation(){stopped=true},preventDefault(){prevented=true}});if(stopped)break;}return {stopped,prevented};}
assert(session.canPlay('snake'));new HTMLDialogElement().showModal();assert(!session.canPlay('snake'));
assert(key('ArrowRight').stopped);assert(!session.resume('snake'));dialog=false;
assert(!session.canPlay('snake'));assert(key('ArrowRight',true).stopped,'held key cannot resume');
assert(key('ArrowRight',false,true).stopped,'editable fields own arrows');assert(!session.canPlay('snake'));
assert(key('Enter').stopped);assert(!session.resume('pac'),'another board cannot resume');
assert(!key('ArrowRight').stopped,'first direction reaches the game');assert(session.canPlay('snake'));assert.equal(resumes,1);
assert(session.blocksInput({closest:()=>({})}));document.hidden=true;events.visibilitychange[0]();assert(!session.canPlay('snake'));
assert(!session.resume('snake'));document.hidden=false;assert(!session.canPlay('snake'));assert(session.resume('snake'));assert(session.canPlay('snake'));
for(const id of ['snake','tetris','pac']){active=id;session.pause();assert(!key('ArrowLeft').stopped);assert(session.canPlay(id));}
const html=fs.readFileSync('dist/index.html','utf8');for(const id of ['tetris','pac','sudoku'])assert(html.includes(`GameSession.canPlay('${id}')`));
assert(!html.includes("$('pacLevel').onchange="));assert(html.includes('function steerMaze(d)'));assert(!html.includes('button.dataset.resume='));
console.log('PASS: fresh movement resumes without consuming the first direction; held keys, dialogs, editable fields, hidden tabs and other boards cannot resume; generated arcade hooks and staged Maze selection.');
