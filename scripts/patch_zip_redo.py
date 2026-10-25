from pathlib import Path
import re

p=Path('index.html')
s=p.read_text()
marker='/* Zip Line clean redo v7 */'
if marker in s:
    raise SystemExit('already patched')

css=r'''
/* Zip Line clean redo v7 */
#zipLinePage .zip-stage{
  position:relative;
  display:grid;
  grid-template-columns:repeat(var(--zip-cols,5),minmax(0,1fr));
  grid-template-rows:repeat(var(--zip-rows,7),minmax(0,1fr));
  padding:0;
  gap:0;
  overflow:hidden;
  touch-action:none!important;
  -webkit-user-select:none;
  user-select:none;
}
#zipLinePage .zip-stage svg{display:none!important}
#zipLinePage .zip-cell{
  position:relative;
  z-index:1;
  min-width:0;
  min-height:0;
  display:grid;
  place-items:center;
  border-right:1px solid #e3e9f5;
  border-bottom:1px solid #e3e9f5;
  background:rgba(255,255,255,.9);
  touch-action:none!important;
}
#zipLinePage .zip-cell.used{background:#edf3ff}
#zipLinePage .zip-cell.current{background:#dbe7ff}
#zipLinePage .zip-cell.anchor{font-size:clamp(16px,4.2vw,25px);font-weight:760;color:#3568ee}
#zipLinePage .zip-cell.anchor::after{content:'';position:absolute;width:min(46%,31px);aspect-ratio:1;border-radius:50%;border:1.5px solid #9fb6ef;background:#fff;z-index:-1}
#zipLinePage .zip-cell.anchor.used::after{background:#3568ee;border-color:#3568ee}
#zipLinePage .zip-cell.anchor.used{color:#fff}
#zipLinePage canvas.zip-path-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}
#zipLinePage .zip-stage{background:#fff;border:1px solid #dce5f5;border-radius:22px;box-shadow:0 12px 40px #355fa509}
#zipLinePage .zip-cell{z-index:2;background:transparent;border:0}
#zipLinePage .zip-cell.used,#zipLinePage .zip-cell.current{background:transparent}
#zipLinePage .zip-cell.anchor{font-weight:600;font-size:clamp(16px,4.2vw,23px);color:#4770d6}
#zipLinePage .zip-cell.anchor::after{width:min(65%,40px);border:1px solid #c6d5f5;background:#fff;box-shadow:0 2px 7px #315bb810}
#zipLinePage .zip-cell.anchor.used::after{background:#4775e5;border-color:#4775e5}
#zipLinePage .zip-cell.current::before{content:'';position:absolute;width:14px;height:14px;background:#fff;border:4px solid #6285ee;border-radius:50%;box-shadow:0 0 0 5px #6285ee18}
#zipLinePage .zip-cell.anchor.current::before{display:none}
.zip-level-picker{border:1px solid #dce5f5;border-radius:24px;padding:24px;color:#33415e;width:min(360px,90vw);box-shadow:0 20px 80px #28437220}.zip-level-picker::backdrop{background:#26395733;backdrop-filter:blur(4px)}.zip-level-picker h2{font-size:23px;font-weight:550;margin:0 0 10px}.zip-level-picker p{font-size:13px;color:#8090ad}.zip-level-picker label{display:grid;gap:8px;font-size:13px}.zip-level-picker input{font:inherit;font-size:22px;padding:12px;border:1px solid #cbd9f7;border-radius:12px;width:100%;box-sizing:border-box}.zip-level-picker form>div{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.zip-level-picker button{border:0;border-radius:20px;padding:12px 16px;background:#edf3ff;color:#3568ee}#zipLinePage .zip-footer{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}#zipLinePage #zipMessage{flex-basis:100%}#zipChooseLevel,#zipNext,#zipUndo,#zipReset{flex-shrink:0;min-height:40px;padding:8px 13px}
#zipLinePage #zipMessage{color:#7d90b3;font-size:12px;line-height:1.6;text-align:center}
'''
s=s.replace('\n</style>','\n'+css+'\n</style>',1)

