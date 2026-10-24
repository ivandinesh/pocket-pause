from pathlib import Path

p=Path('index.html')
s=p.read_text()
if 'id="wordSearchPage"' in s:
    raise SystemExit('new games already patched')

s=s.replace('Pocket Pause — four quiet little games. Words, Sudoku, Snake and Tetris. No ads, no login, completely free.','Pocket Pause — seven quiet little games. Words, Sudoku, Snake, Tetris, Word Search, Zip Line and Fidget. No ads, no login, completely free.')
s=s.replace('No ads. No login. No purchases. Just four simple games.','No ads. No login. No purchases. Just seven simple games.')

home_anchor='''        <button class="game-card" data-open="tetris">\n          <span class="mini-art tetris-art" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>\n          <span class="card-copy"><b>Tetris</b><small>Drop dots. Clear rows.</small></span><span class="arrow">→</span>\n        </button>'''
new_cards='''
        <button class="game-card" data-open="wordSearch">
          <span class="mini-art search-art" aria-hidden="true"><i>W</i><i>O</i><i>R</i><i>D</i><i>S</i><i>E</i><i>E</i><i>K</i><i>Q</i></span>
          <span class="card-copy"><b>Word Search</b><small>Find hidden words in every direction</small></span><span class="arrow">→</span>
        </button>
        <button class="game-card" data-open="zipLine">
          <span class="mini-art zip-art" aria-hidden="true"><i>1</i><i>2</i><i>3</i><i>4</i></span>
          <span class="card-copy"><b>Zip Line</b><small>Connect the numbers in one smooth line</small></span><span class="arrow">→</span>
        </button>
        <button class="game-card" data-open="fidget">
          <span class="mini-art fidget-art" aria-hidden="true"><i></i><i></i><i></i><b></b></span>
          <span class="card-copy"><b>Fidget</b><small>Spin, flick and unwind</small></span><span class="arrow">→</span>
        </button>'''
if home_anchor not in s:
    raise SystemExit('home anchor not found')
s=s.replace(home_anchor,home_anchor+new_cards,1)

