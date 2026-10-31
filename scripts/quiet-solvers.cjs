// Independent search over clues, never over a stored answer. Build/test only.
const C=require('../games/quiet-core.js');
function count(id,c,limit=2,budget=180000){
 let nodes=0,limited=false,total=0,answer=null;
 const tick=()=>{if(++nodes>budget){limited=true;return false;}return total<limit;};
 const found=v=>{total++;if(!answer)answer=v.slice();};
 if(['greaterGrid','skyline','cageSums'].includes(id)){
  const a=c.givens.slice(),n=c.w;
  function dfs(){if(!tick())return;let best=-1,options;
   for(let i=0;i<a.length;i++)if(a[i]===-1){const opts=[];for(let v=1;v<=n;v++){a[i]=v;if(C.latinOK(a,c,true))opts.push(v);}a[i]=-1;if(!opts.length)return;if(!options||opts.length<options.length){best=i;options=opts;}if(opts.length===1)break;}
   if(best<0){if(C.latinOK(a,c))found(a);return;}
   for(const v of options){a[best]=v;dfs();if(total>=limit||limited)break;}a[best]=-1;
  }dfs();
 }else if(id==='slant'){
  const a=Array(c.w*c.h).fill(-1),m=c.w+1;
  const order=Array.from({length:a.length},(_,i)=>i).sort((i,j)=>{const degree=i=>{const x=i%c.w,y=Math.floor(i/c.w);return [y*m+x,y*m+x+1,(y+1)*m+x,(y+1)*m+x+1].filter(k=>c.clues[k]!==-1).length;};return degree(j)-degree(i);});
  function dfs(k){if(!tick()||!C.slantOK(a,c,true))return;if(k===a.length){found(a);return;}for(const v of [0,1]){a[order[k]]=v;dfs(k+1);if(total>=limit||limited)break;}a[order[k]]=-1;}dfs(0);
 }else if(id==='tents'){
  const patterns=c.rows.map((target,y)=>{const out=[];for(let mask=0;mask<(1<<c.w);mask++){const cells=Array.from({length:c.w},(_,x)=>x).filter(x=>mask&(1<<x));if(cells.length===target&&!(mask&(mask<<1))&&cells.every(x=>!c.trees.includes(y*c.w+x)))out.push(mask);}return out;});
  const a=Array(c.w*c.h).fill(0),cols=Array(c.w).fill(0);
  function dfs(y,prev){if(!tick())return;if(y===c.h){if(C.tentsOK(a,c))found(a);return;}
   for(const mask of patterns[y]){if(mask&(prev|prev<<1|prev>>1))continue;for(let x=0;x<c.w;x++){a[y*c.w+x]=Number(!!(mask&(1<<x)));cols[x]+=a[y*c.w+x];}
    if(cols.every((v,x)=>v<=c.cols[x]&&v+c.h-y-1>=c.cols[x]))dfs(y+1,mask);
    for(let x=0;x<c.w;x++){cols[x]-=a[y*c.w+x];a[y*c.w+x]=0;}if(total>=limit||limited)break;
   }
  }dfs(0,0);
 }else if(id==='dominoPairs'){
  const a=Array(c.w*c.h).fill(-1),used=new Set();
  function dfs(){if(!tick())return;let best=-1,opts;
   for(let i=0;i<a.length;i++)if(a[i]===-1){const next=C.neighbors(i,c.w,c.h).filter(j=>a[j]===-1&&!used.has([c.numbers[i],c.numbers[j]].sort((a,b)=>a-b).join(',')));if(!next.length)return;if(!opts||next.length<opts.length){best=i;opts=next;}if(next.length===1)break;}
   if(best<0){found(a);return;}for(const j of opts){const key=[c.numbers[best],c.numbers[j]].sort((a,b)=>a-b).join(',');a[best]=j;a[j]=best;used.add(key);dfs();used.delete(key);a[best]=a[j]=-1;if(total>=limit||limited)break;}
  }dfs();
 }else if(id==='rectangles'||id==='symmetryIslands'){
  const N=c.w*c.h,full=(1<<N)-1,groups=[];
  if(id==='rectangles')for(let k=0;k<c.clues.length;k++){
   const [pos,area]=c.clues[k],opts=[];
   for(let h=1;h<=c.h;h++)if(area%h===0){const w=area/h;if(w>c.w)continue;for(let y=0;y+h<=c.h;y++)for(let x=0;x+w<=c.w;x++){
    const cells=[];for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)cells.push(yy*c.w+xx);
    if(cells.includes(pos)&&!c.clues.some(([p],j)=>j!==k&&cells.includes(p)))opts.push(cells.reduce((m,i)=>m|(1<<i),0));
   }}groups.push(opts);
  }else for(const [cx,cy] of c.centers){
   const pairs=[],central=new Set();for(const y of new Set([Math.floor(cy/2),Math.ceil(cy/2)]))for(const x of new Set([Math.floor(cx/2),Math.ceil(cx/2)]))central.add(y*c.w+x);
   for(let i=0;i<N;i++){const x=cx-i%c.w,y=cy-Math.floor(i/c.w),j=y*c.w+x;if(x>=0&&x<c.w&&y>=0&&y<c.h&&j>=i)pairs.push(i===j?[i]:[i,j]);}
   const opts=[];for(let mask=1;mask<(1<<pairs.length);mask++){
    const cells=pairs.flatMap((p,k)=>mask&(1<<k)?p:[]),set=new Set(cells);if([...central].some(i=>!set.has(i))||!C.connected(cells,c.w,c.h))continue;
    opts.push(cells.reduce((m,i)=>m|(1<<i),0));
   }groups.push(opts);
  }
  const chosen=Array(groups.length).fill(0);
  function dfs(mask){if(!tick())return;if(mask===full){if(chosen.every(Boolean)){const a=Array(N).fill(-1);chosen.forEach((bits,k)=>{for(let i=0;i<N;i++)if(bits&(1<<i))a[i]=k;});found(a);}return;}
   let best=-1,options;for(let k=0;k<groups.length;k++)if(!chosen[k]){const opts=groups[k].filter(bits=>!(bits&mask));if(!opts.length)return;if(!options||opts.length<options.length){best=k;options=opts;}}
   if(best<0)return;for(const bits of options){chosen[best]=bits;dfs(mask|bits);chosen[best]=0;if(total>=limit||limited)break;}
  }dfs(0);
 }else if(id==='magnets'){
  const a=Array(c.pairs.length).fill(-1);
  function dfs(i){if(!tick()||!C.magnetsOK(a,c,true))return;if(i===a.length){found(a);return;}for(const v of [0,1,2]){a[i]=v;dfs(i+1);if(total>=limit||limited)break;}a[i]=-1;}dfs(0);
 }else if(id==='fourRegions'){
  const a=c.givens.slice(),adj=Array.from({length:c.regionCount},()=>[]);for(const [i,j]of c.adj){adj[i].push(j);adj[j].push(i);}
  function dfs(){if(!tick())return;let best=-1,opts;
   for(let i=0;i<a.length;i++)if(a[i]===-1){const next=[0,1,2,3].filter(v=>adj[i].every(j=>a[j]!==v));if(!next.length)return;if(!opts||next.length<opts.length){best=i;opts=next;}}
   if(best<0){found(a);return;}for(const v of opts){a[best]=v;dfs();if(total>=limit||limited)break;}a[best]=-1;
  }dfs();
 }else if(id==='tracks'){
  const es=C.edges(c.w,c.h),edgeIndex=new Map(es.map(([a,b],i)=>[[a,b].sort((a,b)=>a-b).join(','),i])),path=[c.a],seen=new Set(path),rows=Array(c.h).fill(0),cols=Array(c.w).fill(0),goal=c.rows.reduce((a,b)=>a+b,0);rows[Math.floor(c.a/c.w)]++;cols[c.a%c.w]++;
  function dfs(i){if(!tick())return;if(i===c.b){if(path.length!==goal)return;const a=Array(es.length).fill(0);for(let k=1;k<path.length;k++)a[edgeIndex.get([path[k-1],path[k]].sort((a,b)=>a-b).join(','))]=1;if(c.fixed.every(i=>a[i])&&C.routeOK(a,c))found(a);return;}
   if(path.length>=goal)return;const dist=Math.abs(i%c.w-c.b%c.w)+Math.abs(Math.floor(i/c.w)-Math.floor(c.b/c.w));if(dist>goal-path.length)return;
   for(const j of C.neighbors(i,c.w,c.h))if(!seen.has(j)){const x=j%c.w,y=Math.floor(j/c.w);if(rows[y]>=c.rows[y]||cols[x]>=c.cols[x])continue;seen.add(j);path.push(j);rows[y]++;cols[x]++;dfs(j);rows[y]--;cols[x]--;path.pop();seen.delete(j);if(total>=limit||limited)break;}
  }dfs(c.a);
 }else throw Error('No verifier for '+id);
 return {count:total,solution:answer,limited,nodes};
}
function mineProof(c){
 const known=Array(c.w*c.h).fill(-1);for(const i of c.open)known[i]=0;let changed=true,steps=[];
 while(changed){changed=false;const constraints=[];
  for(let i=0;i<known.length;i++)if(known[i]===0){const around=C.neighbors(i,c.w,c.h,true),cells=around.filter(j=>known[j]===-1),need=around.reduce((n,j)=>n+c.mines[j],0)-around.filter(j=>known[j]===1).length;if(cells.length)constraints.push({cells,need});}
  constraints.push({cells:known.flatMap((v,i)=>v===-1?[i]:[]),need:c.mines.filter(Boolean).length-known.filter(v=>v===1).length});
  function apply(cells,need){if(!cells.length||need<0||need>cells.length)return;if(need!==0&&need!==cells.length)return;for(const i of cells)if(known[i]===-1){const v=need===0?0:1;if(v!==c.mines[i])throw Error('Unsound deduction');known[i]=v;changed=true;steps.push([i,v]);}}
  for(const constraint of constraints)apply(constraint.cells,constraint.need);
  for(const a of constraints)for(const b of constraints)if(a!==b&&a.cells.length<b.cells.length&&a.cells.every(i=>b.cells.includes(i)))apply(b.cells.filter(i=>!a.cells.includes(i)),b.need-a.need);
 }
 return {solved:!known.includes(-1),steps};
}
module.exports={count,mineProof};
