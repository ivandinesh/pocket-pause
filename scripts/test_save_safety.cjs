const fs=require('fs'),vm=require('vm'),assert=require('assert');const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('pwa/save-safety.js','utf8'),context);const S=context.DoPopSaveSafety;
const store=()=>{const data=new Map([['pocketpause.v1.sound','true'],['unrelated','secret']]);return{data,get length(){return data.size},key:n=>[...data.keys()][n],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
const backup=entries=>({app:'dopop',version:1,entries});assert.equal(S.validate(backup([['pocketpause.v1.sound','true']])).length,1);
for(const entries of [[['other','x']],[['pocketpause.v1.unknown','1']],[['pocketpause.v1.sound','false'],['pocketpause.v1.sound','true']],[['pocketpause.v1.sudoku.progress','{"puzzle":{}}']],[['pocketpause.v1.words.progress','{"__proto__":{}}']]])assert.throws(()=>S.validate(backup(entries)));
let a=store(),reads=0;const get=a.getItem;a.getItem=k=>{if(!reads++)throw Error('read failed');return get(k)};assert.equal(S.replace(a,[]).result,'aborted');assert.equal(a.data.get('pocketpause.v1.sound'),'true');assert.equal(a.data.get('unrelated'),'secret');
a=store();let writes=0;const set=a.setItem;a.setItem=(k,v)=>{if(!writes++)throw Error('quota');set(k,v)};assert.equal(S.replace(a,[['pocketpause.v1.sound','false']]).result,'rolled_back');assert.equal(a.getItem('pocketpause.v1.sound'),'true');
a=store();a.setItem=()=>{throw Error('blocked')};assert.equal(S.replace(a,[['pocketpause.v1.sound','false']]).result,'rollback_failed');
a=store();assert.equal(S.replace(a,[['pocketpause.v1.sound','false']]).result,'restored');assert.equal(a.getItem('unrelated'),'secret');assert.equal(a.getItem('pocketpause.v1.sound'),'false');
console.log('PASS: registry boundaries, malformed saves, initial-read failure without deletion, write rollback, incomplete recovery and unrelated-storage preservation.');

const board=Array.from({length:9},()=>Array(9).fill(0)),notes=Array.from({length:81},()=>[]),sudoku={puzzle:board,solution:board,board,notes,history:[{i:0,prev:0,prevNotes:[]}],elapsed:0,selected:0};
assert.equal(S.validate(backup([['pocketpause.v1.sudoku.progress',JSON.stringify(sudoku)]])).length,1);
sudoku.history[0].i=900;assert.throws(()=>S.validate(backup([['pocketpause.v1.sudoku.progress',JSON.stringify(sudoku)]])));
// A page restored from the back/forward cache must discard pre-restore memory.
const listeners={},device=store();let reloads=0;const old={localStorage:device,addEventListener:(name,fn)=>listeners[name]=fn,document:{documentElement:{dataset:{}}},location:{reload:()=>reloads++}};vm.createContext(old);vm.runInContext(fs.readFileSync('pwa/save-safety.js','utf8'),old);device.setItem('dopop.save-generation','new-restore');listeners.pageshow({persisted:true});assert.equal(reloads,1);assert.equal(old.document.documentElement.dataset.dopopRestoringSaves,'true');assert(!old.DoPopSaveSafety.owned('dopop.save-generation'));
console.log('PASS: restored browser pages cannot revive memory from before a backup restore; restore metadata is excluded from backups.');
