// Deterministic original packs; expensive search happens here, never at startup.
const fs=require('fs'),crypto=require('crypto'),C=require('../games/quiet-core.js'),V=require('./quiet-solvers.cjs');
const N=30,pack={},randInt=(r,n)=>Math.floor(r()*n),pick=(r,a)=>a[randInt(r,a.length)],sum=a=>a.reduce((x,y)=>x+y,0);
function partition(w,h,r,desired){const rects=[[0,0,w,h]];while(rects.length<desired){const candidates=rects.flatMap((a,i)=>a[2]*a[3]>2?[i]:[]);if(!candidates.length)break;const i=pick(r,candidates),[x,y,rw,rh]=rects[i];const vertical=rw>1&&(rh===1||r()<.5);const at=1+randInt(r,(vertical?rw:rh)-1);rects.splice(i,1,...(vertical?[[x,y,at,rh],[x+at,y,rw-at,rh]]:[[x,y,rw,at],[x,y+at,rw,rh-at]]));}return rects;}
function labels(rects,w,h){const a=Array(w*h).fill(-1);rects.forEach(([x,y,rw,rh],k)=>{for(let yy=y;yy<y+rh;yy++)for(let xx=x;xx<x+rw;xx++)a[yy*w+xx]=k;});return a;}
function tiling(w,h,r){const used=Array(w*h).fill(false),pairs=[];function dfs(){const i=used.indexOf(false);if(i<0)return true;used[i]=true;for(const j of C.shuffle(C.neighbors(i,w,h).filter(j=>!used[j]),r)){used[j]=true;pairs.push([i,j]);if(dfs())return true;pairs.pop();used[j]=false;}used[i]=false;return false;}return dfs()?pairs:null;}
function latin(n,r){const a=Array(n*n).fill(-1);function dfs(){let best=-1,choices;for(let i=0;i<a.length;i++)if(a[i]===-1){const opts=Array.from({length:n},(_,k)=>k+1).filter(v=>!a.slice(Math.floor(i/n)*n,Math.floor(i/n)*n+n).includes(v)&&!Array.from({length:n},(_,y)=>a[y*n+i%n]).includes(v));if(!opts.length)return false;if(!choices||opts.length<choices.length){best=i;choices=opts;}}if(best<0)return true;for(const v of C.shuffle(choices,r)){a[best]=v;if(dfs())return true;}a[best]=-1;return false;}if(!dfs())throw Error('Latin construction');return a;}
function unique(id,c){const answer=V.count(id,c);if(answer.limited||answer.count!==1)return false;c.solution=answer.solution;return true;}
function build(id,index,attempt){
 const r=C.rng(106103+index*1907+attempt*104729+C.ids.indexOf(id)*100003),late=index>=15;
 if(id==='memoryPairs'){const pairs=index<10?6:index<20?8:10;return {w:pairs===6?3:4,h:pairs===6?4:pairs===8?4:5,cards:C.shuffle(Array.from({length:2*pairs},(_,i)=>Math.floor(i/2)),r)};}
 if(id==='flipLights'){const n=index<10?3:index<20?4:5,c={w:n,h:n,start:Array(n*n).fill(0)};for(const i of C.shuffle(Array.from({length:n*n},(_,i)=>i),r).slice(0,2+index%Math.min(7,n*n-2)))for(const j of [i,...C.neighbors(i,n,n)])c.start[j]^=1;if(c.start.every(x=>!x))return null;return c;}
 if(id==='pegSolitaire'){
  const n=late?7:5,mask=Array.from({length:n*n},(_,i)=>n===7&&(i%n<2||i%n>4)&&(Math.floor(i/n)<2||Math.floor(i/n)>4)?-2:0),v=mask.slice();v[Math.floor(n*n/2)]=1;const reversed=[];
  for(let k=0;k<(late?14:7)+index%4;k++){const opts=[];for(let a=0;a<v.length;a++)if(v[a]===1)for(const b of C.neighbors(a,n,n)){const d=2*b-a;if(d>=0&&d<v.length&&v[b]===0&&v[d]===0&&Math.abs(d%n-a%n)+Math.abs(Math.floor(d/n)-Math.floor(a/n))===2)opts.push([a,b,d]);}if(!opts.length)break;const [a,b,d]=pick(r,opts);v[a]=0;v[b]=v[d]=1;reversed.unshift({type:'jump',a:d,b:a});}
  return reversed.length>=5?{w:n,h:n,start:v,witness:reversed}:null;
 }
 if(id==='dominoPairs'){const max=late?3:2,w=max+1,h=max+2,pairs=tiling(w,h,r);if(!pairs)return null;const types=[];for(let a=0;a<=max;a++)for(let b=a;b<=max;b++)types.push([a,b]);const shuffled=C.shuffle(types,r),numbers=Array(w*h);pairs.forEach(([a,b],i)=>{let [x,y]=shuffled[i];if(r()<.5)[x,y]=[y,x];numbers[a]=x;numbers[b]=y;});const c={w,h,max,numbers};return unique(id,c)?c:null;}
 if(id==='rectangles'||id==='symmetryIslands'){
  const n=late?5:4,rects=partition(n,n,r,late?8:5),c={w:n,h:n};
  if(id==='rectangles')c.clues=rects.map(([x,y,w,h])=>[(y+randInt(r,h))*n+x+randInt(r,w),w*h]);
  else c.centers=rects.map(([x,y,w,h])=>[2*x+w-1,2*y+h-1]);
  if(c.clues?.every(([,area])=>area<=2))return null;return unique(id,c)?c:null;
 }
 if(id==='tents'){
  const n=late?6:5,tents=[],trees=[];
  for(const i of C.shuffle(Array.from({length:n*n},(_,i)=>i),r))if(tents.length<(late?7:5)&&C.neighbors(i,n,n,true).every(j=>!tents.includes(j)))tents.push(i);
  if(tents.length<(late?6:4))return null;
  for(const i of C.shuffle(tents,r)){const opts=C.neighbors(i,n,n).filter(j=>!tents.includes(j)&&!trees.includes(j));if(!opts.length)return null;trees.push(pick(r,opts));}
  const c={w:n,h:n,trees:trees.sort((a,b)=>a-b),rows:Array.from({length:n},(_,y)=>tents.filter(i=>Math.floor(i/n)===y).length),cols:Array.from({length:n},(_,x)=>tents.filter(i=>i%n===x).length)};return unique(id,c)?c:null;
 }
 if(id==='slant'){
  const n=late?5:4,a=Array(n*n).fill(-1),m=n+1,c={w:n,h:n,clues:Array(m*m).fill(-1)};
  for(const i of C.shuffle(Array.from({length:a.length},(_,i)=>i),r)){let ok=false;for(const v of C.shuffle([0,1],r)){a[i]=v;if(C.slantOK(a,c,true)){ok=true;break;}}if(!ok)return null;}
  c.clues.fill(0);a.forEach((v,i)=>{const x=i%n,y=Math.floor(i/n);for(const k of (v===0?[y*m+x,(y+1)*m+x+1]:[y*m+x+1,(y+1)*m+x]))c.clues[k]++;});
  if(!unique(id,c))return null;let removed=0;for(const i of C.shuffle(Array.from({length:m*m},(_,i)=>i),r)){if(removed>=(late?9:4))break;const old=c.clues[i];c.clues[i]=-1;if(unique(id,c))removed++;else c.clues[i]=old;}return c;
 }
 if(id==='dotSweep'){
  const n=late?6:5,mines=Array(n*n).fill(0);for(const i of C.shuffle(Array.from({length:n*n},(_,i)=>i),r).slice(0,late?7:4))mines[i]=1;
  const zeros=mines.flatMap((v,i)=>!v&&C.neighbors(i,n,n,true).every(j=>!mines[j])?[i]:[]);if(!zeros.length)return null;const c={w:n,h:n,mines,open:[]},s={values:Array(n*n).fill(-1),failed:false};C.mineReveal(s,c,pick(r,zeros));c.open=s.values.flatMap((v,i)=>v===0?[i]:[]);if(c.open.length>=n*n-sum(mines)-2)return null;const proof=V.mineProof(c);if(!proof.solved)return null;c.proof=proof.steps;return c;
 }
 if(['greaterGrid','skyline','cageSums'].includes(id)){
  const n=id==='cageSums'?(index<10?3:4):(late?5:4),a=latin(n,r),c={w:n,h:n,givens:a.slice()};
  if(id==='greaterGrid'){c.ineq=[];for(const [i,j]of C.edges(n,n))if(r()<.65)c.ineq.push(a[i]>a[j]?[i,j]:[j,i]);}
  if(id==='skyline'){c.sides=[];for(let y=0;y<n;y++){const row=a.slice(y*n,y*n+n);c.sides.push(C.visibility(row),C.visibility(row.slice().reverse()));}for(let x=0;x<n;x++){const col=Array.from({length:n},(_,y)=>a[y*n+x]);c.sides.push(C.visibility(col),C.visibility(col.slice().reverse()));}}
  if(id==='cageSums'){
   const left=new Set(Array.from({length:n*n},(_,i)=>i));c.cages=[];
   while(left.size){const cells=[pick(r,[...left])];left.delete(cells[0]);const max=2+randInt(r,2);while(cells.length<max){const opts=[...new Set(cells.flatMap(i=>C.neighbors(i,n,n).filter(j=>left.has(j))))];if(!opts.length)break;const j=pick(r,opts);left.delete(j);cells.push(j);}
    const vals=cells.map(i=>a[i]),ops=index<10?['+']:['+','×'];if(index>=20&&cells.length===2){ops.push('−');if(Math.max(...vals)%Math.min(...vals)===0)ops.push('÷');}const op=pick(r,ops),target=op==='+'?sum(vals):op==='×'?vals.reduce((a,b)=>a*b,1):op==='−'?Math.abs(vals[0]-vals[1]):Math.max(...vals)/Math.min(...vals);c.cages.push({cells,op,target});
   }
  }
  for(const i of C.shuffle(Array.from({length:n*n},(_,i)=>i),r)){const old=c.givens[i];c.givens[i]=-1;if(!unique(id,c))c.givens[i]=old;}
  if(c.givens.filter(x=>x===-1).length<n*n/2||!unique(id,c))return null;return c;
 }
 if(id==='magnets'){
  const w=4,h=late?6:4,pairs=tiling(w,h,r);if(!pairs)return null;const c={w,h,pairs,counts:Array.from({length:2},()=>[Array(h).fill(-1),Array(w).fill(-1)])},v=Array(pairs.length).fill(-1);
  function assign(i){if(i===v.length)return true;for(const x of C.shuffle([0,1,2],r)){v[i]=x;if(C.magnetsOK(v,c,true)&&assign(i+1))return true;}v[i]=-1;return false;}if(!assign(0)||v.filter(x=>x>0).length<3)return null;
  const cells=C.magnetValues(v,c);for(let sign=1;sign<=2;sign++){c.counts[sign-1][0]=Array.from({length:h},(_,y)=>cells.slice(y*w,y*w+w).filter(x=>x===sign).length);c.counts[sign-1][1]=Array.from({length:w},(_,x)=>cells.filter((v,i)=>i%w===x&&v===sign).length);}return unique(id,c)?c:null;
 }
 if(id==='fourRegions'){
  const n=late?5:4,rects=partition(n,n,r,late?10:8),regions=labels(rects,n,n),adj=[...new Set(C.edges(n,n).filter(([a,b])=>regions[a]!==regions[b]).map(([a,b])=>[regions[a],regions[b]].sort((a,b)=>a-b).join(',')))].map(s=>s.split(',').map(Number)),count=rects.length,c={w:n,h:n,regions,regionCount:count,adj,givens:Array(count).fill(-1)},a=Array(count).fill(-1);
  function color(i){if(i===count)return true;for(const v of C.shuffle([0,1,2,3],r))if(adj.every(([x,y])=>x!==i&&y!==i||a[x===i?y:x]!==v)){a[i]=v;if(color(i+1))return true;}a[i]=-1;return false;}if(!color(0)||new Set(a).size<4)return null;c.givens=a.slice();
  for(const i of C.shuffle(Array.from({length:count},(_,i)=>i),r)){const old=c.givens[i];c.givens[i]=-1;if(!unique(id,c))c.givens[i]=old;}return c.givens.filter(v=>v===-1).length>=3&&unique(id,c)?c:null;
 }
 if(id==='tracks'){
  const n=5,path=[randInt(r,n)],seen=new Set(path),wanted=10+index%7;
  while(path.length<wanted){const opts=C.neighbors(path.at(-1),n,n).filter(i=>!seen.has(i));if(!opts.length)break;const j=pick(r,opts);path.push(j);seen.add(j);}
  if(path.length<wanted)return null;const last=path.at(-1);if(last%n!==0&&last%n!==n-1&&Math.floor(last/n)!==0&&Math.floor(last/n)!==n-1)return null;
  const es=C.edges(n,n),route=es.map(([a,b])=>Number(path.some((v,k)=>k>0&&(v===a&&path[k-1]===b||v===b&&path[k-1]===a)))),c={w:n,h:n,a:path[0],b:last,rows:Array.from({length:n},(_,y)=>path.filter(i=>Math.floor(i/n)===y).length),cols:Array.from({length:n},(_,x)=>path.filter(i=>i%n===x).length),fixed:[]};if(c.rows.includes(0)||c.cols.includes(0))return null;
  for(const e of C.shuffle(route.flatMap((v,i)=>v?[i]:[]),r)){if(unique(id,c))return c;c.fixed.push(e);if(c.fixed.length>=Math.floor(path.length/2))return null;}return null;
 }
 if(id==='hiddenRays'){const n=late?5:4,balls=late?3:2,a=Array(n*n).fill(0);for(const i of C.shuffle(Array.from({length:a.length},(_,i)=>i),r).slice(0,balls))a[i]=1;const c={w:n,h:n,balls,solution:a};c.signature=C.signature(c,a);return c;}
 throw Error('Missing generator '+id);
}
const only=process.argv[2];
for(const id of (only?[only]:C.ids)){
 const levels=[],seen=new Set();let tries=0;
 for(let index=0;index<N;index++){
  let accepted=null;
  for(let attempt=0;attempt<2500;attempt++){tries++;const c=build(id,index,attempt);if(!c)continue;const key=JSON.stringify(c);if(seen.has(key))continue;seen.add(key);accepted=c;break;}
  if(!accepted)throw Error('Could not generate '+id+' level '+(index+1));levels.push(accepted);
 }
 pack[id]=levels;fs.mkdirSync('games/quiet-levels',{recursive:true});const text=JSON.stringify(levels)+'\n';fs.writeFileSync('games/quiet-levels/'+id+'.json',text);console.log(id,levels.length,'levels;',tries,'attempts;',Buffer.byteLength(text),'bytes');
}
if(!only){const manifest={version:1,authoring:'DoPop-authored deterministic generators and packs. Puzzle rules referenced separately; beam tracing adaptation credited in licenses/portable-puzzles-MIT.txt.',levels: Object.fromEntries(Object.entries(pack).map(([id,data])=>[id,{count:data.length,sha256:crypto.createHash('sha256').update(fs.readFileSync('games/quiet-levels/'+id+'.json')).digest('hex')}]))};fs.writeFileSync('games/quiet-pack-manifest.json',JSON.stringify(manifest,null,2)+'\n');}
