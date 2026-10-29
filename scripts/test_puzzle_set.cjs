const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
vm.runInThisContext(fs.readFileSync('games/puzzle-set-core.js','utf8'));
const C=PuzzleSetCore,pack=JSON.parse(fs.readFileSync('games/puzzle-set-levels.json','utf8'));
assert.equal(pack.version,1);
for(const id of ['rotateNetwork','loop','pictureGrid','colorCode']){
  assert.equal(pack[id].length,30);
  const seen=new Set();
  for(let index=0;index<30;index++){
    const cfg=pack[id][index],fresh=C.fresh(id,cfg);
    assert(C.valid(id,fresh,cfg),id+' initial state');
    assert(!C.solved(id,fresh,cfg),id+' must start unfinished');
    assert(!C.valid(id,null,cfg));assert(!C.valid(id,{},cfg));
    const identity=JSON.stringify(id==='colorCode'?cfg.answer:cfg.solution);
    assert(!seen.has(identity),id+' duplicate level');seen.add(identity);
    if(id==='colorCode'){
      assert.equal(C.feedback(cfg.answer,cfg.answer).exact,4);
      assert(C.solved(id,{guesses:[cfg.answer],entry:Array(4).fill(null)},cfg));
      assert(!C.valid(id,{guesses:[cfg.answer,cfg.answer],entry:Array(4).fill(null)},cfg));
      assert(!C.valid(id,{guesses:[[8,0,1,2]],entry:Array(4).fill(null)},cfg));
    }else{
      const solved={...fresh,values:cfg.solution};assert(C.valid(id,solved,cfg));assert(C.solved(id,solved,cfg));
      assert(!C.valid(id,{...fresh,values:[99]},cfg));
      assert(!C.valid(id,{...fresh,values:fresh.values.map(()=>99)},cfg));
      if(id==='rotateNetwork'){
        assert.equal(C.networkCount(cfg.puzzle,cfg.n),1,'network uniqueness');
        // Independent edge and connectivity audit of the saved spanning tree.
        const n=cfg.n,seenCells=new Set([0]),todo=[0];let ports=0;
        while(todo.length){const i=todo.pop();for(const [dx,dy,bit,opp]of [[0,-1,1,4],[1,0,2,8],[0,1,4,1],[-1,0,8,2]]){if(!(cfg.solution[i]&bit))continue;ports++;const x=i%n+dx,y=Math.floor(i/n)+dy;assert(x>=0&&y>=0&&x<n&&y<n);const j=y*n+x;assert(cfg.solution[j]&opp);if(!seenCells.has(j)){seenCells.add(j);todo.push(j);}}}
        assert.equal(seenCells.size,n*n);assert.equal(ports/2,n*n-1);
      }
      if(id==='loop')assert.equal(C.loopCount(cfg),1,'loop uniqueness');
      if(id==='pictureGrid')assert.equal(C.pictureCount(cfg),1,'picture uniqueness');
    }
  }
}
// Exhaustively compare the Loop solver with direct enumeration on a 2×2 grid.
const geo=C.loopGeometry(2),signatures=new Map();
for(let mask=0;mask<2**geo.edges.length;mask++){
  const values=geo.edges.map((_,i)=>(mask>>i)&1);
  // Independently verify the degree and single-component constraints.
  const degrees=geo.vertices.map(edges=>edges.reduce((sum,i)=>sum+values[i],0));
  if(degrees.some(d=>d!==0&&d!==2)||!degrees.some(d=>d===2))continue;
  const start=degrees.findIndex(d=>d===2),seen=new Set([start]),todo=[start];
  while(todo.length){const v=todo.pop();for(const e of geo.vertices[v])if(values[e]){const next=geo.edges[e].find(w=>w!==v);if(!seen.has(next)){seen.add(next);todo.push(next);}}}
  if(seen.size!==degrees.filter(d=>d===2).length)continue;
  const clues=geo.cells.map(edges=>edges.reduce((sum,i)=>sum+values[i],0)),key=JSON.stringify(clues);
  signatures.set(key,(signatures.get(key)||0)+1);
}
for(const [key,count]of signatures)assert.equal(C.loopCount({n:2,clues:JSON.parse(key)},100),count);
assert.equal(C.loopCount({n:2,clues:[4,4,4,4]}),0);
assert.equal(C.loopCount({n:2,clues:[null,null,null,null]}),2,'ambiguous loops are rejected by uniqueness gate');
// Enumerate all 2×2 pictures and cross-check solution counts by clue signature.
const pictures=new Map(),run=line=>line.join('').split('0').filter(Boolean).map(s=>s.length);
for(let mask=0;mask<16;mask++){const v=Array.from({length:4},(_,i)=>(mask>>i)&1),cfg={n:2,rows:[run(v.slice(0,2)),run(v.slice(2))],cols:[run([v[0],v[2]]),run([v[1],v[3]])]},key=JSON.stringify(cfg);pictures.set(key,(pictures.get(key)||0)+1);}
for(const [key,count]of pictures)assert.equal(C.pictureCount(JSON.parse(key),100),count);
// Duplicate-symbol feedback must never count a symbol twice.
const codes=Array.from({length:256},(_,k)=>Array.from({length:4},(_,i)=>(k>>(i*2))&3));
for(const a of codes)for(const b of codes){const exact=a.filter((v,i)=>v===b[i]).length,total=[0,1,2,3].reduce((sum,v)=>sum+Math.min(a.filter(x=>x===v).length,b.filter(x=>x===v).length),0);assert.deepStrictEqual(C.feedback(a,b),{exact,misplaced:total-exact});}
assert(!C.networkSolved([6,12,3,9],2),'closed networks cannot win');
assert.equal(C.networkCount([6,12,1,1],2),1);
const manifest=JSON.parse(fs.readFileSync('games/puzzle-set-manifest.json','utf8'));
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('games/puzzle-set-levels.json')).digest('hex'),manifest.levels_sha256,'fixed level IDs changed');
console.log('PASS: 120 fixed levels, unique network/loop/picture solutions, independent graph and exhaustive small-grid audits, all 65,536 duplicate-code feedback pairs, save validation and pinned level data.');
