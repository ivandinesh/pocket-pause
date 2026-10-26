// Run after python3 scripts/build.py. Tests the rules emitted in the actual build.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8');
const core=html.slice(html.indexOf('function dopopMerge('),html.indexOf('(()=>{',html.indexOf('function dopopMerge(')));
const generator=html.slice(html.indexOf(' function random(state)'),html.indexOf(' let dots=read(',html.indexOf(' function random(state)')));
const spawn=html.slice(html.indexOf(' function spawnMerge(state)'),html.indexOf(' let merge=read(',html.indexOf(' function spawnMerge(state)')));
const c={};vm.createContext(c);vm.runInContext(core+generator+spawn,c);const array=x=>JSON.parse(JSON.stringify(x));
const board=row=>row.concat(Array(12).fill(0));
for(const [input,expected,gain] of [[[2,2,2,2],[4,4,0,0],8],[[4,2,2,0],[4,4,0,0],4],[[2,0,2,4],[4,4,0,0],4],[[4,4,8,8],[8,16,0,0],24],[[2,4,8,16],[2,4,8,16],0]]){
 const r=c.dopopMerge(board(input),'left');assert.deepEqual(array(r.board.slice(0,4)),expected);assert.equal(r.gain,gain);
}
assert.deepEqual(array(c.dopopMerge(board([2,2,2,2]),'right').board.slice(0,4)),[0,0,4,4]);
const vertical=Array(16).fill(0);[0,4,8,12].forEach(i=>vertical[i]=2);assert.deepEqual(array(c.dopopMerge(vertical,'up').board),[4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0]);
assert.deepEqual(array(c.dopopMerge(vertical,'down').board),[0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0]);
assert.equal(c.dopopMerge(board([2,4,8,16]),'left').changed,false);
assert.equal(c.dopopCanMove([2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2]),false);
assert.equal(c.dopopCanMove([2,2,4,8,4,8,16,32,8,16,32,64,16,32,64,128]),true);
assert.equal(c.dopopMerge(board([1024,1024,0,0]),'left').board[0],2048);
for(let t=0;t<500;t++){const b=Array.from({length:16},()=>Math.random()<.3?0:2**(1+Math.floor(Math.random()*8)));for(const dir of ['left','right','up','down']){const r=c.dopopMerge(b,dir);assert.equal(r.board.reduce((a,b)=>a+b,0),b.reduce((a,b)=>a+b,0));assert.equal(r.tracks.length,b.filter(Boolean).length);}}
const z={board:Array(16).fill(0),seed:99};const z2=structuredClone(z);c.spawnMerge(z);c.spawnMerge(z2);assert.deepEqual(z,z2);assert.equal(z.board.filter(Boolean).length,1);
const dots=[0,0,1,0,0,1,1,1,0];let path=[];for(const i of [0,1,4,3])path=c.dopopDotPath(dots,path,i,3).path;assert.equal(c.dopopDotPath(dots,path,0,3).loop,true);assert.deepEqual(array(c.dopopClearDots(dots,path,true)),[0,1,3,4,8]);assert.deepEqual(array(c.dopopDotPath(dots,path,4,3).path),[0,1,4]);assert.equal(c.dopopDotPath(dots,[0],4,3).path.length,1);assert.equal(c.dopopDotPath(dots,[1],2,3).path.length,1);
for(let level=1;level<=100;level++){const a=c.newDots(level),b=c.newDots(level);assert.deepEqual(array(a),array(b));assert(c.validDots(a));assert(c.dopopDotHasMove(a.board,a.n));assert.equal(new Set(a.frost).size,a.frost.length);assert(a.moves>=24);assert(a.goals.filter(Boolean).length>=2);}
assert(!c.validMerge({board:[2]}));assert(!c.validDots({level:101}));
console.log('PASS: 2048 directional merges, once-per-move rules, score, win/loss, unchanged moves, 2,000 conservation cases, deterministic spawn; dots loops/backtrack/illegal moves and all 100 levels.');
