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
#zipLinePage .zip-cell{z-index:2;background:transparent;border-color:#e8edf7}
#zipLinePage .zip-cell.used,#zipLinePage .zip-cell.current{background:transparent}
#zipLinePage .zip-cell.anchor{font-weight:600;font-size:clamp(16px,4.2vw,23px);color:#4770d6}
#zipLinePage .zip-cell.anchor::after{width:min(65%,40px);border:1px solid #c6d5f5;background:#fff;box-shadow:0 2px 7px #315bb810}
#zipLinePage .zip-cell.anchor.used::after{background:#4775e5;border-color:#4775e5}
#zipLinePage .zip-cell.current::before{content:'';position:absolute;width:14px;height:14px;background:#fff;border:4px solid #6285ee;border-radius:50%;box-shadow:0 0 0 5px #6285ee18}
#zipLinePage .zip-cell.anchor.current::before{display:none}
#zipLinePage #zipMessage{color:#7d90b3;font-size:12px;line-height:1.6;text-align:center}
'''
s=s.replace('\n</style>','\n'+css+'\n</style>',1)

new_js=r'''// ZIP LINE — clean box-filling drag game v7
let zipLevel=1,zipCols=5,zipRows=7,zipAnchorsByCell=new Map(),zipPathCells=[],zipGesture=null,zipCanvas=null;
const zipStage=$('zipStage');
function zipKey(x,y){return x+','+y}
function zipSolutionPath(cols,rows){const out=[];for(let y=0;y<rows;y++){if(y%2===0){for(let x=0;x<cols;x++)out.push([x,y])}else{for(let x=cols-1;x>=0;x--)out.push([x,y])}}return out}
function makeZip(){
  zipCols=zipLevel<4?5:6;
  zipRows=zipLevel<7?7:8;
  const solution=zipSolutionPath(zipCols,zipRows),total=solution.length;
  const count=Math.min(4+Math.floor(zipLevel/2),8);
  zipAnchorsByCell=new Map();
  for(let n=1;n<=count;n++){
    const i=Math.round((n-1)*(total-1)/(count-1));
    const [x,y]=solution[i];
    zipAnchorsByCell.set(zipKey(x,y),n);
  }
  zipPathCells=[];
  zipGesture=null;
}
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
function zipDraw(liveX=null,liveY=null){
  const cv=zipEnsureCanvas(),r=zipStage.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1),ctx=cv.getContext('2d');
  ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,r.width,r.height);
  if(!zipPathCells.length)return;
  const cw=r.width/zipCols,ch=r.height/zipRows;
  ctx.beginPath();
  zipPathCells.forEach(([x,y],i)=>{const px=(x+.5)*cw,py=(y+.5)*ch;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});

  ctx.strokeStyle='#6285ee';ctx.lineWidth=Math.max(8,Math.min(cw,ch)*.19);ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
}
function zipRefresh(liveX=null,liveY=null){
  const used=new Set(zipPathCells.map(([x,y])=>zipKey(x,y))),last=zipPathCells.at(-1);
  zipStage.querySelectorAll('.zip-cell').forEach(el=>{const x=+el.dataset.x,y=+el.dataset.y;el.classList.toggle('used',used.has(zipKey(x,y)));el.classList.toggle('current',!!last&&last[0]===x&&last[1]===y)});
  zipDraw(liveX,liveY);
  $('zipLevel').textContent=zipLevel;
  if(!zipPathCells.length)$('zipMessage').textContent='Start at 1 · use every box.';
  else if(zipPathCells.length===zipCols*zipRows)$('zipMessage').textContent='Complete — every box used.';
  else $('zipMessage').textContent='Keep filling every box · next number '+zipNextAnchor();
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
  const [px,py]=zipPathCells.at(-1);if(Math.abs(x-px)+Math.abs(y-py)!==1)return false;
  const existing=zipPathCells.findIndex(([xx,yy])=>xx===x&&yy===y);
  if(existing>=0&&existing===zipPathCells.length-2)return 'undo';
  if(existing>=0)return false;
  const a=zipAnchor(x,y);if(a&&a!==zipNextAnchor())return false;
  return true;
}
function zipEnter(x,y){
  const ok=zipCanEnter(x,y);if(!ok)return false;
  if(ok==='undo')zipPathCells.pop();else zipPathCells.push([x,y]);
  zipRefresh(zipGesture?.x,zipGesture?.y);
  if(zipPathCells.length===zipCols*zipRows){
    const lastAnchor=Math.max(...zipAnchorsByCell.values());
    if(zipHighestAnchorPassed()===lastAnchor){toast('Every box connected ✦');beep(820,.09);setTimeout(()=>{zipLevel++;makeZip();renderZip()},700)}
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
$('zipReset').addEventListener('click',()=>{zipPathCells=[];zipGesture=null;zipRefresh()});
'''

pattern=r'// ZIP LINE — fill every box, anchors in order.*?// FIDGET — high-response sensory spin'
if not re.search(pattern,s,flags=re.S):
    raise SystemExit('Zip Line section markers not found')
s=re.sub(pattern,new_js+'\n// FIDGET — high-response sensory spin',s,count=1,flags=re.S)
p.write_text(s)
print('replaced Zip Line with clean v7 implementation')