new_js=r'''// ZIP LINE — clean box-filling drag game v7
const zipSaveKey='pocketpause.zip.progress.v1';
let zipStored=null;try{zipStored=JSON.parse(localStorage.getItem(zipSaveKey)||'null')}catch{}
let zipLevel=Number.isInteger(zipStored?.level)&&zipStored.level>=1&&zipStored.level<=1000?zipStored.level:1,zipCols=5,zipRows=7,zipAnchorsByCell=new Map(),zipPathCells=[],zipGesture=null,zipCanvas=null;
const zipStage=$('zipStage');
function zipKey(x,y){return x+','+y}
let zipWalls=new Set(),zipSolution=[],zipAdvance=null;
function zipEdge(a,b){return [zipKey(...a),zipKey(...b)].sort().join('|')}
function zipRandom(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function zipSolutionPath(cols,rows,random){
  let out=[];for(let y=0;y<rows;y++)for(let i=0;i<cols;i++)out.push([y%2?cols-1-i:i,y]);
  for(let k=0;k<cols*rows*35;k++){
    if(random()<.5)out.reverse();
    const [x,y]=out[0],options=[];
    for(let j=2;j<out.length;j++)if(Math.abs(out[j][0]-x)+Math.abs(out[j][1]-y)===1)options.push(j);
    if(options.length){const j=options[Math.floor(random()*options.length)];out=out.slice(0,j).reverse().concat(out.slice(j))}
  }
  return out;
}
function makeZip(){
  clearTimeout(zipAdvance);zipAdvance=null;
  const tier=zipLevel<4?0:zipLevel<10?1:zipLevel<22?2:3;
  zipCols=[4,5,6,7][tier];zipRows=[5,6,7,8][tier];
  const random=zipRandom(zipLevel*7919+3127),solution=zipSolutionPath(zipCols,zipRows,random),total=solution.length;
  zipSolution=solution;const count=[5,6,7,8][tier],indices=[0];
  for(let n=1;n<count-1;n++){const center=n*(total-1)/(count-1),jitter=(random()-.5)*total/count*.6;indices.push(Math.max(indices.at(-1)+1,Math.min(total-(count-n),Math.round(center+jitter))))}indices.push(total-1);
  zipAnchorsByCell=new Map(indices.map((i,n)=>[zipKey(...solution[i]),n+1]));
  const routeEdges=new Set(solution.slice(1).map((p,i)=>zipEdge(solution[i],p)));zipWalls=new Set();
  if(zipLevel>=4)for(let y=0;y<zipRows;y++)for(let x=0;x<zipCols;x++)for(const [dx,dy]of [[1,0],[0,1]]){const q=[x+dx,y+dy];if(q[0]>=zipCols||q[1]>=zipRows)continue;const edge=zipEdge([x,y],q);if(!routeEdges.has(edge)&&random()<[0,.10,.16,.22][tier])zipWalls.add(edge)}
  zipPathCells=[];zipGesture=null;
  if(zipStored?.level===zipLevel&&Array.isArray(zipStored.path)){
    const saved=zipStored.path;zipStored=null;
    for(const p of saved.slice(0,total)){if(!Array.isArray(p)||p.length!==2||!p.every(Number.isInteger)||zipCanEnter(...p)!==true)break;zipPathCells.push([...p])}
  }else zipStored=null;
}
function zipSave(){try{localStorage.setItem(zipSaveKey,JSON.stringify({level:zipLevel,path:zipPathCells}))}catch{}}
function zipAnchor(x,y){return zipAnchorsByCell.get(zipKey(x,y))||0}
function zipHighestAnchorPassed(){let n=0;for(const [x,y] of zipPathCells){const a=zipAnchor(x,y);if(a===n+1)n=a}return n}
function zipNextAnchor(){return zipHighestAnchorPassed()+1}
function zipEnsureCanvas(){
  if(!zipCanvas||!zipStage.contains(zipCanvas)){
    zipCanvas=document.createElement('canvas');
    zipCanvas.className='zip-path-canvas';
    zipStage.appendChild(zipCanvas);
  }
  const r=zipStage.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);
  const w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));
  if(zipCanvas.width!==w||zipCanvas.height!==h){zipCanvas.width=w;zipCanvas.height=h}
  return zipCanvas;
}
let zipFlowFrame=0;
const zipReducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function zipScheduleFlow(){
  if(zipFlowFrame||zipReducedMotion.matches||document.hidden||currentPage!=='zipLine'||zipPathCells.length<2)return;
  zipFlowFrame=requestAnimationFrame(()=>{zipFlowFrame=0;if(document.hidden||currentPage!=='zipLine'||zipReducedMotion.matches)return;zipDraw();zipScheduleFlow()});
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)zipScheduleFlow()});
zipReducedMotion.addEventListener('change',()=>{if(currentPage==='zipLine'){zipDraw();zipScheduleFlow()}});
function zipFlowTrack(points,radius){
  const samples=[points[0]],add=p=>samples.push(p);
  for(let i=1;i<points.length;i++){
    const p=points[i],a=points[i-1],b=points[i+1];
    if(!b){add(p);continue}
    const ab=Math.hypot(p[0]-a[0],p[1]-a[1]),bc=Math.hypot(b[0]-p[0],b[1]-p[1]);
    const start=[p[0]-(p[0]-a[0])*radius/ab,p[1]-(p[1]-a[1])*radius/ab],end=[p[0]+(b[0]-p[0])*radius/bc,p[1]+(b[1]-p[1])*radius/bc];
    add(start);for(let j=1;j<=8;j++){const t=j/8,u=1-t;add([u*u*start[0]+2*u*t*p[0]+t*t*end[0],u*u*start[1]+2*u*t*p[1]+t*t*end[1]])}
  }
  let length=0;const segments=[];
  for(let i=1;i<samples.length;i++){const a=samples[i-1],b=samples[i],n=Math.hypot(b[0]-a[0],b[1]-a[1]);if(n){segments.push({a,b,start:length,n});length+=n}}
  return{length,at(d){const s=segments.find(s=>d<=s.start+s.n)||segments.at(-1);const t=Math.max(0,Math.min(1,(d-s.start)/s.n));return[s.a[0]+(s.b[0]-s.a[0])*t,s.a[1]+(s.b[1]-s.a[1])*t]}};
}
function zipDraw(liveX=null,liveY=null){
  const cv=zipEnsureCanvas(),r=zipStage.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1),ctx=cv.getContext('2d');
  ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,r.width,r.height);
  const cw=r.width/zipCols,ch=r.height/zipRows;
  // Draw grid first so neither grid seams nor walls cut across the route.
  ctx.strokeStyle='#e8edf7';ctx.lineWidth=1;ctx.beginPath();
  for(let x=1;x<zipCols;x++){ctx.moveTo(x*cw,0);ctx.lineTo(x*cw,r.height)}
  for(let y=1;y<zipRows;y++){ctx.moveTo(0,y*ch);ctx.lineTo(r.width,y*ch)}ctx.stroke();
  ctx.strokeStyle='#61728f';ctx.lineWidth=4;ctx.lineCap='round';
  for(const edge of zipWalls){const [a,b]=edge.split('|').map(v=>v.split(',').map(Number));ctx.beginPath();if(a[0]!==b[0]){const x=Math.max(a[0],b[0])*cw;ctx.moveTo(x,a[1]*ch+3);ctx.lineTo(x,(a[1]+1)*ch-3)}else{const y=Math.max(a[1],b[1])*ch;ctx.moveTo(a[0]*cw+3,y);ctx.lineTo((a[0]+1)*cw-3,y)}ctx.stroke()}
  if(!zipPathCells.length)return;
  ctx.beginPath();
  const points=zipPathCells.map(([x,y])=>[(x+.5)*cw,(y+.5)*ch]),radius=Math.min(cw,ch)*.20;
  ctx.moveTo(...points[0]);
  for(let i=1;i<points.length;i++){
    const p=points[i],prev=points[i-1],next=points[i+1];
    if(!next){ctx.lineTo(...p);continue}
    const before=Math.hypot(p[0]-prev[0],p[1]-prev[1]),after=Math.hypot(next[0]-p[0],next[1]-p[1]);
    ctx.lineTo(p[0]-(p[0]-prev[0])*radius/before,p[1]-(p[1]-prev[1])*radius/before);
    ctx.quadraticCurveTo(p[0],p[1],p[0]+(next[0]-p[0])*radius/after,p[1]+(next[1]-p[1])*radius/after);
  }

  ctx.strokeStyle='#6285ee';ctx.lineWidth=Math.max(12,Math.min(32,Math.min(cw,ch)*.29));ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
  if(!zipReducedMotion.matches&&points.length>1){
    const track=zipFlowTrack(points,radius),cell=Math.min(cw,ch),time=performance.now()/1000,width=ctx.lineWidth;
    ctx.save();ctx.lineCap='round';
    for(let d=0;d<track.length-3;d+=3){const p=track.at(d),q=track.at(Math.min(track.length,d+4)),light=(Math.sin(d/(cell*.65)-time*2.3)+1)*.5;ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.lineWidth=width*.58;ctx.strokeStyle='rgba(198,235,255,'+(.025+light*.11)+')';ctx.stroke()}
    const count=Math.min(90,Math.ceil(track.length/cell*5));
    for(let i=0;i<count;i++){
      const hash=((i*137.508)%101)/101,d=(hash*track.length+time*cell*(.45+hash*.55))%track.length;
      const p=track.at(d),q=track.at(Math.min(track.length,d+1)),angle=Math.atan2(q[1]-p[1],q[0]-p[0]),offset=Math.sin(i*2.399+time*.7)*width*.28,fade=Math.min(1,d/(cell*.2),(track.length-d)/(cell*.2));
      ctx.beginPath();ctx.arc(p[0]-Math.sin(angle)*offset,p[1]+Math.cos(angle)*offset,.55+hash*.65,0,Math.PI*2);ctx.fillStyle='rgba(235,250,255,'+(fade*(.18+hash*.25))+')';ctx.fill();
    }ctx.restore();
  }
}
function zipRefresh(liveX=null,liveY=null){
  const used=new Set(zipPathCells.map(([x,y])=>zipKey(x,y))),last=zipPathCells.at(-1);
  zipStage.querySelectorAll('.zip-cell').forEach(el=>{const x=+el.dataset.x,y=+el.dataset.y;el.classList.toggle('used',used.has(zipKey(x,y)));el.classList.toggle('current',!!last&&last[0]===x&&last[1]===y)});
  zipDraw(liveX,liveY);zipScheduleFlow();zipSave();
  if(document.getElementById('zipChooseLevel'))$('zipChooseLevel').textContent='Level '+zipLevel;
  if(document.getElementById('zipNext'))$('zipNext').hidden=zipPathCells.length!==zipCols*zipRows;
  $('zipLevel').textContent=zipLevel;
  if(!zipPathCells.length)$('zipMessage').textContent='Start at 1 · fill every cell · avoid walls.';
  else if(zipPathCells.length===zipCols*zipRows)$('zipMessage').textContent='Complete — every box used.';
  else $('zipMessage').textContent=zipPathCells.length+'/'+(zipCols*zipRows)+' cells · next '+zipNextAnchor()+' · tap the line to redraw';
}
function renderZip(){
  if(!zipAnchorsByCell.size)makeZip();
  zipStage.style.setProperty('--zip-cols',zipCols);zipStage.style.setProperty('--zip-rows',zipRows);
  zipStage.innerHTML='';
  for(let y=0;y<zipRows;y++)for(let x=0;x<zipCols;x++){
    const a=zipAnchor(x,y),el=document.createElement('div');
    el.className='zip-cell'+(a?' anchor':'');el.dataset.x=x;el.dataset.y=y;if(a)el.textContent=a;zipStage.appendChild(el);
  }
  zipCanvas=null;zipEnsureCanvas();zipRefresh();
}
function zipCanEnter(x,y){
  if(x<0||x>=zipCols||y<0||y>=zipRows)return false;
  if(!zipPathCells.length)return zipAnchor(x,y)===1;
  const prior=zipPathCells.findIndex(([xx,yy])=>xx===x&&yy===y);if(prior>=0)return 'undo';
  const [px,py]=zipPathCells.at(-1);if(zipWalls.has(zipEdge([px,py],[x,y])))return false;if(Math.abs(x-px)+Math.abs(y-py)!==1)return false;
  const existing=zipPathCells.findIndex(([xx,yy])=>xx===x&&yy===y);
  if(existing>=0&&existing===zipPathCells.length-2)return 'undo';
  if(existing>=0)return false;
  const a=zipAnchor(x,y);if(a&&a!==zipNextAnchor())return false;if(a===zipAnchorsByCell.size&&zipPathCells.length!==zipCols*zipRows-1)return false;
  return true;
}
function zipEnter(x,y){
  const ok=zipCanEnter(x,y);if(!ok)return false;
  clearTimeout(zipAdvance);zipAdvance=null;
  if(ok==='undo')zipPathCells.length=zipPathCells.findIndex(([xx,yy])=>xx===x&&yy===y)+1;else zipPathCells.push([x,y]);
  zipRefresh(zipGesture?.x,zipGesture?.y);
  if(zipPathCells.length===zipCols*zipRows){
    const lastAnchor=Math.max(...zipAnchorsByCell.values());
    if(zipHighestAnchorPassed()===lastAnchor){toast('Every box connected ✦');beep(820,.09);zipAdvance=setTimeout(()=>{zipLevel=zipLevel%1000+1;makeZip();renderZip()},1000)}
  }
  return true;
}
function zipCellFromClient(x,y){const r=zipStage.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom)return null;return{x:Math.max(0,Math.min(zipCols-1,Math.floor((x-r.left)/r.width*zipCols))),y:Math.max(0,Math.min(zipRows-1,Math.floor((y-r.top)/r.height*zipRows)))}}
function zipStart(x,y,target,touchId=null){
  const el=target?.closest?.('.zip-cell'),c=el?{x:+el.dataset.x,y:+el.dataset.y}:zipCellFromClient(x,y);if(!c)return false;
  if(!zipPathCells.length&&zipAnchor(c.x,c.y)!==1){toast('Start at 1');return false}
  const tail=zipPathCells.at(-1);
  if(!(tail&&tail[0]===c.x&&tail[1]===c.y)&&!zipEnter(c.x,c.y))return false;
  zipGesture={x,y,originX:x,originY:y,touchId,pointerId:null};zipRefresh(x,y);return true;
}
function zipMove(x,y){
  if(!zipGesture||!zipPathCells.length)return;
  const r=zipStage.getBoundingClientRect(),cw=r.width/zipCols,ch=r.height/zipRows;
  const fromX=zipGesture.x,fromY=zipGesture.y,steps=Math.max(1,Math.ceil(Math.hypot(x-fromX,y-fromY)/Math.min(cw,ch)*6));
  for(let i=1;i<=steps;i++){
    const px=fromX+(x-fromX)*i/steps,py=fromY+(y-fromY)*i/steps,c=zipCellFromClient(px,py);
    if(!c)continue;
    const tail=zipPathCells.at(-1);if(tail[0]===c.x&&tail[1]===c.y)continue;
    if(Math.abs(px-(r.left+(c.x+.5)*cw))>cw*.42||Math.abs(py-(r.top+(c.y+.5)*ch))>ch*.42)continue;
    zipEnter(c.x,c.y);
  }
  zipGesture.x=x;zipGesture.y=y;zipRefresh();
}
function zipEnd(){if(!zipGesture)return;zipGesture=null;zipRefresh()}
function zipTouch(list,id){for(const t of list)if(id==null||t.identifier===id)return t;return null}
zipStage.addEventListener('touchstart',e=>{if(currentPage!=='zipLine'||zipGesture)return;const t=e.changedTouches[0]||e.touches[0];if(t&&zipStart(t.clientX,t.clientY,e.target,t.identifier))e.preventDefault()},{passive:false});
const zipTouchMove=e=>{if(currentPage!=='zipLine'||!zipGesture||zipGesture.touchId==null)return;const t=zipTouch(e.touches,zipGesture.touchId);if(!t)return;e.preventDefault();zipMove(t.clientX,t.clientY)};
zipStage.addEventListener('touchmove',zipTouchMove,{passive:false});
document.addEventListener('touchmove',zipTouchMove,{passive:false,capture:true});
document.addEventListener('touchend',e=>{if(!zipGesture||zipGesture.touchId==null)return;if(zipTouch(e.changedTouches,zipGesture.touchId)){e.preventDefault();zipEnd()}},{passive:false,capture:true});
document.addEventListener('touchcancel',()=>{if(zipGesture&&zipGesture.touchId!=null)zipEnd()},{passive:false,capture:true});
zipStage.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||zipGesture)return;if(zipStart(e.clientX,e.clientY,e.target)){zipGesture.pointerId=e.pointerId;e.preventDefault()}});
document.addEventListener('pointermove',e=>{if(!zipGesture||zipGesture.pointerId!==e.pointerId)return;e.preventDefault();zipMove(e.clientX,e.clientY)});
document.addEventListener('pointerup',e=>{if(zipGesture&&zipGesture.pointerId===e.pointerId)zipEnd()});
document.addEventListener('pointercancel',()=>zipEnd());
new ResizeObserver(()=>{if(currentPage==='zipLine')zipDraw()}).observe(zipStage);
const zipChoose=document.createElement('button');zipChoose.id='zipChooseLevel';zipChoose.className=$('zipReset').className;zipChoose.textContent='Level '+zipLevel;$('zipReset').before(zipChoose);
const zipNext=document.createElement('button');zipNext.id='zipNext';zipNext.className=$('zipReset').className;zipNext.textContent='Next →';zipNext.hidden=true;$('zipReset').before(zipNext);
zipNext.addEventListener('click',()=>{zipLevel=zipLevel%1000+1;makeZip();renderZip()});
const zipPicker=document.createElement('dialog');zipPicker.className='zip-level-picker';
zipPicker.innerHTML='<form method="dialog"><h2>Choose a level</h2><p>Your current level saves on this phone.</p><label>Level (1–1000)<input name="level" type="number" min="1" max="1000" step="1" inputmode="numeric" required></label><div><button type="button" id="zipPickerCancel">Cancel</button><button type="submit">Play level →</button></div></form>';
document.body.appendChild(zipPicker);
zipChoose.addEventListener('click',()=>{zipPicker.querySelector('input').value=zipLevel;zipPicker.showModal()});
$('zipPickerCancel').addEventListener('click',()=>zipPicker.close());
zipPicker.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const n=Number(zipPicker.querySelector('input').value);if(!Number.isInteger(n)||n<1||n>1000)return;zipLevel=n;zipStored=null;makeZip();renderZip();zipPicker.close()});
const zipUndo=document.createElement('button');zipUndo.className=$('zipReset').className;zipUndo.textContent='Undo';zipUndo.id='zipUndo';$('zipReset').before(zipUndo);zipUndo.addEventListener('click',()=>{clearTimeout(zipAdvance);zipAdvance=null;zipGesture=null;zipPathCells.pop();zipRefresh()});
$('zipReset').addEventListener('click',()=>{clearTimeout(zipAdvance);zipAdvance=null;zipPathCells=[];zipGesture=null;zipRefresh()});
'''

