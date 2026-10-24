from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Zip drag coordinate fix v3 */'
if marker in s:
    raise SystemExit('already patched')
old="""const zipStage=$('zipStage');zipStage.addEventListener('pointerdown',e=>{const c=e.target.closest('.zip-cell');if(!c)return;e.preventDefault();zipDrag={id:e.pointerId};try{zipStage.setPointerCapture(e.pointerId)}catch{};zipTryCell(+c.dataset.x,+c.dataset.y)});zipStage.addEventListener('pointermove',e=>{if(!zipDrag||zipDrag.id!==e.pointerId)return;const c=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.zip-cell');if(c)zipTryCell(+c.dataset.x,+c.dataset.y)});"""
new="""/* Zip drag coordinate fix v3 */
function zipCellFromPoint(clientX,clientY){const r=zipStage.getBoundingClientRect();if(clientX<r.left||clientX>r.right||clientY<r.top||clientY>r.bottom)return null;const x=Math.max(0,Math.min(zipCols-1,Math.floor((clientX-r.left)/r.width*zipCols))),y=Math.max(0,Math.min(zipRows-1,Math.floor((clientY-r.top)/r.height*zipRows)));return{x,y}}
function zipProcessDrag(x1,y1,x2,y2){const r=zipStage.getBoundingClientRect(),cell=Math.min(r.width/zipCols,r.height/zipRows),dist=Math.hypot(x2-x1,y2-y1),steps=Math.max(1,Math.ceil(dist/Math.max(6,cell*.28)));let last='';for(let i=1;i<=steps;i++){const t=i/steps,c=zipCellFromPoint(x1+(x2-x1)*t,y1+(y2-y1)*t);if(!c)continue;const key=c.x+','+c.y;if(key===last)continue;last=key;zipTryCell(c.x,c.y)}}
const zipStage=$('zipStage');zipStage.addEventListener('pointerdown',e=>{const c=zipCellFromPoint(e.clientX,e.clientY);if(!c)return;e.preventDefault();zipDrag={id:e.pointerId,x:e.clientX,y:e.clientY};try{zipStage.setPointerCapture(e.pointerId)}catch{};zipTryCell(c.x,c.y)});zipStage.addEventListener('pointermove',e=>{if(!zipDrag||zipDrag.id!==e.pointerId)return;e.preventDefault();zipProcessDrag(zipDrag.x,zipDrag.y,e.clientX,e.clientY);zipDrag.x=e.clientX;zipDrag.y=e.clientY});"""
if old not in s:
    raise SystemExit('zip drag anchor not found')
s=s.replace(old,new,1)
p.write_text(s)
print('patched zip coordinate drag')
