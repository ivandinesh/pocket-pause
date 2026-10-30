const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=require('./release_source.cjs').html();
const zctx={localStorage:{getItem:()=>null},$:()=>({}),clearTimeout(){}};vm.createContext(zctx);
const start=html.indexOf("const zipSaveKey="),end=html.indexOf('\nfunction zipSave',start);
vm.runInContext(html.slice(start,end)+`;this.level=n=>{zipLevel=n;makeZip();return {path:zipSolution,walls:zipWalls,anchors:zipAnchorsByCell,cols:zipCols,rows:zipRows}}`,zctx);
for(let n=1;n<=1000;n++){
 const c=zctx.level(n),keys=Array.from(c.path,p=>p.join(','));assert.equal(new Set(keys).size,c.cols*c.rows);
 assert(c.path.every(([x,y])=>x>=0&&x<c.cols&&y>=0&&y<c.rows));
 for(let i=1;i<c.path.length;i++){const [a,b]=[c.path[i-1],c.path[i]];assert.equal(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]),1);assert(!c.walls.has([a.join(','),b.join(',')].sort().join('|')));}
 assert.deepEqual(keys.filter(k=>c.anchors.has(k)).map(k=>c.anchors.get(k)),Array.from({length:c.anchors.size},(_,i)=>i+1));
}
const saved=new Map([['pac.level',7],['pac.progress',JSON.stringify({level:7,player:[1,1],dots:[18],score:230,lives:2})]]);
const mctx={storage:{get:(k,d)=>saved.has(k)?saved.get(k):d,set:(k,v)=>saved.set(k,v)},snakeColor:'blue',snakeShape:'round',SNAKE_COLORS:{blue:{}},$:()=>({getContext:()=>({})}),parse:JSON.parse};vm.createContext(mctx);
const a=html.indexOf("let level=+storage.get('pac.level'"),b=html.indexOf('\nfunction draw(){',a);
vm.runInContext(html.slice(a,b)+`;function draw(){};this.api={make,state:()=>({level,player,dots:[...dots],score,lives}),generate:n=>{level=n;make();return grid}};api.make(true)`,mctx);
assert.equal(mctx.api.state().score,230);assert.equal(mctx.api.state().lives,2);assert.equal(JSON.stringify(mctx.api.state().dots),'[18]');
for(let n=1;n<=1000;n++){
 const g=mctx.api.generate(n),q=[[1,1]],seen=new Set(['1,1']);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,k=xx+','+yy;if(g[yy]?.[xx]===0&&!seen.has(k)){seen.add(k);q.push([xx,yy]);}}}
 assert.equal(seen.size,g.flat().filter(v=>v===0).length);assert(seen.has('13,17'));
}
console.log('PASS: all 1,000 Number Path routes/anchors/walls, all 1,000 connected Maze Chase layouts, legacy maze save restore.');