pattern=r'// ZIP LINE — fill every box, anchors in order.*?// FIDGET — high-response sensory spin'
if not re.search(pattern,s,flags=re.S):
    raise SystemExit('Zip Line section markers not found')
s=re.sub(pattern,new_js+'\n// FIDGET — high-response sensory spin',s,count=1,flags=re.S)
p.write_text(s)
print('replaced Zip Line with clean v7 implementation')

# Pac-Man follows the existing arcade palette and navigation.
s=p.read_text()
pac=r"""<script>
(()=>{
const card=document.createElement('button');card.className='game-card';card.innerHTML='<span class="mini-art" style="display:grid;place-items:center;font-size:48px;color:var(--blue)">◕</span><span class="card-copy"><b>Pac-Man</b><small>Collect dots. Dodge the chase.</small></span><span class="arrow">→</span>';document.querySelector('.game-grid').append(card);
const page=document.createElement('section');page.id='pacPage';page.className='page game-page';page.innerHTML=`<div class="game-heading"><button class="back-button" id="pacBack">←</button><div><p class="eyebrow">PAC-MAN</p><h1>Follow the dots.</h1></div><div class="heading-stat"><b id="pacScore">0</b><span>score</span></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center" id="pacOptions"></div><canvas id="pacCanvas" style="display:block;width:100%;max-height:65dvh;aspect-ratio:15/19;touch-action:none;margin:12px auto;background:white;border-radius:24px"></canvas><div style="display:flex;justify-content:center;gap:10px"><button class="soft-button" id="pacPlay">Play / pause</button><button class="soft-button" id="pacRestart">Restart</button><label>Level <input id="pacLevel" type="number" min="1" max="1000" style="width:65px"></label></div><p class="center-note" id="pacNote">Swipe or use arrow keys. Large dots turn the chase around.</p>`;document.getElementById('app').append(page);
let level=+storage.get('pac.level',1)||1,color=storage.get('pac.color',snakeColor),shape=storage.get('pac.shape',snakeShape),run=false,score=0,lives=3,dir=[0,0],next=[0,0],power=0,tick=0,grid=[],dots=new Set(),player=[1,1],ghosts=[];
const cv=$('pacCanvas'),ctx=cv.getContext('2d'),W=15,H=19;
if(!SNAKE_COLORS[color])color='blue';
function save(){storage.set('pac.level',level);storage.set('pac.progress',JSON.stringify({level,dots:[...dots],player,score,lives}));}
function make(restore=false){let seed=level*777;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};grid=Array.from({length:H},()=>Array(W).fill(1));grid[1][1]=0;const stack=[[1,1]];while(stack.length){const [x,y]=stack.at(-1),opts=[[2,0],[-2,0],[0,2],[0,-2]].filter(([a,b])=>x+a>0&&x+a<W-1&&y+b>0&&y+b<H-1&&grid[y+b][x+a]);if(!opts.length){stack.pop();continue}const [a,b]=opts[Math.floor(rnd()*opts.length)];grid[y+b/2][x+a/2]=grid[y+b][x+a]=0;stack.push([x+a,y+b]);}for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++)if(grid[y][x]&&rnd()<.18&&((!grid[y-1][x]&&!grid[y+1][x])||(!grid[y][x-1]&&!grid[y][x+1])))grid[y][x]=0;dots=new Set();grid.forEach((r,y)=>r.forEach((v,x)=>{if(!v)dots.add(y*W+x)}));player=[1,1];dots.delete(16);score=0;lives=3;dir=next=[0,0];power=0;ghosts=[[13,17],[13,1],[1,17]].slice(0,Math.min(3,1+Math.floor(level/3)));if(restore){const z=parse(storage.get('pac.progress'));if(z?.level===level&&Array.isArray(z.dots)&&Array.isArray(z.player)&&!grid[z.player[1]]?.[z.player[0]]){dots=new Set(z.dots);player=z.player;score=z.score||0;lives=z.lives>0?z.lives:3;}}$('pacLevel').value=level;visualPlayer=[...player];visualGhosts=ghosts.map(g=>[...g]);accumulator=0;save();draw();}
let visualPlayer=null,visualGhosts=[],frameTime=0,accumulator=0;
function draw(){if(cv.width!==600){cv.width=600;cv.height=760;}const c=40,pal=SNAKE_COLORS[color];ctx.clearRect(0,0,600,760);function mark(x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();if(shape==='square')ctx.rect(x-r,y-r,2*r,2*r);else ctx.arc(x,y,r,0,7);ctx.fill();}grid.forEach((row,y)=>row.forEach((v,x)=>{if(v)mark(x*c+20,y*c+20,17,pal.body+'25');else if(dots.has(y*W+x))mark(x*c+20,y*c+20,((x===1||x===13)&&(y===1||y===17))?8:3,pal.food);}));(visualGhosts.length===ghosts.length?visualGhosts:ghosts).forEach(([x,y])=>{mark(x*c+20,y*c+20,13,power?'#b9c9e9':pal.body);mark(x*c+16,y*c+17,3,'white');mark(x*c+25,y*c+17,3,'white');});const [x,y]=visualPlayer||player;mark(x*c+20,y*c+20,15,pal.head);ctx.save();ctx.translate(x*c+20,y*c+20);ctx.rotate(Math.atan2(dir[1],dir[0]));ctx.fillStyle='white';ctx.beginPath();ctx.moveTo(0,0);const mouth=run?4+Math.abs(Math.sin(performance.now()/95))*8:7;ctx.lineTo(18,-mouth);ctx.lineTo(18,mouth);ctx.fill();ctx.restore();$('pacScore').textContent=score;$('pacNote').textContent=`${lives} lives · ${dots.size} dots · ${run?'Swipe or use arrows':'Paused · tap Play'}${power?' · power up':''}`;}
const valid=(p,d)=>grid[p[1]+d[1]]?.[p[0]+d[0]]===0;
function step(){if(!run||currentPage!=='pac'||document.hidden)return;if(valid(player,next))dir=next;if(valid(player,dir))player=[player[0]+dir[0],player[1]+dir[1]];if(dots.delete(player[1]*W+player[0])){score+=10;if((player[0]===1||player[0]===13)&&(player[1]===1||player[1]===17))power=35;}if(power)power--;if(++tick%2===0)ghosts=ghosts.map(g=>{const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>valid(g,d));opts.sort((a,b)=>(Math.abs(g[0]+a[0]-player[0])+Math.abs(g[1]+a[1]-player[1])-Math.abs(g[0]+b[0]-player[0])-Math.abs(g[1]+b[1]-player[1]))*(power?-1:1));const d=Math.random()<.25?opts[Math.floor(Math.random()*opts.length)]:opts[0];return d?[g[0]+d[0],g[1]+d[1]]:g;});ghosts=ghosts.map(g=>{if(g[0]===player[0]&&g[1]===player[1]){if(power){score+=100;return[13,17]}lives--;player=[1,1];dir=next=[0,0];run=false;}return g;});if(lives<=0){toast('Round over · Restart to try again');run=false;}if(!dots.size){level=level%1000+1;make();toast('Next maze');}save();draw();}
let fromPlayer=null,fromGhosts=[];
function frame(now){const dt=Math.min(50,now-(frameTime||now));frameTime=now;if(run&&currentPage==='pac'&&!document.hidden){accumulator+=dt;const duration=Math.max(115,185-level*2);if(accumulator>=duration){accumulator%=duration;fromPlayer=[...player];fromGhosts=ghosts.map(g=>[...g]);step();}const a=accumulator/duration;const mix=(old,p)=>!old||Math.hypot(old[0]-p[0],old[1]-p[1])>1.1?[...p]:[old[0]+(p[0]-old[0])*a,old[1]+(p[1]-old[1])*a];visualPlayer=mix(fromPlayer,player);visualGhosts=ghosts.map((g,i)=>mix(fromGhosts[i],g));draw();}requestAnimationFrame(frame);}requestAnimationFrame(frame);
card.onclick=()=>{showPage('pac');draw()};$('pacBack').onclick=()=>{run=false;save();showPage('home')};$('pacPlay').onclick=()=>{if(lives<=0)make();run=!run;draw()};$('pacRestart').onclick=()=>{run=false;make()};$('pacLevel').onchange=e=>{level=Math.max(1,Math.min(1000,Math.floor(+e.target.value)||1));run=false;make()};for(const name of Object.keys(SNAKE_COLORS).concat(['round','square'])){const b=document.createElement('button');b.className='soft-button';b.textContent=SNAKE_COLORS[name]?'':name;b.setAttribute('aria-label',name);b.dataset.pacOption=name;if(SNAKE_COLORS[name]){b.classList.add('color-swatch');b.style.setProperty('--swatch',SNAKE_COLORS[name].body)}else b.classList.add('shape-choice');b.onclick=()=>{if(SNAKE_COLORS[name]){color=name;storage.set('pac.color',name)}else{shape=name;storage.set('pac.shape',name)}document.querySelectorAll('[data-pac-option]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pacOption===color||b.dataset.pacOption===shape)));draw()};b.setAttribute('aria-pressed',String(name===color||name===shape));$('pacOptions').append(b)}document.addEventListener('keydown',e=>{if(currentPage!=='pac')return;const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(d){e.preventDefault();next=d;}});let touch;cv.onpointerdown=e=>{touch=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId)};cv.onpointermove=e=>{if(!touch)return;const x=e.clientX-touch[0],y=e.clientY-touch[1];if(Math.hypot(x,y)<12)return;next=Math.abs(x)>Math.abs(y)?[Math.sign(x),0]:[0,Math.sign(y)];touch=[e.clientX,e.clientY]};cv.onpointerup=cv.onpointercancel=()=>touch=null;document.addEventListener('visibilitychange',()=>{if(document.hidden){run=false;save();draw()}});make(true);
})();
</script>"""
s=s.replace('</script>',pac.removeprefix('<script>').removesuffix('</script>')+'\n</script>',1);p.write_text(s)

