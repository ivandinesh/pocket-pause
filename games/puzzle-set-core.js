// DoPop puzzle mechanics and generators. Written for this collection; no imported game code.
globalThis.PuzzleSetCore = (() => {
  const copy = value => JSON.parse(JSON.stringify(value));
  function random(seed) { return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296); }
  function shuffle(a, r) { for (let i = a.length - 1; i; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const rotate = mask => ((mask << 1) & 15) | (mask >> 3);
  const directions = [[0,-1,1,4],[1,0,2,8],[0,1,4,1],[-1,0,8,2]];
  function networkSolved(values, n) {
    if (!Array.isArray(values) || values.length !== n*n) return false;
    let edges = 0;
    for (let i=0;i<values.length;i++) for (const [dx,dy,bit,opposite] of directions) {
      const x=i%n+dx,y=Math.floor(i/n)+dy;
      if (!(values[i]&bit)) continue;
      if (x<0||y<0||x>=n||y>=n||!(values[y*n+x]&opposite)) return false;
      edges++;
    }
    const seen=new Set([0]),todo=[0];
    while(todo.length) { const i=todo.pop(); for(const [dx,dy,bit] of directions) if(values[i]&bit) {const j=i+dx+dy*n;if(!seen.has(j)){seen.add(j);todo.push(j);}} }
    return seen.size===n*n && edges/2===n*n-1;
  }
  function networkCount(masks,n,limit=2) {
    let count=0,nodes=0;
    const domains=masks.map((mask,i)=>{const out=[];for(let k=0;k<4;k++,mask=rotate(mask)){if(out.includes(mask))continue;if(directions.every(([dx,dy,bit])=>{const x=i%n+dx,y=Math.floor(i/n)+dy;return (x>=0&&y>=0&&x<n&&y<n)||!(mask&bit);}))out.push(mask);}return out;});
    function search(dom) {
      if(count>=limit)return;
      if(++nodes>100000)throw Error('Network solver budget exceeded');
      let changed=true;
      while(changed) {changed=false;for(let i=0;i<dom.length;i++)for(const [dx,dy,bit,opposite] of directions){const x=i%n+dx,y=Math.floor(i/n)+dy;if(x<0||y<0||x>=n||y>=n)continue;const j=y*n+x,next=dom[i].filter(a=>dom[j].some(b=>!!(a&bit)===!!(b&opposite)));if(!next.length)return;if(next.length!==dom[i].length){dom[i]=next;changed=true;}}}
      let pick=-1;dom.forEach((d,i)=>{if(d.length>1&&(pick<0||d.length<dom[pick].length))pick=i;});
      if(dom.some(d=>!d.length))return;
      if(pick<0){if(networkSolved(dom.map(d=>d[0]),n))count++;return;}
      for(const value of dom[pick]){const next=dom.map(d=>d.slice());next[pick]=[value];search(next);if(count>=limit)return;}
    }
    search(domains);return count;
  }
  function network(level) {
    const n=level<=12?4:5,r=random(19001+level*701);
    for(let attempt=0;attempt<100;attempt++) {
      const solution=Array(n*n).fill(0),seen=new Set([0]),todo=[0];
      while(todo.length){const i=todo[todo.length-1],options=shuffle(directions.slice(),r).filter(([dx,dy])=>{const x=i%n+dx,y=Math.floor(i/n)+dy;return x>=0&&y>=0&&x<n&&y<n&&!seen.has(y*n+x);});if(!options.length){todo.pop();continue;}const [dx,dy,bit,opposite]=options[0],j=i+dx+dy*n;solution[i]|=bit;solution[j]|=opposite;seen.add(j);todo.push(j);}
      if(networkCount(solution,n)!==1)continue;
      const puzzle=solution.map(mask=>{for(let k=Math.floor(r()*4);k;k--)mask=rotate(mask);return mask;});
      if(networkSolved(puzzle,n))continue;
      return {n,puzzle,solution};
    }
    throw Error('Could not generate unique network '+level);
  }
  function loopGeometry(n) {
    const edges=[],cells=Array.from({length:n*n},()=>[]),vertices=Array.from({length:(n+1)*(n+1)},()=>[]);
    function add(a,b,adjacent){const i=edges.length;edges.push([a,b]);vertices[a].push(i);vertices[b].push(i);for(const c of adjacent)if(c>=0)cells[c].push(i);}
    for(let y=0;y<=n;y++)for(let x=0;x<n;x++)add(y*(n+1)+x,y*(n+1)+x+1,[y>0?(y-1)*n+x:-1,y<n?y*n+x:-1]);
    for(let y=0;y<n;y++)for(let x=0;x<=n;x++)add(y*(n+1)+x,(y+1)*(n+1)+x,[x>0?y*n+x-1:-1,x<n?y*n+x:-1]);
    return {edges,cells,vertices};
  }
  function oneLoop(values,geometry) {
    const selected=values.map((v,i)=>v===1?i:-1).filter(i=>i>=0);if(selected.length<4)return false;
    if(geometry.vertices.some(v=>{const degree=v.filter(i=>values[i]===1).length;return degree!==0&&degree!==2;}))return false;
    const seen=new Set(),todo=[selected[0]];
    while(todo.length){const i=todo.pop();if(seen.has(i))continue;seen.add(i);for(const v of geometry.edges[i])for(const j of geometry.vertices[v])if(values[j]===1&&!seen.has(j))todo.push(j);}
    return seen.size===selected.length;
  }
  function loopSolved(values,cfg) {
    const geo=loopGeometry(cfg.n);
    return values.length===geo.edges.length&&cfg.clues.every((c,i)=>c===null||geo.cells[i].filter(e=>values[e]===1).length===c)&&oneLoop(values,geo);
  }
  function loopCount(cfg,limit=2) {
    const geo=loopGeometry(cfg.n),constraints=geo.vertices.map(edges=>({edges,targets:[0,2]}));
    cfg.clues.forEach((c,i)=>{if(c!==null)constraints.push({edges:geo.cells[i],targets:[c]});});
    let count=0,nodes=0;
    function search(values){
      if(count>=limit)return;if(++nodes>150000)throw Error('Loop solver budget exceeded');
      let changed=true;
      while(changed){changed=false;for(const {edges,targets} of constraints){const ones=edges.filter(i=>values[i]===1).length,unknown=edges.filter(i=>values[i]===-1),possible=targets.filter(t=>t>=ones&&t<=ones+unknown.length);if(!possible.length)return;if(possible.length===1&&(possible[0]===ones||possible[0]===ones+unknown.length)){const fill=possible[0]===ones?0:1;for(const i of unknown){values[i]=fill;changed=true;}}}}
      const selected=values.map((v,i)=>v===1?i:-1).filter(i=>i>=0),seen=new Set();
      for(const first of selected){if(seen.has(first))continue;const todo=[first],component=[];while(todo.length){const e=todo.pop();if(seen.has(e))continue;seen.add(e);component.push(e);for(const v of geo.edges[e])for(const j of geo.vertices[v])if(values[j]===1&&!seen.has(j))todo.push(j);}const closed=component.every(e=>geo.edges[e].every(v=>geo.vertices[v].filter(i=>values[i]===1).length===2));if(closed){if(component.length!==selected.length)return;const complete=values.map(v=>v===-1?0:v);if(loopSolved(complete,cfg))count++;return;}}
      const pick=values.indexOf(-1);if(pick<0)return;
      for(const value of [0,1]){const next=values.slice();next[pick]=value;search(next);if(count>=limit)return;}
    }
    search(Array(geo.edges.length).fill(-1));return count;
  }
  function loop(level) {
    const n=5,r=random(33001+level*907),geo=loopGeometry(n);
    for(let attempt=0;attempt<200;attempt++){
      const inside=new Set([Math.floor(r()*n*n)]),target=4+Math.floor(r()*12);
      for(let step=0;step<target;step++){const candidates=[];for(const i of inside)for(const [dx,dy]of directions){const x=i%n+dx,y=Math.floor(i/n)+dy,j=y*n+x;if(x>=0&&y>=0&&x<n&&y<n&&!inside.has(j))candidates.push(j);}if(!candidates.length)break;inside.add(candidates[Math.floor(r()*candidates.length)]);}
      const solution=geo.edges.map((_,e)=>{const adj=[];geo.cells.forEach((edges,i)=>{if(edges.includes(e))adj.push(i);});return adj.filter(i=>inside.has(i)).length===1?1:0;});
      if(!oneLoop(solution,geo))continue;
      const clues=geo.cells.map(edges=>edges.reduce((sum,i)=>sum+solution[i],0)),cfg={n,clues,solution};
      if(loopCount(cfg)!==1)continue;
      let removed=0;const goal=Math.min(10,2+Math.floor(level/3));
      for(const i of shuffle(Array.from({length:n*n},(_,i)=>i),r)){const old=clues[i];clues[i]=null;if(loopCount(cfg)!==1)clues[i]=old;else removed++;if(removed>=goal)break;}
      return cfg;
    }
    throw Error('Could not generate unique loop '+level);
  }
  function runs(line){const out=[];let count=0;for(const bit of [...line,0]){if(bit===1)count++;else if(count){out.push(count);count=0;}}return out;}
  function patterns(n,clue){const out=[];for(let mask=0;mask<2**n;mask++){const row=Array.from({length:n},(_,i)=>(mask>>i)&1);if(JSON.stringify(runs(row))===JSON.stringify(clue))out.push(row);}return out;}
  function pictureCount(cfg,limit=2){
    let count=0;const n=cfg.n;
    function search(rows,cols){
      if(count>=limit)return;let changed=true;
      while(changed){changed=false;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const nr=rows[y].filter(row=>cols[x].some(col=>col[y]===row[x])),nc=cols[x].filter(col=>nr.some(row=>row[x]===col[y]));if(!nr.length||!nc.length)return;if(nr.length!==rows[y].length||nc.length!==cols[x].length)changed=true;rows[y]=nr;cols[x]=nc;}}
      let pick=-1;rows.forEach((row,i)=>{if(row.length>1&&(pick<0||row.length<rows[pick].length))pick=i;});if(pick<0){count++;return;}
      for(const row of rows[pick]){const next=rows.map(a=>a.slice());next[pick]=[row];search(next,cols.map(a=>a.slice()));if(count>=limit)return;}
    }
    search(cfg.rows.map(c=>patterns(n,c)),cfg.cols.map(c=>patterns(n,c)));return count;
  }
  function pictureSolved(values,cfg){const n=cfg.n;return values.length===n*n&&cfg.rows.every((c,y)=>JSON.stringify(runs(values.slice(y*n,(y+1)*n)))===JSON.stringify(c))&&cfg.cols.every((c,x)=>JSON.stringify(runs(Array.from({length:n},(_,y)=>values[y*n+x])))===JSON.stringify(c));}
  function picture(level){const n=level<=15?5:7,r=random(56003+level*509);for(let attempt=0;attempt<1000;attempt++){const solution=Array.from({length:n*n},()=>r()<.52?1:0),rows=Array.from({length:n},(_,y)=>runs(solution.slice(y*n,(y+1)*n))),cols=Array.from({length:n},(_,x)=>runs(Array.from({length:n},(_,y)=>solution[y*n+x])));const cfg={n,rows,cols,solution};if(rows.some(c=>!c.length)||cols.some(c=>!c.length))continue;if(pictureCount(cfg)===1)return cfg;}throw Error('Could not generate unique picture '+level);}
  function code(level){const index=((level-1)*73+41)%256;return {size:4,colors:4,turns:8,answer:Array.from({length:4},(_,i)=>(index>>(i*2))&3)};}
  function feedback(guess,answer){let exact=0;const a=Array(6).fill(0),b=Array(6).fill(0);for(let i=0;i<answer.length;i++){if(guess[i]===answer[i])exact++;else{a[answer[i]]++;b[guess[i]]++;}}return {exact,misplaced:a.reduce((sum,n,i)=>sum+Math.min(n,b[i]),0)};}
  function fresh(id,cfg){if(id==='rotateNetwork')return {values:cfg.puzzle.slice(),locks:cfg.puzzle.map(()=>false)};if(id==='loop')return {values:loopGeometry(cfg.n).edges.map(()=>-1)};if(id==='pictureGrid')return {values:Array(cfg.n*cfg.n).fill(-1)};return {guesses:[],entry:Array(cfg.size).fill(null)};}
  function valid(id,state,cfg){if(!state||typeof state!=='object')return false;if(id==='colorCode')return Array.isArray(state.guesses)&&state.guesses.length<=cfg.turns&&state.guesses.every(row=>Array.isArray(row)&&row.length===cfg.size&&row.every(v=>Number.isInteger(v)&&v>=0&&v<cfg.colors))&&Array.isArray(state.entry)&&state.entry.length===cfg.size&&state.entry.every(v=>v===null||(Number.isInteger(v)&&v>=0&&v<cfg.colors))&&!state.guesses.slice(0,-1).some(row=>feedback(row,cfg.answer).exact===cfg.size);const initial=fresh(id,cfg);return Array.isArray(state.values)&&state.values.length===initial.values.length&&state.values.every((v,i)=>id==='rotateNetwork'?Number.isInteger(v)&&[0,1,2,3].some(k=>{let m=cfg.puzzle[i];while(k--)m=rotate(m);return m===v;}):[-1,0,1].includes(v))&&(id!=='rotateNetwork'||(Array.isArray(state.locks)&&state.locks.length===state.values.length&&state.locks.every(v=>typeof v==='boolean')));}
  function solved(id,state,cfg){if(id==='rotateNetwork')return networkSolved(state.values,cfg.n);if(id==='loop')return loopSolved(state.values,cfg);if(id==='pictureGrid')return pictureSolved(state.values,cfg);return state.guesses.some(row=>feedback(row,cfg.answer).exact===cfg.size);}
  return {copy,rotate,network,networkSolved,networkCount,loop,loopGeometry,loopSolved,loopCount,picture,pictureSolved,pictureCount,code,feedback,fresh,valid,solved};
})();