css=r'''
/* Extra Pocket Pause games */
.search-art{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);padding:17px;gap:4px}.search-art i{display:grid;place-items:center;font-style:normal;font-size:10px;font-weight:750;color:#23314d}.search-art i:nth-child(2),.search-art i:nth-child(5),.search-art i:nth-child(8){background:#eaf0ff;border-radius:8px;color:#3568ee}.zip-art i{position:absolute;width:25px;height:25px;border-radius:50%;background:#fff;border:1px solid #d8e2f6;display:grid;place-items:center;font-size:10px;font-style:normal;font-weight:750;color:#3568ee}.zip-art:after{content:"";position:absolute;left:28px;top:35px;width:55px;height:35px;border-left:3px solid #a9bdf4;border-bottom:3px solid #a9bdf4;transform:skewX(-24deg);opacity:.8}.zip-art i:nth-child(1){left:17px;top:19px}.zip-art i:nth-child(2){right:18px;top:29px}.zip-art i:nth-child(3){left:32px;bottom:16px}.zip-art i:nth-child(4){right:17px;bottom:17px}.fidget-art i{position:absolute;width:32px;height:32px;border-radius:50%;background:#dce6ff}.fidget-art i:nth-child(1){left:40px;top:12px}.fidget-art i:nth-child(2){left:17px;bottom:20px}.fidget-art i:nth-child(3){right:17px;bottom:20px}.fidget-art b{position:absolute;width:26px;height:26px;border-radius:50%;background:#3568ee;left:43px;top:43px;box-shadow:0 0 0 7px #fff}
body:has(#wordSearchPage.active) .topbar,body:has(#zipLinePage.active) .topbar,body:has(#fidgetPage.active) .topbar{display:none}body:has(#wordSearchPage.active) #app,body:has(#zipLinePage.active) #app,body:has(#fidgetPage.active) #app{min-height:100dvh}
#wordSearchPage,#zipLinePage,#fidgetPage{height:100dvh;min-height:0;max-width:none;padding:max(9px,env(safe-area-inset-top)) 12px max(8px,env(safe-area-inset-bottom));overflow:hidden;background:#fff radial-gradient(circle,#dce5f8 1px,transparent 1.35px);background-size:28px 28px}
#wordSearchPage.active,#zipLinePage.active,#fidgetPage.active{display:flex;flex-direction:column;gap:7px}.extra-heading{flex:0 0 auto;margin:0;padding:2px 0 5px;grid-template-columns:44px minmax(0,1fr) auto}.extra-heading h1{font-size:25px;font-weight:560}.extra-heading .eyebrow{font-size:9px;margin:0 0 3px}.extra-heading .back-button{border:0;box-shadow:none;background:#ffffffd9;color:#8495b7}
.search-meta{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#8794ad;padding:0 3px}.search-board{position:relative;flex:1 1 auto;min-height:0;width:min(100%,720px);margin:0 auto;display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(10,1fr);background:#ffffffd9;border:1px solid #e1e8f7;border-radius:24px;padding:8px;touch-action:none;user-select:none}.search-cell{position:relative;display:grid;place-items:center;font-size:clamp(16px,4.7vw,28px);font-weight:650;color:#202b40;z-index:2}.search-cell.active,.search-cell.found{color:#17346f}.search-cell.active:before,.search-cell.found:before{content:"";position:absolute;inset:12%;border-radius:999px;background:#dce6ff;z-index:-1}.search-cell.found:before{background:#c9d8ff}.search-words{flex:0 0 auto;display:flex;gap:7px;overflow-x:auto;padding:2px 0 3px;scrollbar-width:none}.search-words::-webkit-scrollbar{display:none}.search-word{white-space:nowrap;border:1px solid #e3eaf8;background:#fff;border-radius:999px;padding:8px 12px;font-size:11px;color:#65748f}.search-word.found{text-decoration:line-through;color:#9aa7bc;background:#f5f7fc}.search-actions{display:flex;justify-content:center}.search-actions button{min-width:130px}
.zip-stage{position:relative;flex:1 1 auto;min-height:0;width:min(100%,680px);margin:0 auto;border:1px solid #e1e8f7;border-radius:26px;background:#ffffffd9;touch-action:none;overflow:hidden}.zip-stage svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.zip-path{fill:none;stroke:#7e9df1;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;opacity:.9}.zip-live{fill:none;stroke:#b6c7f5;stroke-width:5;stroke-linecap:round}.zip-node{position:absolute;width:48px;height:48px;transform:translate(-50%,-50%);border-radius:50%;border:1.5px solid #d6e1f6;background:#fff;display:grid;place-items:center;font-weight:750;color:#5d6e8c;z-index:2;box-shadow:0 6px 18px rgba(50,76,124,.05)}.zip-node.done{background:#3568ee;color:#fff;border-color:#3568ee}.zip-node.next{box-shadow:0 0 0 5px #eaf0ff;color:#3568ee}.zip-footer{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;gap:10px}.zip-footer span{font-size:12px;color:#7e8ba4}.zip-footer button{padding:10px 16px}
.fidget-toolbar{flex:0 0 auto;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.fidget-types,.fidget-colors{display:flex;align-items:center;gap:6px;border:1px solid #e4eaf7;background:#ffffffde;border-radius:999px;padding:5px}.fidget-types button{border:0;background:transparent;border-radius:999px;padding:8px 10px;font-size:11px;color:#6f7d97}.fidget-types button[aria-pressed="true"]{background:#eef3ff;color:#3568ee}.fidget-color{width:27px;height:27px;border-radius:50%;border:3px solid #fff;background:var(--swatch);box-shadow:0 0 0 1px #dfe6f5}.fidget-color[aria-pressed="true"]{box-shadow:0 0 0 2px #3568ee}.fidget-stage{flex:1 1 auto;min-height:0;position:relative;width:min(100%,700px);margin:0 auto;border:1px solid #e1e8f7;border-radius:28px;background:#ffffffc9;overflow:hidden}.fidget-stage canvas{width:100%;height:100%;display:block;touch-action:none}.fidget-caption{position:absolute;left:0;right:0;bottom:18px;text-align:center;color:#97a4b9;font-size:11px;pointer-events:none}
@media(max-height:700px){#wordSearchPage,#zipLinePage,#fidgetPage{gap:4px}.search-board{border-radius:18px;padding:5px}.search-cell{font-size:clamp(14px,4vw,20px)}.search-word{padding:6px 9px}.zip-node{width:42px;height:42px}.fidget-toolbar{gap:4px}.fidget-types button{padding:6px 8px}}
'''
s=s.replace('\n</style>','\n'+css+'\n</style>',1)

