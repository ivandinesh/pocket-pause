from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Zip native touch canvas v6 */'
if marker in s:
    raise SystemExit('already patched')

css=r'''
/* Zip native touch canvas v6 */
#zipLinePage .zip-stage svg{display:none!important}
#zipLinePage .zip-stage canvas.zip-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none}
'''
s=s.replace('\n</style>','\n'+css+'\n</style>',1)

old=r'''const zipStage=$('zipStage');zipStage.addEventListener('pointerdown',e=>{const el=e.target.closest?.('.zip-cell');if(!el)return;e.preventDefault();const x=+el.dataset.x,y=+el.dataset.y;if(!zipPathCells.length&&el.textContent.trim()!=='1')return;if(!zipTryCellLive(x,y))return;zipDrag={id:e.pointerId,x:e.clientX,y:e.clientY};try{zipStage.setPointerCapture(e.pointerId)}catch{}});zipStage.addEventListener('pointermove',e=>{if(!zipDrag||zipDrag.id!==e.pointerId)return;e.preventDefault();zipProcessDrag(zipDrag.x,zipDrag.y,e.clientX,e.clientY);zipDrag.x=e.clientX;zipDrag.y=e.clientY});function endZip(){zipDrag=null;const l=$('zipLive');if(l)l.hidden=true}zipStage.addEventListener('pointerup',endZip);zipStage.addEventListener('pointercancel',endZip);$('zipReset').addEventListener('click',()=>{zipPathCells=[];renderZip()});'''

new=r'''/* Zip native touch canvas v6 */
function ensureZipCanvas(){let cv=zipStage.querySelector('canvas.zip-canvas');if(!cv){cv=document.createElement('canvas');cv.className='zip-canvas';zipStage.appendChild(cv)}const r=zipStage.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;cv.getContext('2d').setTransform(d,0,0,d,0,0)}return cv}
function drawZipCanvas(live=null){const cv=ensureZipCanvas(),ctx=cv.getContext('2d'),r=zipStage.getBoundingClientRect(),cw=r.width/zipCols,ch=r.height/zipRows;ctx.clearRect(0,0,r.width,r.height);if(!zipPathCells.length)return;ctx.beginPath();zipPathCells.forEach(([x,y],i)=>{const px=(x+.5)*cw,py=(y+.5)*ch;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)});if(live)ctx.lineTo(live.x-r.left,live.y-r.top);ctx.strokeStyle='#5d83ee';ctx.lineWidth=Math.max(5,Math.min(cw,ch)*.14);ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
function zipStartGesture(clientX,clientY,target,touchId=null){const el=target?.closest?.('.zip-cell');const c=el?{x:+el.dataset.x,y:+el.dataset.y}:zipCellFromPoint(clientX,clientY);if(!c)return false;const first=zipSolution[0];if(!zipPathCells.length&&(c.x!==first[0]||c.y!==first[1])){toast('Start at 1');return false}if(!zipTryCellLive(c.x,c.y))return false;zipDrag={x:clientX,y:clientY,touchId};drawZipCanvas({x:clientX,y:clientY});return true}
function zipWalkTo(clientX,clientY){if(!zipDrag||!zipPathCells.length)return;const target=zipCellFromPoint(clientX,clientY);if(!target)return;const r=zipStage.getBoundingClientRect(),cw=r.width/zipCols,ch=r.height/zipRows;let guard=0;while(guard++<24){const [cx,cy]=zipPathCells.at(-1);if(cx===target.x&&cy===target.y)break;const centerX=r.left+(cx+.5)*cw,centerY=r.top+(cy+.5)*ch,fx=(clientX-centerX)/cw,fy=(clientY-centerY)/ch;const dx=target.x-cx,dy=target.y-cy;let primary,secondary;if(Math.abs(fx)>=Math.abs(fy)){primary=dx?{x:cx+Math.sign(dx),y:cy}:dy?{x:cx,y:cy+Math.sign(dy)}:null;secondary=dy?{x:cx,y:cy+Math.sign(dy)}:null}else{primary=dy?{x:cx,y:cy+Math.sign(dy)}:dx?{x:cx+Math.sign(dx),y:cy}:null;secondary=dx?{x:cx+Math.sign(dx),y:cy}:null}let moved=false;if(primary)moved=zipTryCellLive(primary.x,primary.y);if(!moved&&secondary)moved=zipTryCellLive(secondary.x,secondary.y);if(!moved)break}}
function zipMoveGesture(clientX,clientY){if(!zipDrag)return;zipWalkTo(clientX,clientY);zipDrag.x=clientX;zipDrag.y=clientY;drawZipCanvas({x:clientX,y:clientY})}
function zipEndGesture(){zipDrag=null;drawZipCanvas()}
function zipTouchById(list,id){for(const t of list)if(id==null||t.identifier===id)return t;return null}
zipStage.addEventListener('touchstart',e=>{if(currentPage!=='zipLine'||zipDrag)return;const t=e.changedTouches[0]||e.touches[0];if(!t)return;if(zipStartGesture(t.clientX,t.clientY,e.target,t.identifier))e.preventDefault()},{passive:false});
document.addEventListener('touchmove',e=>{if(currentPage!=='zipLine'||!zipDrag||zipDrag.touchId==null)return;const t=zipTouchById(e.touches,zipDrag.touchId);if(!t)return;e.preventDefault();zipMoveGesture(t.clientX,t.clientY)},{passive:false,capture:true});
document.addEventListener('touchend',e=>{if(currentPage!=='zipLine'||!zipDrag||zipDrag.touchId==null)return;const t=zipTouchById(e.changedTouches,zipDrag.touchId);if(!t)return;e.preventDefault();zipEndGesture()},{passive:false,capture:true});
document.addEventListener('touchcancel',e=>{if(zipDrag&&zipDrag.touchId!=null)zipEndGesture()},{passive:false,capture:true});
zipStage.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;if(zipStartGesture(e.clientX,e.clientY,e.target)){e.preventDefault();zipDrag.id=e.pointerId}});
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!zipDrag||zipDrag.id!==e.pointerId)return;e.preventDefault();zipMoveGesture(e.clientX,e.clientY)});
document.addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&zipDrag&&zipDrag.id===e.pointerId)zipEndGesture()});
$('zipReset').addEventListener('click',()=>{zipPathCells=[];renderZip()});'''

if old not in s:
    raise SystemExit('zip live listener block not found')
s=s.replace(old,new,1)
p.write_text(s)
print('patched Number Path continuous snap drag + canvas')
