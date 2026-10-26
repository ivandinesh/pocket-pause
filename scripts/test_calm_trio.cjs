const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('dist/index.html','utf8');
const declaration=html.match(/const CALM_FLOW_LEVELS=(.*);\n/)[1];
const levels=JSON.parse(declaration),pure=fs.readFileSync('games/calm-trio.js','utf8').split('(()=>{')[0];
const ctx={};vm.createContext(ctx);vm.runInContext(pure,ctx);
const seen=new Set();
for(const l of levels){assert(ctx.calmFlowSolved(l.solution,l.ends,l.n));assert(!ctx.calmFlowSolved(l.solution.map(p=>p.slice(0,-1)),l.ends,l.n));const key=JSON.stringify([l.n,l.ends.map(p=>p.slice().sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0])]);assert(!seen.has(key));seen.add(key);assert(l.solution.every(p=>p.length>=3));}
for(let l=1;l<=50;l++){
 const f=ctx.calmFloodLevel(l);let b=f.board;assert(ctx.calmRegion(b,f.n).length<f.n*f.n);for(const c of f.solution){const old=ctx.calmRegion(b,f.n).length;b=ctx.calmFlood(b,f.n,c);assert(ctx.calmRegion(b,f.n).length>old);}assert.equal(ctx.calmRegion(b,f.n).length,f.n*f.n);assert(f.solution.length<=f.budget);assert.deepEqual(f,ctx.calmFloodLevel(l));
 const u=ctx.calmUntangleLevel(l);assert(ctx.calmCrossings(u.points,u.edges).size>0);assert.equal(ctx.calmCrossings(u.solution,u.edges).size,0);assert.deepEqual(u,ctx.calmUntangleLevel(l));
}
assert(ctx.calmCross({x:0,y:0},{x:10,y:10},{x:0,y:10},{x:10,y:0}));assert(!ctx.calmCross({x:0,y:0},{x:10,y:0},{x:0,y:10},{x:10,y:10}));
const b=[0,0,1,0,1,1,2,2,1];assert.deepEqual(Array.from(ctx.calmRegion(b,3)),[0,1,3]);assert.deepEqual(Array.from(ctx.calmFlood(b,3,0)),b);assert.equal(ctx.calmRegion(ctx.calmFlood(b,3,1),3).length,7);assert.deepEqual(b,[0,0,1,0,1,1,2,2,1]);
console.log('PASS: 50 distinct full-board Flow solutions, 50 solvable Flood budgets, 50 crossing-free Untangle solutions; deterministic generation, movement rules, flood connectivity and immutability.');
