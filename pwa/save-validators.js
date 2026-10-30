// Runs inside the existing app module. Uses its pure cores, never changes a live board.
(() => {
 const S=DoPopSaveSafety,object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),level=(x,max)=>Number.isInteger(x)&&x>=1&&x<=max;
 const histories=(xs,test)=>xs==null||Array.isArray(xs)&&xs.length<=30&&xs.every(test);
 const attempts=(xs,max,test)=>xs==null||object(xs)&&Object.entries(xs).every(([n,a])=>/^\d+$/.test(n)&&level(+n,max)&&object(a)&&test(+n,a));
 S.register('pocketpause.v1.wordguess.v1',v=>Object.entries(v.rounds).every(([id,round])=>{const n=WGCore.answerIndex(id);return n>=0&&WGCore.validRound(round,WG_ANSWERS[n],WG_DICTIONARY);}));
 for(const id of ['rotateNetwork','loop','colorCode','pictureGrid'])S.register('pocketpause.v1.'+id,v=>attempts(v.attempts,30,(n,a)=>PuzzleSetCore.valid(id,a.state,PuzzleSetLevels[id][n-1])&&histories(a.history,s=>PuzzleSetCore.valid(id,s,PuzzleSetLevels[id][n-1]))));
 for(const id of ['binaryGrid','sightline'])S.register('pocketpause.v1.'+id,v=>attempts(v.attempts,50,(n,a)=>{const cfg=id==='binaryGrid'?MitDuoCore.binary(n):MitDuoCore.sightline(n),valid=xs=>Array.isArray(xs)&&xs.length===cfg.n*cfg.n&&xs.every(x=>x===null||x===0||x===1);return valid(a.values)&&histories(a.history,valid);}));
 for(const id of ['lightUp','bridges','slide']){
  const valid=(n,s)=>{if(!object(s)||!Number.isInteger(s.moves)||s.moves<0||!Array.isArray(s.values))return false;const cfg=id==='lightUp'?LogicTrio.light(n):id==='bridges'?LogicTrio.bridges(n):LogicTrio.slide(n),xs=s.values;
   return id==='lightUp'?new Set(xs).size===xs.length&&xs.every(x=>Number.isInteger(x)&&x>=0&&x<cfg.n*cfg.n&&!cfg.walls[x]):id==='bridges'?xs.length===cfg.edges.length&&xs.every(x=>[0,1,2].includes(x)):xs.length===cfg.n*cfg.n&&new Set(xs).size===xs.length&&xs.every(x=>Number.isInteger(x)&&x>=0&&x<cfg.n*cfg.n);};
  S.register('pocketpause.v1.logic.'+id,v=>valid(v.level,v.state)&&histories(v.history,s=>valid(v.level,s))&&attempts(v.attempts,50,(n,a)=>valid(n,a.state)&&histories(a.history,s=>valid(n,s))));
 }
 for(const id of ['flow','untangle','flood']){
  const valid=s=>{if(!object(s)||!level(s.level,50)||!Number.isInteger(s.moves)||s.moves<0)return false;
   if(id==='flow'){const cfg=CALM_FLOW_LEVELS[s.level-1];if(!Array.isArray(s.paths)||s.paths.length!==cfg.ends.length||!s.paths.every(Array.isArray))return false;const xs=s.paths.flat();return xs.every(x=>Number.isInteger(x)&&x>=0&&x<cfg.n*cfg.n)&&new Set(xs).size===xs.length&&s.paths.every((p,k)=>!p.length||cfg.ends[k].includes(p[0])&&p.every((x,i)=>(!i||calmNeighbors(p[i-1],cfg.n).includes(x))&&!cfg.ends.some((e,c)=>c!==k&&e.includes(x))));}
   if(id==='untangle')return Array.isArray(s.points)&&s.points.length===calmUntangleLevel(s.level).points.length&&s.points.every(p=>object(p)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=5&&p.x<=95&&p.y>=5&&p.y<=95);
   const cfg=calmFloodLevel(s.level);return Array.isArray(s.board)&&s.board.length===cfg.n*cfg.n&&s.board.every(x=>Number.isInteger(x)&&x>=0&&x<cfg.colors);};
  S.register('pocketpause.v1.calm.v1.'+id,v=>valid(v.state)&&(v.history==null||valid(v.history)&&v.history.level===v.state.level)&&attempts(v.attempts,50,(n,a)=>valid(a.state)&&a.state.level===n&&(a.history==null||valid(a.history)&&a.history.level===n)));
 }
})();
