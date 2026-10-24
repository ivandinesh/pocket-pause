from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Zip native touch canvas v5 */'
if marker in s:
    raise SystemExit('already patched')

css=r'''
/* Zip native touch canvas v5 */
#zipLinePage .zip-stage svg{display:none!important}
#zipLinePage .zip-stage canvas.zip-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none}
'''
s=s.replace('\n</style>','\n'+css+'\n</style>',1)

old=r'''const zipStage=$('zipStage');zipStage.addEventListener('pointerdown',e=>{const el=e.target.closest?.('.zip-cell');if(!el)return;e.preventDefault();const x=+el.dataset.x,y=+el.dataset.y;if(!zipPathCells.length&&el.textContent.trim()!=='1')return;if(!zipTryCellLive(x,y))return;zipDrag={id:e.pointerId,x:e.clientX,y:e.clientY};try{zipStage.setPointerCapture(e.pointerId)}catch{}});zipStage.addEventListener('pointermove',e=>{if(!zipDrag||zipDrag.id!==e.pointerId)return;e.preventDefault();zipProcessDrag(zipDrag.x,zipDrag.y,e.clientX,e.clientY);zipDrag.x=e.clientX;zipDrag.y=e.clientY});function endZip(){zipDrag=null;const l=$('zipLive');if(l)l.hidden=true}zipStage.addEventListener('pointerup',endZip);zipStage.addEventListener('pointercancel',endZip);$('zipReset').addEventListener('click',()=>{zipPathCells=[];renderZip()});'''

new=r'''/* Zip native touch canvas v5 */
function ensureZipCanvas(){let cv=zipStage.querySelector('canvas.zip-canvas');if(!cv){cv=document.createElement('canvas');cv.className='zip-canvas';zipStage.appendChild(cv)}const r=zipStage.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;cv.getContext('2d').setTransform(d,0,0,d,0,0)}return cv}
function drawZipCanvas(live=null){const cv=ensureZipCanvas(),ctx=cv.getContext('2d'),r=zipStage.getBoundingClientRect(),cw=r.width/zipCols,ch=r.height/zipRows;ctx.clearRect(0,0,r.width,r.height);if(!zipPathCells.length)return;ctx.beginPath();zipPathCells.forEach(([x,y],i)=>{const px=(x+.5)*cw,py=(y+.5)*ch;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)});if(live)ctx.lineTo(live.x-r.left,live.y-r.top);ctx.strokeStyle='#5d83ee';ctx.lineWidth=Math.max(5,Math.min(cw,ch)*.14);ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
function zipStartGesture(clientX,clientY,target){const el=target?.closest?.('.zip-cell');const c=el?{x:+el.dataset.x,y:+el.dataset.y}:zipCellFromPoint(clientX,clientY);if(!c)return false;const first=zipSolution[0];if(!zipPathCells.length&&(c.x!==first[0]||c.y!==first[1])){toast('Start at 1');return false}if(!zipTryCellLive(c.x,c.y))return false;zipDrag={x:clientX,y:clientY};drawZipCanvas({x:clientX,y:clientY});return true}
function zipMoveGesture(clientX,clientY){if(!zipDrag)return;zipProcessDrag(zipDrag.x,zipDrag.y,clientX,clientY);zipDrag.x=clientX;zipDrag.y=clientY;drawZipCanvas({x:clientX,y:clientY})}
function zipEndGesture(){zipDrag=null;drawZipCanvas()}
zipStage.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;const t=e.touches[0];if(zipStartGesture(t.clientX,t.clientY,e.target))e.preventDefault()},{passive:false});
zipStage.addEventListener('touchmove',e=>{if(!zipDrag||e.touches.length!==1)return;const t=e.touches[0];e.preventDefault();zipMoveGesture(t.clientX,t.clientY)},{passive:false});
zipStage.addEventListener('touchend',e=>{if(!zipDrag)return;e.preventDefault();zipEndGesture()},{passive:false});
zipStage.addEventListener('touchcancel',zipEndGesture,{passive:false});
zipStage.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;if(zipStartGesture(e.clientX,e.clientY,e.target)){e.preventDefault();zipDrag.id=e.pointerId}});
zipStage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!zipDrag||zipDrag.id!==e.pointerId)return;e.preventDefault();zipMoveGesture(e.clientX,e.clientY)});
zipStage.addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&zipDrag)zipEndGesture()});
$('zipReset').addEventListener('click',()=>{zipPathCells=[];renderZip()});'''

if old not in s:
    raise SystemExit('zip live listener block not found')
s=s.replace(old,new,1)
p.write_text(s)
print('patched Zip Line native touch + canvas')