s=p.read_text()
css="""<style>
.home-page{max-width:760px!important}.home-intro{padding:22px 0 28px!important;text-align:center;max-width:none}.home-intro h1{font-size:52px!important}.home-intro>p:last-child{margin-top:12px!important}.game-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:24px 12px!important}.game-card{display:flex!important;flex-direction:column;gap:10px!important;padding:0!important;border:0!important;background:none!important;box-shadow:none!important;min-height:0!important;text-align:center}.game-card .mini-art{width:82px!important;height:82px!important;border-radius:23px!important;transform:none!important;box-shadow:0 8px 24px #4f78ec12}.game-card .card-copy b{font-size:13px!important;letter-spacing:0}.game-card small,.game-card .arrow{display:none!important}.home-foot{padding-top:30px}.level-control{display:flex;justify-content:center;align-items:center;gap:8px;margin:6px auto;flex:0 0 auto;font-size:12px;color:#71809d}.level-control input{width:70px;border:1px solid #dfe7f8;border-radius:12px;padding:8px;background:white;color:#3568ee}.level-control button{padding:8px 12px} @media(max-width:380px){.game-card .mini-art{width:68px!important;height:68px!important}.game-grid{gap:24px 6px!important}}
</style>"""
s=s.replace('</head>',css+'</head>').replace('<title>Pocket Pause','<title>dopop')
s=s.replace('let searchPuzzle=0,',"let searchPuzzle=Math.max(0,Math.min(999,+storage.get('search.level',0)||0)),")
s=s.replace('function renderSearch(){',"function renderSearch(){storage.set('search.level',searchPuzzle);")
s=s.replace('speed(){return Math.max(80,170-this.score*2)}',"speed(){return Math.max(55,180-(+storage.get('snake.level',1)-1)*8-this.score*2)}")
s=s.replace('this.level=1;this.bag',"this.level=Math.max(1,Math.min(20,+localStorage.getItem('pocketpause.v1.tetris.startLevel')||1));this.lines=(this.level-1)*10;this.bag")
extra=r"""
const intro=document.querySelector('.home-intro');intro.innerHTML='<p class="eyebrow">LITTLE GAMES. GOOD MOMENTS.</p><h1>dopop<span style="color:var(--blue)">.</span></h1><p>A little play goes a long way.</p>';document.title='dopop — little games, good moments';document.querySelector('.home-foot').textContent='dopop.fun · Pick a game. Find your flow.';const brand=$('brandHome');brand.innerHTML='<span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>dopop</span>';brand.setAttribute('aria-label','dopop home');
function levelControl(page,label,max,value,apply){const el=document.createElement('form');el.className='level-control';el.innerHTML=`<label>${label} <input aria-label="${label}" type="number" min="1" max="${max}" value="${value}" required></label><button class="soft-button">Go</button>`;el.onsubmit=e=>{e.preventDefault();const n=+el.querySelector('input').value;if(Number.isInteger(n)&&n>=1&&n<=max)apply(n)};$(page+'Page').querySelector('.game-heading').after(el);}
levelControl('words','Level',1000,wordGame.levelIndex+1,n=>{wordGame.levelIndex=n-2;wordGame.next();letterOrder=[];renderWords();saveWords()});
levelControl('wordSearch','Puzzle',1000,searchPuzzle+1,n=>{searchPuzzle=n-1;makeSearch();renderSearch()});
levelControl('sudoku','Puzzle',1000,+storage.get('sudoku.level',1),n=>{storage.set('sudoku.level',n);const made=makeSudoku($('sudokuDifficulty').value,19007+n*97);sudoku={...made,board:made.puzzle.map(r=>[...r]),notes:Array.from({length:81},()=>[]),selected:null,history:[],elapsed:0,solved:false};saveSudoku();renderSudoku()});
levelControl('snake','Speed level',15,+storage.get('snake.level',1),n=>{storage.set('snake.level',n);toast('Snake speed level '+n)});
levelControl('tetris','Starting level',20,+storage.get('tetris.startLevel',1),n=>{storage.set('tetris.startLevel',n);startTetris();drawTetris()});
const fNote=document.createElement('p');fNote.className='center-note';fNote.textContent='Free play · no levels, just unwind.';$('fidgetPage').append(fNote);
"""
s=s.replace('</script>',extra+'\n</script>',1);p.write_text(s)