pages=r'''

    <section id="wordSearchPage" class="page game-page" aria-label="Word Search game">
      <div class="game-heading extra-heading"><button class="back-button" data-home>←</button><div><p class="eyebrow">WORD SEARCH</p><h1>Find the quiet words.</h1></div><div class="heading-stat"><b id="searchFound">0/6</b><span>found</span></div></div>
      <div class="search-meta"><span>Drag across a word</span><span id="searchLevel">Puzzle 1</span></div>
      <div id="searchBoard" class="search-board" aria-label="Word search grid"></div>
      <div id="searchWords" class="search-words" aria-label="Words to find"></div>
      <div class="search-actions"><button id="searchNew" class="soft-button">New puzzle</button></div>
    </section>

    <section id="zipLinePage" class="page game-page" aria-label="Zip Line number connect game">
      <div class="game-heading extra-heading"><button class="back-button" data-home>←</button><div><p class="eyebrow">ZIP LINE</p><h1>One line. In order.</h1></div><div class="heading-stat"><b id="zipLevel">1</b><span>level</span></div></div>
      <div id="zipStage" class="zip-stage"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline id="zipPath" class="zip-path" points=""></polyline><line id="zipLive" class="zip-live" x1="0" y1="0" x2="0" y2="0" hidden></line></svg></div>
      <div class="zip-footer"><span id="zipMessage">Start at 1 and keep your finger down.</span><button id="zipReset" class="soft-button">Reset</button></div>
    </section>

    <section id="fidgetPage" class="page game-page" aria-label="Fidget spinners">
      <div class="game-heading extra-heading"><button class="back-button" data-home>←</button><div><p class="eyebrow">FIDGET</p><h1>Spin it out.</h1></div><div class="heading-stat"><b id="fidgetSpeed">0</b><span>spin</span></div></div>
      <div class="fidget-toolbar"><div class="fidget-colors" aria-label="Fidget color"><button class="fidget-color" data-fidget-color="blue" style="--swatch:#4f78ec" aria-label="Blue" aria-pressed="true"></button><button class="fidget-color" data-fidget-color="green" style="--swatch:#3e9b70" aria-label="Green" aria-pressed="false"></button><button class="fidget-color" data-fidget-color="amber" style="--swatch:#d8942f" aria-label="Amber" aria-pressed="false"></button><button class="fidget-color" data-fidget-color="pink" style="--swatch:#d970a9" aria-label="Pink" aria-pressed="false"></button><button class="fidget-color" data-fidget-color="graphite" style="--swatch:#596171" aria-label="Graphite" aria-pressed="false"></button></div><div class="fidget-types" aria-label="Fidget style"><button data-fidget-type="tri" aria-pressed="true">Tri</button><button data-fidget-type="bar" aria-pressed="false">Bar</button><button data-fidget-type="ring" aria-pressed="false">Ring</button><button data-fidget-type="gear" aria-pressed="false">Gear</button></div></div>
      <div class="fidget-stage"><canvas id="fidgetCanvas"></canvas><div class="fidget-caption">Flick or drag with one finger</div></div>
    </section>
'''
s=s.replace('  </main>',pages+'\n  </main>',1)

old_show="function showPage(name){currentPage=name;document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===name+'Page'));$('pointsChip').hidden=name!=='words';if(name==='words')renderWords();if(name==='sudoku')renderSudoku();if(name==='snake')resizeSnake();if(name==='tetris')resizeTetris();window.scrollTo(0,0)}"
new_show="function showPage(name){currentPage=name;document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===name+'Page'));$('pointsChip').hidden=name!=='words';if(name==='words')renderWords();if(name==='sudoku')renderSudoku();if(name==='snake')resizeSnake();if(name==='tetris')resizeTetris();if(name==='wordSearch')renderSearch();if(name==='zipLine')renderZip();if(name==='fidget')resizeFidget();window.scrollTo(0,0)}"
if old_show not in s:
    raise SystemExit('showPage anchor not found')
s=s.replace(old_show,new_show,1)

