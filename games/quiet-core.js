// DoPop's isolated rules and bounded verifiers. No DOM, storage or timers.
const QuietCore=(()=>{
 'use strict';
 const ids=['memoryPairs','flipLights','pegSolitaire','dominoPairs','rectangles','tents','slant','dotSweep','greaterGrid','skyline','symmetryIslands','magnets','fourRegions','cageSums','tracks','hiddenRays'];
 const copy=x=>JSON.parse(JSON.stringify(x)),integer=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b;
 function rng(seed){let x=seed>>>0||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
 function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 const neighbors=(i,w,h,diagonal=false)=>{const x=i%w,y=Math.floor(i/w),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&(diagonal||Math.abs(dx)+Math.abs(dy)===1)&&x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)out.push((y+dy)*w+x+dx);return out;};
 function connected(cells,w,h){if(!cells.length)return false;const left=new Set(cells),todo=[cells[0]];left.delete(cells[0]);while(todo.length)for(const j of neighbors(todo.pop(),w,h))if(left.delete(j))todo.push(j);return !left.size;}
 function edges(w,h){const out=[];for(let i=0;i<w*h;i++){if(i%w<w-1)out.push([i,i+1]);if(i<w*(h-1))out.push([i,i+w]);}return out;}
 const visibility=a=>{let high=0,n=0;for(const v of a)if(v>high){high=v;n++;}return n;};
 function fresh(id,c){
  const size=id==='magnets'?c.pairs.length:id==='fourRegions'?c.regionCount:id==='tracks'?edges(c.w,c.h).length:c.w*c.h;
  let values=Array(size).fill(-1);
  if(id==='flipLights'||id==='pegSolitaire')values=c.start.slice();
  if(id==='memoryPairs'||id==='hiddenRays'||id==='tracks')values.fill(0);
  if(id==='dotSweep')for(const i of c.open)values[i]=0;
  if(id==='tents')for(const i of c.trees)values[i]=0;
  if(c.givens)for(let i=0;i<c.givens.length;i++)if(c.givens[i]!==-1)values[i]=c.givens[i];
  if(id==='tracks')for(const e of c.fixed)values[e]=1;
  return {values,moves:0,assisted:false,...(id==='memoryPairs'?{open:[]}:{}),...(id==='hiddenRays'?{probes:[],checked:false}:{}),...(id==='dotSweep'?{failed:false}:{})};
 }
 function valid(id,s,c){
  if(!s||typeof s!=='object'||!Array.isArray(s.values)||!integer(s.moves,0,1000000)||typeof s.assisted!=='boolean')return false;
  const n=id==='magnets'?c.pairs.length:id==='fourRegions'?c.regionCount:id==='tracks'?edges(c.w,c.h).length:c.w*c.h;
  if(s.values.length!==n)return false;
  const bounds=id==='dominoPairs'?[-1,n-1]:['rectangles','symmetryIslands'].includes(id)?[-1,(c.centers||c.clues).length-1]:['greaterGrid','skyline','cageSums'].includes(id)?[-1,c.w]:id==='fourRegions'?[-1,3]:id==='magnets'?[-1,2]:['flipLights','memoryPairs','hiddenRays','tracks'].includes(id)?[0,1]:id==='pegSolitaire'?[-2,1]:id==='dotSweep'?[-1,1]:[-1,1];
  if(!s.values.every(v=>integer(v,...bounds)))return false;
  if(['greaterGrid','skyline','cageSums'].includes(id)&&s.values.includes(0))return false;
  if(c.givens&&c.givens.some((v,i)=>v!==-1&&s.values[i]!==v))return false;
  if(id==='pegSolitaire'&&s.values.some((v,i)=>v===-1||(v===-2)!==(c.start[i]===-2)))return false;
  if(id==='dominoPairs'&&s.values.some((v,i)=>v!==-1&&(v===i||s.values[v]!==i||!neighbors(i,c.w,c.h).includes(v))))return false;
  if(id==='memoryPairs'){
   if(!Array.isArray(s.open)||s.open.length>2||new Set(s.open).size!==s.open.length||s.open.some(i=>!integer(i,0,n-1)||s.values[i]))return false;
   if(s.open.length===2&&c.cards[s.open[0]]===c.cards[s.open[1]])return false;
   for(let k=0;k<n/2;k++)if(c.cards.reduce((n,v,i)=>n+(v===k&&s.values[i]===1),0)%2)return false;
  }
  if(id==='dotSweep'&&(typeof s.failed!=='boolean'||c.open.some(i=>s.values[i]!==0)||s.values.some((v,i)=>v===0&&c.mines[i])))return false;
  if(id==='hiddenRays'&&(!Array.isArray(s.probes)||s.probes.length>4*c.w||new Set(s.probes).size!==s.probes.length||s.probes.some(p=>!integer(p,0,4*c.w-1))||typeof s.checked!=='boolean'))return false;
  if(id==='tracks'&&c.fixed.some(e=>s.values[e]!==1))return false;
  if(id==='tents'&&c.trees.some(i=>s.values[i]!==0))return false;
  return true;
 }
 function validSave(id,value,pack){
  if(!value||value.version!==1||value.contentVersion!==1||!integer(value.level,1,pack.length)||!value.attempts||typeof value.attempts!=='object'||Array.isArray(value.attempts))return false;
  return Object.entries(value.attempts).every(([level,a])=>/^\d+$/.test(level)&&integer(+level,1,pack.length)&&a&&valid(id,a.state,pack[level-1])&&Array.isArray(a.history)&&a.history.length<=30&&a.history.every(s=>valid(id,s,pack[level-1]))&&(a.best==null||integer(a.best,0,1000000)));
 }
 function treeMatching(tents,c){
  const owner=new Map();
  function visit(tree,seen){for(const tent of neighbors(tree,c.w,c.h))if(tents.has(tent)&&!seen.has(tent)){seen.add(tent);if(!owner.has(tent)||visit(owner.get(tent),seen)){owner.set(tent,tree);return true;}}return false;}
  return tents.size===c.trees.length&&c.trees.every(t=>visit(t,new Set()));
 }
 function tentsOK(v,c){const set=new Set(v.flatMap((x,i)=>x===1?[i]:[]));return c.trees.every(i=>!set.has(i))&&[...set].every(i=>neighbors(i,c.w,c.h,true).every(j=>!set.has(j)))&&c.rows.every((n,y)=>v.slice(y*c.w,(y+1)*c.w).filter(x=>x===1).length===n)&&c.cols.every((n,x)=>v.filter((v,i)=>i%c.w===x&&v===1).length===n)&&treeMatching(set,c);}
 function slantOK(v,c,partial=false){
  const m=c.w+1,parent=Array.from({length:m*(c.h+1)},(_,i)=>i),counts=Array(parent.length).fill(0),remaining=Array(parent.length).fill(0);
  const find=i=>{while(parent[i]!==i)i=parent[i];return i;};
  for(let i=0;i<v.length;i++){
   const x=i%c.w,y=Math.floor(i/c.w),corners=[y*m+x,y*m+x+1,(y+1)*m+x,(y+1)*m+x+1];
   if(v[i]===-1){for(const k of corners)remaining[k]++;continue;}
   const [a,b]=v[i]===0?[corners[0],corners[3]]:[corners[1],corners[2]];counts[a]++;counts[b]++;const ra=find(a),rb=find(b);if(ra===rb)return false;parent[ra]=rb;
  }
  return c.clues.every((n,i)=>n===-1||(partial?counts[i]<=n&&counts[i]+remaining[i]>=n:counts[i]===n));
 }
 function latinOK(v,c,partial=false){
  const n=c.w;
  for(let k=0;k<n;k++)for(const line of [v.slice(k*n,k*n+n),Array.from({length:n},(_,y)=>v[y*n+k])]){const set=line.filter(x=>x!==-1);if(set.includes(0)||new Set(set).size!==set.length)return false;}
  if(c.ineq&&c.ineq.some(([a,b])=>v[a]!==-1&&v[b]!==-1&&v[a]<=v[b]))return false;
  if(c.sides){const lines=[];for(let y=0;y<n;y++)lines.push(v.slice(y*n,y*n+n));for(let x=0;x<n;x++)lines.push(Array.from({length:n},(_,y)=>v[y*n+x]));for(let i=0;i<lines.length;i++)if(!lines[i].includes(-1))for(let side=0;side<2;side++){const clue=c.sides[2*i+side];if(clue!==-1&&visibility(side?lines[i].slice().reverse():lines[i])!==clue)return false;}}
  if(c.cages)for(const cage of c.cages){const a=cage.cells.map(i=>v[i]);if(!a.includes(-1)){const result=cage.op==='+'?a.reduce((x,y)=>x+y,0):cage.op==='×'?a.reduce((x,y)=>x*y,1):cage.op==='−'?Math.abs(a[0]-a[1]):Math.max(...a)/Math.min(...a);if(result!==cage.target)return false;}else if(cage.op==='+'&&a.filter(x=>x!==-1).reduce((x,y)=>x+y,0)+a.filter(x=>x===-1).length>cage.target)return false;}
  return partial||!v.includes(-1);
 }
 function magnetValues(v,c){const out=Array(c.w*c.h).fill(-1);c.pairs.forEach(([a,b],i)=>{if(v[i]===0)out[a]=out[b]=0;if(v[i]>0){out[a]=v[i]===1?1:2;out[b]=3-out[a];}});return out;}
 function magnetsOK(v,c,partial=false){
  const a=magnetValues(v,c);for(let i=0;i<a.length;i++)if(a[i]>0&&neighbors(i,c.w,c.h).some(j=>a[j]===a[i]))return false;
  for(let sign=1;sign<=2;sign++)for(let axis=0;axis<2;axis++)for(let k=0;k<(axis?c.w:c.h);k++){
   const line=axis?Array.from({length:c.h},(_,y)=>a[y*c.w+k]):a.slice(k*c.w,(k+1)*c.w),target=c.counts[sign-1][axis][k];if(target===-1)continue;const got=line.filter(x=>x===sign).length,free=line.filter(x=>x===-1).length;if(got>target||got+free<target||!partial&&got!==target)return false;
  }return partial||!v.includes(-1);
 }
 function groupsOK(id,v,c){
  if(v.includes(-1))return false;const centers=id==='rectangles'?c.clues:c.centers;
  for(let k=0;k<centers.length;k++){
   const cells=v.flatMap((x,i)=>x===k?[i]:[]);if(!connected(cells,c.w,c.h))return false;
   if(id==='rectangles'){const [pos,area]=c.clues[k];if(!cells.includes(pos)||cells.length!==area)return false;const xs=cells.map(i=>i%c.w),ys=cells.map(i=>Math.floor(i/c.w));if((Math.max(...xs)-Math.min(...xs)+1)*(Math.max(...ys)-Math.min(...ys)+1)!==area)return false;}
   else {const [cx,cy]=c.centers[k],set=new Set(cells);if(cells.some(i=>{const x=cx-i%c.w,y=cy-Math.floor(i/c.w);return x<0||x>=c.w||y<0||y>=c.h||!set.has(y*c.w+x);}))return false;const central=[];for(const y of new Set([Math.floor(cy/2),Math.ceil(cy/2)]))for(const x of new Set([Math.floor(cx/2),Math.ceil(cx/2)]))central.push(y*c.w+x);if(central.some(i=>!set.has(i)))return false;}
  }return true;
 }
 function routeOK(v,c){
  const es=edges(c.w,c.h),adj=Array.from({length:c.w*c.h},()=>[]);es.forEach(([a,b],i)=>{if(v[i]){adj[a].push(b);adj[b].push(a);}});
  if(adj.some((a,i)=>a.length&&a.length!==(i===c.a||i===c.b?1:2))||adj[c.a].length!==1||adj[c.b].length!==1)return false;
  const cells=adj.flatMap((a,i)=>a.length?[i]:[]);
  return connectedRoute(c.a,adj).size===cells.length&&c.rows.every((n,y)=>cells.filter(i=>Math.floor(i/c.w)===y).length===n)&&c.cols.every((n,x)=>cells.filter(i=>i%c.w===x).length===n);
 }
 function connectedRoute(start,adj){const seen=new Set([start]),todo=[start];while(todo.length)for(const j of adj[todo.pop()])if(!seen.has(j)){seen.add(j);todo.push(j);}return seen;}
 // Beam rule precedence adapted from blackbox.c, Portable Puzzle Collection
 // 616da16f25da428ccda805536209095bd062676e. Full MIT notice is bundled offline.
 function ray(c,balls,port){
  const n=c.w,dirs=[[0,-1],[1,0],[0,1],[-1,0]],side=Math.floor(port/n),k=port%n;
  let x=side===1?n:side===3?-1:k,y=side===0?-1:side===2?n:k,d=[2,3,0,1][side];
  const has=(xx,yy)=>xx>=0&&xx<n&&yy>=0&&yy<n&&balls[yy*n+xx]===1;
  const look=(offset)=>{const [dx,dy]=dirs[d],[sx,sy]=dirs[(d+offset+4)%4];return has(x+dx+(offset?sx:0),y+dy+(offset?sy:0));};
  if(look(0))return 'H';if(look(-1)||look(1))return 'R';x+=dirs[d][0];y+=dirs[d][1];const seen=new Set();
  for(let steps=0;steps<n*n*8;steps++){
   if(x<0||x>=n||y<0||y>=n){const exit=y<0?x:x>=n?n+y:y>=n?2*n+x:3*n+y;return exit===port?'R':exit;}
   const key=x+','+y+','+d;if(seen.has(key))return 'R';seen.add(key);
   if(look(0))return 'H';if(look(-1)){d=(d+1)%4;continue;}if(look(1)){d=(d+3)%4;continue;}
   x+=dirs[d][0];y+=dirs[d][1];
  }return 'R';
 }
 const signature=(c,balls)=>Array.from({length:4*c.w},(_,i)=>ray(c,balls,i));
 function solved(id,s,c){
  const v=s.values;
  if(id==='memoryPairs')return v.every(x=>x===1);
  if(id==='flipLights')return v.every(x=>x===0);
  if(id==='pegSolitaire')return v.filter(x=>x===1).length===1;
  if(id==='dominoPairs'){if(v.includes(-1))return false;const seen=new Set();for(let i=0;i<v.length;i++)if(i<v[i]){const key=[c.numbers[i],c.numbers[v[i]]].sort((a,b)=>a-b).join(',');if(seen.has(key))return false;seen.add(key);}return seen.size===v.length/2;}
  if(id==='rectangles'||id==='symmetryIslands')return groupsOK(id,v,c);
  if(id==='tents')return tentsOK(v,c);
  if(id==='slant')return !v.includes(-1)&&slantOK(v,c);
  if(id==='dotSweep')return !s.failed&&v.every((x,i)=>c.mines[i]||x===0);
  if(['greaterGrid','skyline','cageSums'].includes(id))return latinOK(v,c);
  if(id==='magnets')return magnetsOK(v,c);
  if(id==='fourRegions')return !v.includes(-1)&&c.adj.every(([a,b])=>v[a]!==v[b]);
  if(id==='tracks')return routeOK(v,c);
  if(id==='hiddenRays')return s.checked&&v.filter(x=>x===1).length===c.balls&&JSON.stringify(signature(c,v))===JSON.stringify(c.signature);
  return false;
 }
 function mineReveal(s,c,i){
  if(s.values[i]!==-1)return;if(c.mines[i]){s.failed=true;return;}
  const todo=[i];while(todo.length){const j=todo.pop();if(s.values[j]!==-1)continue;s.values[j]=0;if(neighbors(j,c.w,c.h,true).every(k=>!c.mines[k]))for(const k of neighbors(j,c.w,c.h,true))if(s.values[k]===-1)todo.push(k);}
 }
 function edit(id,old,c,a){
  const s=copy(old),v=s.values,i=a.i,n=v.length;
  if(a.type==='assisted'){s.assisted=true;return s;}
  if(id==='memoryPairs'&&a.type==='settle'){s.open=[];return s;}
  if(solved(id,s,c)||s.failed)return old;
  if(a.type==='cell'&&integer(i,0,n-1)){
   if(c.givens?.[i]!==undefined&&c.givens[i]!==-1)return old;
   if(id==='memoryPairs'){if(v[i]||s.open.length>=2||s.open.includes(i))return old;s.open.push(i);if(s.open.length===2){s.moves++;if(c.cards[s.open[0]]===c.cards[s.open[1]]){for(const k of s.open)v[k]=1;s.open=[];}}return s;}
   if(id==='flipLights'){for(const j of [i,...neighbors(i,c.w,c.h)])v[j]^=1;}
   else if(id==='dotSweep'){if(a.mark){if(c.open.includes(i)||v[i]===0)return old;v[i]=v[i]===1?-1:1;}else mineReveal(s,c,i);}
   else if(id==='hiddenRays'){v[i]^=1;s.checked=false;}
   else if(id==='slant')v[i]=a.value===undefined?(v[i]===-1?0:v[i]===0?1:-1):a.value;
   else if(id==='tents'){if(c.trees.includes(i))return old;v[i]=a.value===undefined?(v[i]===-1?1:v[i]===1?0:-1):a.value;}
   else if(id==='magnets')v[i]=a.value===undefined?(v[i]===-1?1:v[i]===1?2:v[i]===2?0:-1):a.value;
   else v[i]=a.value;
  }else if(a.type==='pair'&&id==='dominoPairs'&&integer(a.a,0,n-1)&&integer(a.b,0,n-1)&&neighbors(a.a,c.w,c.h).includes(a.b)){
   if(v[a.a]===a.b){v[a.a]=v[a.b]=-1;}else {for(const k of [a.a,a.b])if(v[k]!==-1){v[v[k]]=-1;v[k]=-1;}v[a.a]=a.b;v[a.b]=a.a;}
  }else if(a.type==='jump'&&id==='pegSolitaire'&&integer(a.a,0,n-1)&&integer(a.b,0,n-1)){
   const x=a.a%c.w,y=Math.floor(a.a/c.w),xx=a.b%c.w,yy=Math.floor(a.b/c.w);if(Math.abs(x-xx)+Math.abs(y-yy)!==2||x!==xx&&y!==yy||v[a.a]!==1||v[a.b]!==0||v[(a.a+a.b)/2]!==1)return old;v[a.a]=v[(a.a+a.b)/2]=0;v[a.b]=1;
  }else if(a.type==='rectangle'&&id==='rectangles'&&integer(a.a,0,n-1)&&integer(a.b,0,n-1)){
   const x0=Math.min(a.a%c.w,a.b%c.w),x1=Math.max(a.a%c.w,a.b%c.w),y0=Math.min(Math.floor(a.a/c.w),Math.floor(a.b/c.w)),y1=Math.max(Math.floor(a.a/c.w),Math.floor(a.b/c.w));
   const cells=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)cells.push(y*c.w+x);
   const clues=c.clues.flatMap(([pos],k)=>cells.includes(pos)?[k]:[]);if(clues.length!==1)return old;const touched=new Set(cells.map(i=>v[i]).filter(x=>x>=0));touched.add(clues[0]);for(let j=0;j<n;j++)if(touched.has(v[j]))v[j]=-1;for(const j of cells)v[j]=clues[0];
  }else if(a.type==='edge'&&id==='tracks'&&integer(i,0,n-1)&&!c.fixed.includes(i))v[i]=a.value===undefined?1-v[i]:a.value;
  else if(a.type==='probe'&&id==='hiddenRays'&&integer(i,0,4*c.w-1)&&!s.probes.includes(i))s.probes.push(i);
  else if(a.type==='check'&&id==='hiddenRays')s.checked=true;
  else return old;
  s.moves++;return valid(id,s,c)?s:old;
 }
 function flipSolve(values,c){
  const n=values.length,rows=Array.from({length:n},(_,i)=>Array.from({length:n+1},(_,j)=>j===n?values[i]:Number(i===j||neighbors(j,c.w,c.h).includes(i))));let pivot=0;const columns=[];
  for(let col=0;col<n;col++){const k=rows.findIndex((r,i)=>i>=pivot&&r[col]);if(k<0)continue;[rows[k],rows[pivot]]=[rows[pivot],rows[k]];for(let y=0;y<n;y++)if(y!==pivot&&rows[y][col])for(let x=col;x<=n;x++)rows[y][x]^=rows[pivot][x];columns.push(col);pivot++;}
  if(rows.some(r=>r.slice(0,n).every(x=>!x)&&r[n]))return null;const result=Array(n).fill(0);columns.forEach((col,i)=>result[col]=rows[i][n]);return result;
 }
 function pegRoute(values,c,limit=12000){
  // Most hints follow the stored constructive witness without searching.
  if(c.witness){const v=c.start.slice();for(let k=0;k<=c.witness.length;k++){if(JSON.stringify(v)===JSON.stringify(values))return c.witness.slice(k);if(k<c.witness.length){const {a,b}=c.witness[k];v[a]=v[(a+b)/2]=0;v[b]=1;}}}
  let nodes=0;const bad=new Set(),moves=[];for(let a=0;a<values.length;a++)for(const b of neighbors(a,c.w,c.h)){const dest=2*b-a;if(integer(dest,0,values.length-1)&&Math.abs(dest%c.w-a%c.w)+Math.abs(Math.floor(dest/c.w)-Math.floor(a/c.w))===2&&c.start[a]!==-2&&c.start[b]!==-2&&c.start[dest]!==-2)moves.push([a,b,dest]);}
  function visit(v){if(++nodes>limit)return null;if(v.filter(x=>x===1).length===1)return [];const key=v.join('');if(bad.has(key))return null;for(const [a,b,d] of moves)if(v[a]===1&&v[b]===1&&v[d]===0){const next=v.slice();next[a]=next[b]=0;next[d]=1;const path=visit(next);if(path)return [{type:'jump',a,b:d},...path];}bad.add(key);return null;}
  return visit(values);
 }
 function hint(id,s,c){
  if(solved(id,s,c))return {text:'Already complete.'};
  if(id==='memoryPairs'){const i=s.values.findIndex(x=>!x),j=c.cards.findIndex((v,k)=>k!==i&&v===c.cards[i]);return {preview:[i,j],text:'A matching pair. Take a quiet look.'};}
  if(id==='flipLights'){const move=flipSolve(s.values,c)?.findIndex(x=>x===1);return move>=0?{action:{type:'cell',i:move},text:'This toggle is one step in a solution from your current board.'}:{text:'Undo a move to return to a reachable board.'};}
  if(id==='pegSolitaire'){const route=pegRoute(s.values,c);return route?.length?{action:route[0],text:'This jump keeps a complete route available.'}:{text:'No quick completion found here. Undo a jump to explore another route.'};}
  if(id==='hiddenRays'){const i=Array.from({length:4*c.w},(_,i)=>i).find(i=>!s.probes.includes(i));return i!==undefined?{action:{type:'probe',i},text:'Compare this edge observation with your marked dots.'}:{text:'Every edge has been tested. Compare the paired exits and reflections.'};}
  if(id==='dotSweep'){if(s.failed)return {text:'Undo the last reveal or retry this board.'};const wrong=s.values.findIndex((v,i)=>v===1&&!c.mines[i]);if(wrong>=0)return {action:{type:'cell',i:wrong,mark:true},text:'Clear this incorrect mark before continuing.'};const i=s.values.findIndex((v,i)=>v===-1&&!c.mines[i]);return i>=0?{action:{type:'cell',i},text:'This is a safe square in this verified layout.'}:{text:'Check your marks.'};}
  const i=s.values.findIndex((v,i)=>v!==c.solution[i]);if(i<0)return {text:'Check the completion conditions.'};
  if(id==='dominoPairs')return {action:{type:'pair',a:i,b:c.solution[i]},text:'This pairing belongs to the unique complete tiling.'};
  if(id==='rectangles'){const group=c.solution[i],cells=c.solution.flatMap((v,j)=>v===group?[j]:[]);return {action:{type:'rectangle',a:Math.min(...cells),b:Math.max(...cells)},text:'This rectangle contains one clue and has exactly its stated area.'};}
  if(id==='tracks')return {action:{type:'edge',i,value:c.solution[i]},text:c.solution[i]?'This segment belongs to the unique route.':'Remove this segment; it is outside the unique route.'};
  const reasons={tents:'This square agrees with the row counts and tree matching.',slant:'This diagonal is part of the unique acyclic solution.',greaterGrid:'This value satisfies the inequalities and Latin-square constraints.',skyline:'This height agrees with the visibility and row/column clues.',symmetryIslands:'This cell belongs to the indicated center in the unique symmetric partition.',magnets:'This domino agrees with the pole counts and neighboring magnets.',fourRegions:'This symbol agrees with the fixed colors and shared borders.',cageSums:'This value satisfies its cage and row/column constraints.'};
  return {action:{type:'cell',i,value:c.solution[i]},text:reasons[id]};
 }
 return {ids,copy,rng,shuffle,neighbors,connected,edges,visibility,fresh,valid,validSave,treeMatching,tentsOK,slantOK,latinOK,magnetsOK,magnetValues,groupsOK,routeOK,ray,signature,solved,mineReveal,edit,flipSolve,pegRoute,hint};
})();
if(typeof module==='object')module.exports=QuietCore;else globalThis.DoPopQuietCore=QuietCore;