s=p.read_text()
uniform=r"""<style>
body:has(.game-page.active) .topbar{display:none}body:has(.game-page.active) #app{min-height:100dvh}
#app .game-page.active{display:flex;flex-direction:column;height:100dvh;min-height:0;max-width:850px;width:100%;margin:auto;padding:max(12px,env(safe-area-inset-top)) 12px max(10px,env(safe-area-inset-bottom));background:#fff radial-gradient(circle,#dce5f7 1px,transparent 1.4px);background-size:26px 26px;overflow:auto;gap:8px}
#app .game-page .game-heading{width:100%;flex-shrink:0;margin:0 0 6px;padding:2px 4px;gap:10px}#app .game-page .back-button{background:#ffffffbb;border:0;box-shadow:none;color:#899aba}#app .game-page .game-heading h1{font-size:clamp(23px,5vw,32px)}
.game-footer{margin-top:auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;flex-shrink:0;padding:6px 0}.game-footer .soft-button,.level-launch{min-height:42px;border-radius:999px!important;padding:10px 16px!important;background:#ffffffed;border:1px solid #e1e8f5;font-size:13px;cursor:pointer}.game-footer .level-control{margin:0}.game-footer .center-note{width:100%;margin:2px}
.level-dialog{border:1px solid #dfe7f8;border-radius:24px;padding:24px;max-width:90vw;color:#26334d}.level-dialog::backdrop{background:#23314d55}.level-dialog form{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.level-dialog input{width:80px;padding:10px;border:1px solid #dfe7f8;border-radius:12px}
#pacPage #pacCanvas{flex:1 1 0;min-height:150px;width:100%!important;height:0;max-height:none!important;object-fit:contain;margin:0!important;border:1px solid #e0e8f7;background:white;border-radius:22px}
#pacOptions,.snake-options,.tetris-appearance{display:flex!important;justify-content:center;align-items:center;gap:6px!important;flex-wrap:wrap}
.color-swatch,#app .tetris-color{width:28px!important;height:28px!important;min-height:28px!important;padding:5px!important;border:0!important;border-radius:50%!important;background:white;box-shadow:none;position:relative}.color-swatch:before{content:'';display:block;width:18px;height:18px;border-radius:50%;background:var(--swatch)}.color-swatch[aria-pressed=true],#app .tetris-color[aria-pressed=true]{box-shadow:inset 0 0 0 2px #cdd9f6!important}.shape-choice,#app .tetris-shape{height:28px!important;min-height:28px!important;border:0!important;border-radius:999px!important;padding:4px 10px!important;font-size:11px!important;background:white;color:#7d879b}.shape-choice[aria-pressed=true],#app .tetris-shape[aria-pressed=true]{background:#eef3ff;color:#3568ee}#app .tetris-palette,#app .tetris-shapes{display:flex;gap:6px}.game-footer .snake-options{padding:0!important}.game-footer #pacOptions{width:100%}
#app #snakePage .canvas-shell{border:1px solid #e0e8f7;border-radius:22px;flex:1;min-height:180px}#app #wordsPage .word-wheel-wrap{flex-shrink:1}#app #sudokuPage .sudoku-board{flex-shrink:0;width:min(100%,54dvh)}
</style>"""
s=s.replace('</head>',uniform+'</head>')
ui=r"""
for(const id of ['words','sudoku','snake','tetris','wordSearch','pac','fidget']){
 const pg=$(id+'Page'),footer=document.createElement('div');footer.className='game-footer';pg.append(footer);
 const form=pg.querySelector('.level-control');if(form){const input=form.querySelector('input'),launch=document.createElement('button'),dialog=document.createElement('dialog');launch.className='level-launch';launch.textContent='Level '+input.value;dialog.className='level-dialog';dialog.append(form);const cancel=document.createElement('button');cancel.type='button';cancel.className='soft-button';cancel.textContent='Cancel';cancel.onclick=()=>dialog.close();form.append(cancel);form.addEventListener('submit',()=>{if(form.checkValidity()){launch.textContent='Level '+input.value;dialog.close()}});launch.onclick=()=>dialog.showModal();footer.append(launch);pg.append(dialog);}
 const selectors={words:['.word-status','#nextWord'],sudoku:['.sudoku-toolbar','.sudoku-tools'],snake:['.snake-options'],tetris:['.tetris-appearance'],wordSearch:['.search-meta','#searchNew'],pac:['#pacNote','#pacOptions'],fidget:[]}[id];for(const sel of selectors){const el=pg.querySelector(sel);if(el)footer.append(el);}
 if(id==='pac'){const controls=$('pacPlay').parentElement;footer.append(controls);const input=$('pacLevel'),label=input.parentElement,dialog=document.createElement('dialog'),launch=document.createElement('button');dialog.className='level-dialog';launch.className='level-launch';launch.textContent='Level '+input.value;const done=document.createElement('button');done.className='soft-button';done.textContent='Done';done.onclick=()=>{input.dispatchEvent(new Event('change'));launch.textContent='Level '+input.value;dialog.close()};dialog.append(label,done);pg.append(dialog);controls.prepend(launch);launch.onclick=()=>dialog.showModal();}
}
"""
s=s.replace('</script>',ui+'\n</script>',1);p.write_text(s)