js=r'''
// WORD SEARCH
const SEARCH_WORD_SETS=[];
let searchPuzzle=0,searchGrid=[],searchPlaced=[],searchFoundSet=new Set(),searchDrag=null;
function makeSearch(){const words=SEARCH_WORD_SETS[searchPuzzle%SEARCH_WORD_SETS.length],N=10,dirs=[[1,0],[0,1],[1,1],[-1,1],[-1,0],[0,-1],[-1,-1],[1,-1]],rng=mulberry32(3907+searchPuzzle*97);let grid=Array.from({length:N},()=>Array(N).fill('')),placed=[];for(const word of words){let ok=false;for(let t=0;t<300&&!ok;t++){const [dx,dy]=dirs[Math.floor(rng()*dirs.length)],x=Math.floor(rng()*N),y=Math.floor(rng()*N),ex=x+dx*(word.length-1),ey=y+dy*(word.length-1);if(ex<0||ex>=N||ey<0||ey>=N)continue;let cells=[],valid=true;for(let i=0;i<word.length;i++){const xx=x+dx*i,yy=y+dy*i;if(grid[yy][xx]&&grid[yy][xx]!==word[i]){valid=false;break}cells.push([xx,yy])}if(!valid)continue;cells.forEach(([xx,yy],i)=>grid[yy][xx]=word[i]);placed.push({word,cells});ok=true}}const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!grid[y][x])grid[y][x]=letters[Math.floor(rng()*letters.length)];searchGrid=grid;searchPlaced=placed;searchFoundSet=new Set()}
function renderSearch(){if(!searchGrid.length)makeSearch();const board=$('searchBoard');board.innerHTML=searchGrid.flatMap((row,y)=>row.map((ch,x)=>`<div class="search-cell ${isSearchFound(x,y)?'found':''}" data-x="${x}" data-y="${y}">${ch}</div>`)).join('');$('searchWords').innerHTML=searchPlaced.map(p=>`<span class="search-word ${searchFoundSet.has(p.word)?'found':''}">${p.word}</span>`).join('');$('searchFound').textContent=searchFoundSet.size+'/'+searchPlaced.length;$('searchLevel').textContent='Puzzle '+(searchPuzzle+1);bindSearchCells()}
function isSearchFound(x,y){return searchPlaced.some(p=>searchFoundSet.has(p.word)&&p.cells.some(c=>c[0]===x&&c[1]===y))}
function searchLineCells(a,b){const dx=b.x-a.x,dy=b.y-a.y,sx=Math.sign(dx),sy=Math.sign(dy);if(!(dx===0||dy===0||Math.abs(dx)===Math.abs(dy)))return[];const n=Math.max(Math.abs(dx),Math.abs(dy));return Array.from({length:n+1},(_,i)=>[a.x+sx*i,a.y+sy*i])}
function paintSearchDrag(cells){document.querySelectorAll('.search-cell.active').forEach(e=>e.classList.remove('active'));cells.forEach(([x,y])=>document.querySelector(`.search-cell[data-x="${x}"][data-y="${y}"]`)?.classList.add('active'))}
function finishSearch(cells){const word=cells.map(([x,y])=>searchGrid[y][x]).join(''),rev=[...word].reverse().join(''),hit=searchPlaced.find(p=>!searchFoundSet.has(p.word)&&(p.word===word||p.word===rev));document.querySelectorAll('.search-cell.active').forEach(e=>e.classList.remove('active'));if(hit){searchFoundSet.add(hit.word);beep(650);renderSearch();if(searchFoundSet.size===searchPlaced.length){toast('All words found');setTimeout(()=>{searchPuzzle++;makeSearch();renderSearch()},650)}}}
function bindSearchCells(){const b=$('searchBoard');b.onpointerdown=e=>{const c=e.target.closest('.search-cell');if(!c)return;e.preventDefault();searchDrag={x:+c.dataset.x,y:+c.dataset.y,cells:[[+c.dataset.x,+c.dataset.y]],id:e.pointerId};try{b.setPointerCapture(e.pointerId)}catch{};paintSearchDrag(searchDrag.cells)};b.onpointermove=e=>{if(!searchDrag||searchDrag.id!==e.pointerId)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.search-cell');if(!el)return;const cells=searchLineCells(searchDrag,{x:+el.dataset.x,y:+el.dataset.y});if(cells.length){searchDrag.cells=cells;paintSearchDrag(cells)}};b.onpointerup=e=>{if(!searchDrag)return;finishSearch(searchDrag.cells);searchDrag=null};b.onpointercancel=()=>{searchDrag=null;paintSearchDrag([])}}
$('searchNew').addEventListener('click',()=>{searchPuzzle++;makeSearch();renderSearch();beep(430)});

// ZIP LINE
let zipLevel=1,zipNodes=[],zipDone=0,zipDrag=null;
function makeZip(){const rng=mulberry32(8301+zipLevel*131),count=Math.min(8+Math.floor(zipLevel/2),14),cols=4,rows=6,spots=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)spots.push({x:(x+.5)/cols*100,y:(y+.5)/rows*100});for(let i=spots.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[spots[i],spots[j]]=[spots[j],spots[i]]}zipNodes=spots.slice(0,count);zipDone=0;zipDrag=null}
function renderZip(){if(!zipNodes.length)makeZip();const stage=$('zipStage');stage.querySelectorAll('.zip-node').forEach(n=>n.remove());zipNodes.forEach((p,i)=>{const b=document.createElement('button');b.className='zip-node '+(i<zipDone?'done ':'')+(i===zipDone?'next':'');b.textContent=i+1;b.style.left=p.x+'%';b.style.top=p.y+'%';b.dataset.i=i;stage.appendChild(b)});drawZipPath();$('zipLevel').textContent=zipLevel;$('zipMessage').textContent=zipDone===zipNodes.length?'Complete — nice line.':'Connect '+(zipDone+1)+(zipDone?' next.':' and keep your finger down.')}
function drawZipPath(){const pts=zipNodes.slice(0,zipDone).map(p=>p.x+','+p.y).join(' ');$('zipPath').setAttribute('points',pts)}
function zipTryNode(i){if(i!==zipDone)return false;zipDone++;beep(430+zipDone*16,.035);renderZip();if(zipDone===zipNodes.length){toast('Line complete');setTimeout(()=>{zipLevel++;makeZip();renderZip()},700)}return true}
const zipStage=$('zipStage');zipStage.addEventListener('pointerdown',e=>{const n=e.target.closest('.zip-node');if(!n||+n.dataset.i!==zipDone)return;e.preventDefault();zipDrag={id:e.pointerId};try{zipStage.setPointerCapture(e.pointerId)}catch{};zipTryNode(+n.dataset.i)});zipStage.addEventListener('pointermove',e=>{if(!zipDrag||zipDrag.id!==e.pointerId||zipDone>=zipNodes.length)return;const n=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.zip-node');if(n)zipTryNode(+n.dataset.i);const r=zipStage.getBoundingClientRect(),a=zipNodes[Math.max(0,zipDone-1)];if(a){const l=$('zipLive');l.hidden=false;l.setAttribute('x1',a.x);l.setAttribute('y1',a.y);l.setAttribute('x2',(e.clientX-r.left)/r.width*100);l.setAttribute('y2',(e.clientY-r.top)/r.height*100)}});function endZip(){$('zipLive').hidden=true;zipDrag=null}zipStage.addEventListener('pointerup',endZip);zipStage.addEventListener('pointercancel',endZip);$('zipReset').addEventListener('click',()=>{zipDone=0;renderZip()});

// FIDGET
const FIDGET_COLORS={blue:'#4f78ec',green:'#3e9b70',amber:'#d8942f',pink:'#d970a9',graphite:'#596171'};let fidgetColor=storage.get('fidget.color','blue'),fidgetType=storage.get('fidget.type','tri'),fAngle=0,fVel=0,fW=0,fH=0,fDpr=1,fPointer=null,fLastT=0;const fc=$('fidgetCanvas'),fctx=fc.getContext('2d');if(!FIDGET_COLORS[fidgetColor])fidgetColor='blue';if(!['tri','bar','ring','gear'].includes(fidgetType))fidgetType='tri';
function resizeFidget(){const r=fc.parentElement.getBoundingClientRect();if(r.width<1||r.height<1)return;fW=r.width;fH=r.height;fDpr=Math.min(2,devicePixelRatio||1);fc.width=Math.round(fW*fDpr);fc.height=Math.round(fH*fDpr);fctx.setTransform(fDpr,0,0,fDpr,0,0);drawFidget()}
function fidgetMark(x,y,r,color){fctx.beginPath();fctx.arc(x,y,r,0,Math.PI*2);fctx.fillStyle=color;fctx.fill()}
function drawFidget(){if(!fW)return;const cx=fW/2,cy=fH/2,R=Math.min(fW,fH)*.26,c=FIDGET_COLORS[fidgetColor];fctx.clearRect(0,0,fW,fH);fctx.save();fctx.translate(cx,cy);fctx.rotate(fAngle);fctx.fillStyle=c;fctx.strokeStyle=c;fctx.lineWidth=Math.max(16,R*.18);fctx.lineCap='round';if(fidgetType==='tri'){for(let i=0;i<3;i++){const a=i*Math.PI*2/3,x=Math.cos(a)*R,y=Math.sin(a)*R;fctx.beginPath();fctx.moveTo(0,0);fctx.lineTo(x,y);fctx.stroke();fidgetMark(x,y,R*.25,c)}}else if(fidgetType==='bar'){fctx.beginPath();fctx.moveTo(-R,0);fctx.lineTo(R,0);fctx.stroke();fidgetMark(-R,0,R*.27,c);fidgetMark(R,0,R*.27,c)}else if(fidgetType==='ring'){fctx.lineWidth=R*.23;fctx.beginPath();fctx.arc(0,0,R*.78,0,Math.PI*2);fctx.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2;fidgetMark(Math.cos(a)*R*.78,Math.sin(a)*R*.78,R*.15,c)}}else{for(let i=0;i<8;i++){const a=i*Math.PI/4;fctx.save();fctx.rotate(a);fctx.fillRect(R*.55,-R*.13,R*.42,R*.26);fctx.restore()}fidgetMark(0,0,R*.62,c)}fidgetMark(0,0,R*.25,'#fff');fidgetMark(0,0,R*.13,c);fctx.restore();$('fidgetSpeed').textContent=Math.round(Math.abs(fVel)*10)}
function setFidgetColor(v){if(!FIDGET_COLORS[v])return;fidgetColor=v;storage.set('fidget.color',v);document.querySelectorAll('[data-fidget-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fidgetColor===v)));drawFidget()}function setFidgetType(v){if(!['tri','bar','ring','gear'].includes(v))return;fidgetType=v;storage.set('fidget.type',v);document.querySelectorAll('[data-fidget-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fidgetType===v)));drawFidget()}document.querySelectorAll('[data-fidget-color]').forEach(b=>b.addEventListener('click',()=>setFidgetColor(b.dataset.fidgetColor)));document.querySelectorAll('[data-fidget-type]').forEach(b=>b.addEventListener('click',()=>setFidgetType(b.dataset.fidgetType)));setFidgetColor(fidgetColor);setFidgetType(fidgetType);
function fAngleAt(x,y){const r=fc.getBoundingClientRect();return Math.atan2(y-(r.top+r.height/2),x-(r.left+r.width/2))}fc.addEventListener('pointerdown',e=>{e.preventDefault();const a=fAngleAt(e.clientX,e.clientY);fPointer={id:e.pointerId,a,t:performance.now()};fVel=0;try{fc.setPointerCapture(e.pointerId)}catch{}});fc.addEventListener('pointermove',e=>{if(!fPointer||fPointer.id!==e.pointerId)return;const now=performance.now(),a=fAngleAt(e.clientX,e.clientY);let d=a-fPointer.a;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;fAngle+=d;const dt=Math.max(8,now-fPointer.t);fVel=d/dt*1000;fPointer.a=a;fPointer.t=now;drawFidget()});fc.addEventListener('pointerup',()=>{fPointer=null});fc.addEventListener('pointercancel',()=>{fPointer=null});
function fidgetFrame(t){const dt=fLastT?Math.min(.05,(t-fLastT)/1000):0;fLastT=t;if(!fPointer&&Math.abs(fVel)>.002){fAngle+=fVel*dt;fVel*=Math.pow(.985,dt*60);if(Math.abs(fVel)<.002)fVel=0;if(currentPage==='fidget')drawFidget()}requestAnimationFrame(fidgetFrame)}requestAnimationFrame(fidgetFrame);
'''
anchor="document.addEventListener('keydown',e=>{"
if anchor not in s:
    raise SystemExit('JS anchor not found')
s=s.replace(anchor,js+'\n'+anchor,1)

# Make resize observer aware of the fidget canvas.
old="new ResizeObserver(()=>{if(currentPage==='snake')resizeSnake();if(currentPage==='tetris')resizeTetris()}).observe(document.body);"
new="new ResizeObserver(()=>{if(currentPage==='snake')resizeSnake();if(currentPage==='tetris')resizeTetris();if(currentPage==='fidget')resizeFidget()}).observe(document.body);"
if old not in s:
    raise SystemExit('resize anchor not found')
s=s.replace(old,new,1)

p.write_text(s)
print('Added Word Search, Zip Line and Fidget games')
