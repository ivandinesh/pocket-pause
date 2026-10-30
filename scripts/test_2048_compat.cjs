// Golden behavior captured from main 81ecb11 before the licensed-engine replacement.
// Compare outputs rather than retaining the unverified legacy implementation.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const html=require('./release_source.cjs').html();
const src=html.slice(html.indexOf('function dopopMerge('),html.indexOf('function dopopDotConfig('));
const context={};vm.createContext(context);vm.runInContext(src,context);
const hash=crypto.createHash('sha256');let count=0;
function check(board){
 const before=JSON.stringify(board);
 for(const direction of ['left','right','up','down']){
  const result=context.dopopMerge(board,direction);
  result.tracks.sort((a,b)=>a.from-b.from);
  hash.update(JSON.stringify(result)+'\n');count++;
  assert.equal(JSON.stringify(board),before,'input board mutated');
 }
 hash.update(JSON.stringify(context.dopopCanMove(board))+'\n');
}
// Exhaust every short row over empty, small merges and the win boundary.
const values=[0,2,4,8,1024,2048];
for(const a of values)for(const b of values)for(const c of values)for(const d of values){
 const row=[a,b,c,d];check(row.concat(Array(12).fill(0)));
 const column=Array(16).fill(0);row.forEach((v,i)=>column[i*4]=v);check(column);
}
let seed=93721;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
for(let n=0;n<1500;n++)check(Array.from({length:16},()=>{const k=random()%15;return k<3?0:2**(k-2);}));
const actual={moves:count,sha256:hash.digest('hex')};
assert.deepEqual(actual,JSON.parse(fs.readFileSync('scripts/2048-behavior.json','utf8')));
console.log('PASS: '+count+' legacy-equivalent 2048 moves, animation destinations, scores, move availability and input immutability.');
