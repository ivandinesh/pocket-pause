const assert=require('node:assert/strict'),fs=require('fs'),crypto=require('crypto'),C=require('../games/quiet-core.js'),V=require('./quiet-solvers.cjs');
const manifest=JSON.parse(fs.readFileSync('games/quiet-pack-manifest.json')),specs=JSON.parse(fs.readFileSync('games/quiet-specs.json'));
assert.equal(specs.length,16);assert.deepEqual(specs.map(s=>s.id),C.ids);let total=0;
for(const id of C.ids){
 const raw=fs.readFileSync('games/quiet-levels/'+id+'.json'),pack=JSON.parse(raw);assert.equal(pack.length,30);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),manifest.levels[id].sha256);
 assert.equal(new Set(pack.map(c=>JSON.stringify(c))).size,30);
 for(const c of pack){
  total++;const start=C.fresh(id,c),before=JSON.stringify(start);assert(C.valid(id,start,c),id+' fresh');assert(!C.solved(id,start,c),id+' starts completed');
  assert(!C.valid(id,{...start,values:[]},c));assert(!C.valid(id,{...start,moves:-1},c));
  const save={version:1,contentVersion:1,level:1,attempts:{1:{state:start,history:[],best:null}}};assert(C.validSave(id,save,[c]));assert(!C.validSave(id,{...save,contentVersion:9},[c]));
  if(id==='flipLights'){
   const moves=C.flipSolve(start.values,c);assert(moves);let s=start;for(let i=0;i<moves.length;i++)if(moves[i])s=C.edit(id,s,c,{type:'cell',i});assert(C.solved(id,s,c));const a=C.edit(id,start,c,{type:'cell',i:0}),b=C.edit(id,a,c,{type:'cell',i:0});assert.deepEqual(b.values,start.values);
  }else if(id==='pegSolitaire'){
   let s=start;for(const action of c.witness){const next=C.edit(id,s,c,action);assert.notDeepEqual(next.values,s.values);assert(C.valid(id,next,c));s=next;}assert(C.solved(id,s,c));assert(C.pegRoute(start.values,c)?.length);
  }else if(id==='memoryPairs'){
   assert.equal(c.cards.length%2,0);let s=start;for(let k=0;k<c.cards.length/2;k++){const positions=c.cards.flatMap((v,i)=>v===k?[i]:[]);assert.equal(positions.length,2);for(const i of positions)s=C.edit(id,s,c,{type:'cell',i});}assert(C.solved(id,s,c));assert.equal(s.moves,c.cards.length/2);
  }else if(id==='dotSweep'){
   assert(V.mineProof(c).solved);let s=start;for(const [i,value]of c.proof){if(s.values[i]!==-1)continue;s=C.edit(id,s,c,{type:'cell',i,mark:value===1});assert(!s.failed);}assert(C.solved(id,s,c));
   const covered=c.mines.findIndex((v,i)=>v&&start.values[i]===-1),bad=C.edit(id,start,c,{type:'cell',i:covered});assert(bad.failed);assert(!C.solved(id,bad,c));
  }else if(id==='hiddenRays'){
   assert.equal(c.solution.filter(Boolean).length,c.balls);assert.deepEqual(C.signature(c,c.solution),c.signature);const s={...start,values:c.solution.slice(),checked:true};assert(C.solved(id,s,c));
   for(let i=0;i<c.signature.length;i++){const out=c.signature[i];if(typeof out==='number')assert.equal(c.signature[out],i,'reversible beam');}
  }else{
   const result=V.count(id,c);assert(!result.limited,id+' verifier budget');assert.equal(result.count,1,id+' uniqueness');assert.deepEqual(result.solution,c.solution,id+' stored answer');
   const won={...start,values:c.solution.slice()};assert(C.valid(id,won,c),id+' solved state schema');assert(C.solved(id,won,c),id+' final rules');
   const hint=C.hint(id,start,c);assert(hint.action,id+' hint');const next=C.edit(id,start,c,hint.action);assert.notDeepEqual(next.values,start.values,id+' hint acts');assert(C.valid(id,next,c));
  }
  assert.equal(JSON.stringify(start),before,'pure operations must not mutate input');
 }
 console.log('Verified',id,pack.length,'levels');
}
// Counterexamples target rules which local-only checks can miss.
assert(!C.treeMatching(new Set([0,17,19]),{w:5,h:5,trees:[1,5,18]}));
assert(!C.slantOK([1,0,0,1],{w:2,h:2,clues:Array(9).fill(-1)}));
const n=4,rays={w:n,h:n};const empty=Array(n*n).fill(0);assert.equal(C.ray(rays,empty,0),2*n);assert.equal(C.ray(rays,empty,n),3*n);
const hit=empty.slice();hit[0]=1;assert.equal(C.ray(rays,hit,0),'H');const reflect=empty.slice();reflect[1]=1;assert.equal(C.ray(rays,reflect,0),'R');
const hidden={w:8,h:8,balls:5},a=Array(64).fill(0),b=Array(64).fill(0);for(const i of [18,21,42,45])a[i]=b[i]=1;a[27]=1;b[28]=1;hidden.signature=C.signature(hidden,a);assert.deepEqual(C.signature(hidden,b),hidden.signature);assert(C.solved('hiddenRays',{values:b,checked:true},hidden),'equivalent arrangements must be accepted');
const square={w:2,h:2,solution:[1,2,2,1],givens:[-1,-1,-1,-1],cages:[{cells:[0,3],op:'+',target:2},{cells:[1,2],op:'+',target:4}]};assert(C.latinOK(square.solution,square));
console.log('PASS:',total,'verified levels, independent clue searches, action witnesses, no-guess proofs, save schemas, pure inputs and beam/matching/cycle fixtures.');