# Consistent touch-safe chrome and centered appearance choices.
s=p.read_text()
polish=r'''<style>
#app .game-page.active{background:#fff!important;background-image:none!important}
#app .game-page,#app .game-page *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
#app .game-page input,#app .game-page textarea{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}
#app .game-heading,#app .game-footer,#app .game-footer>*{background-color:#fff;background-image:none}
#pacOptions{display:flex;align-items:center;justify-content:center;gap:12px!important}
.appearance-group{display:flex;align-items:center;gap:6px;padding:4px 6px;border:1px solid #e8edf7;border-radius:999px;background:#fff}
#app #pacOptions .color-swatch,#app .tetris-color{box-sizing:border-box;display:grid;place-items:center;width:26px!important;height:26px!important;min-height:26px!important;padding:0!important;flex:0 0 26px;border:0!important;border-radius:50%!important;background:transparent!important;box-shadow:none!important;}
#app #pacOptions .color-swatch:before,#app .tetris-color:after{position:static;display:block;width:18px!important;height:18px!important;margin:0!important;border-radius:50%;background:var(--swatch);transform:none!important}
#app #pacOptions .color-swatch[aria-pressed=true],#app .tetris-color[aria-pressed=true]{box-shadow:inset 0 0 0 2px #cdd9f6!important}
#app #pacOptions .shape-choice,#app .tetris-shape{min-width:52px;height:28px!important;padding:0 9px!important;border:0!important;border-radius:999px!important;font-size:11px!important;font-weight:700;background:transparent;color:#7d879b}
#app #pacOptions .shape-choice[aria-pressed=true],#app .tetris-shape[aria-pressed=true]{background:#eef3ff;color:#3568ee}
#app .tetris-palette,#app .tetris-shapes{display:flex;align-items:center;gap:6px;padding:4px 6px;border:1px solid #e8edf7;border-radius:999px;background:#fff}
</style>'''
s=s.replace('</head>',polish+'</head>')
polish_js=r'''
const pacOptions=$('pacOptions');for(const selector of ['.color-swatch','.shape-choice']){const group=document.createElement('div');group.className='appearance-group';group.setAttribute('role','group');group.setAttribute('aria-label',selector==='.color-swatch'?'Color':'Shape');for(const button of [...pacOptions.querySelectorAll(selector)])group.append(button);pacOptions.append(group);}
for(const pg of document.querySelectorAll('.game-page')){
 const editable=target=>target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable=true]');
 pg.addEventListener('selectstart',e=>{if(!editable(e.target))e.preventDefault()});
 pg.addEventListener('contextmenu',e=>{if(!editable(e.target))e.preventDefault()});
 pg.addEventListener('dragstart',e=>{if(!editable(e.target))e.preventDefault()});
 pg.addEventListener('pointerdown',e=>{if(!editable(e.target))window.getSelection()?.removeAllRanges()});
}
'''
s=s.replace('</script>',polish_js+'\n</script>',1);p.write_text(s)
