from pathlib import Path
p=Path('index.html')
s=p.read_text()

old='''          <div class="tetris-next-panel"><span>NEXT</span><div id="tetrisNext" class="tetris-next-stack"></div></div>
          <div class="tetris-side-stats"><span>LEVEL <b id="tetrisLevel">1</b></span><span>LINES <b id="tetrisLines">0</b></span></div>'''
new='''          <div class="tetris-next-panel"><span>NEXT</span><div id="tetrisNext" class="tetris-next-stack"></div></div>
          <div class="tetris-appearance" aria-label="Tetris appearance">
            <div class="tetris-palette" aria-label="Tetris color">
              <button class="tetris-color" data-tetris-color="blue" style="--swatch:#4f78ec" aria-label="Blue" aria-pressed="true"></button>
              <button class="tetris-color" data-tetris-color="green" style="--swatch:#3e9b70" aria-label="Green" aria-pressed="false"></button>
              <button class="tetris-color" data-tetris-color="amber" style="--swatch:#d8942f" aria-label="Amber" aria-pressed="false"></button>
              <button class="tetris-color" data-tetris-color="graphite" style="--swatch:#596171" aria-label="Graphite" aria-pressed="false"></button>
            </div>
            <div class="tetris-shapes" aria-label="Tetris block shape">
              <button class="tetris-shape" data-tetris-shape="round" aria-pressed="true" aria-label="Round blocks">●</button>
              <button class="tetris-shape" data-tetris-shape="square" aria-pressed="false" aria-label="Square blocks">■</button>
            </div>
          </div>
          <div class="tetris-side-stats"><span>LEVEL <b id="tetrisLevel">1</b></span><span>LINES <b id="tetrisLines">0</b></span></div>'''
if old not in s: raise SystemExit('tetris next/stats block not found')
s=s.replace(old,new,1)

css='''

/* Tetris appearance controls */
#tetrisPage .tetris-appearance{display:flex;flex-direction:column;gap:7px}
#tetrisPage .tetris-palette{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:0 2px}
#tetrisPage .tetris-color{width:100%;aspect-ratio:1;border:1px solid #e1e8f6;border-radius:50%;background:#fff;display:grid;place-items:center;padding:0;cursor:pointer}
#tetrisPage .tetris-color::after{content:"";width:54%;height:54%;border-radius:50%;background:var(--swatch)}
#tetrisPage .tetris-color[aria-pressed="true"]{border-color:#9fb5ed;box-shadow:0 0 0 2px #edf2ff}
#tetrisPage .tetris-shapes{display:grid;grid-template-columns:repeat(2,1fr);gap:5px}
#tetrisPage .tetris-shape{height:31px;border:1px solid #e1e8f6;border-radius:10px;background:#fff;color:#71809d;font-size:14px;cursor:pointer}
#tetrisPage .tetris-shape[aria-pressed="true"]{background:#edf3ff;border-color:#ccdaf8;color:#3568ee}
@media(max-width:420px){#tetrisPage .tetris-appearance{gap:5px}#tetrisPage .tetris-palette{gap:4px}#tetrisPage .tetris-shape{height:28px;font-size:13px}}
'''
s=s.replace('</style>',css+'\n</style>',1)

old_js="""const colors={I:'#6e91f4',O:'#8aa4f5',T:'#4b75eb',S:'#7394ed',Z:'#557fed',J:'#3568ee',L:'#91a9f3'};
function resizeTetris(){const r=tc.parentElement.getBoundingClientRect();if(r.width<1)return;tW=r.width;tH=r.height;tDpr=Math.min(2,devicePixelRatio||1);tc.width=tW*tDpr;tc.height=tH*tDpr;tctx.setTransform(tDpr,0,0,tDpr,0,0)}
function tGeom(){const cell=Math.min((tH-20)/20,(tW-20)/10,31),w=cell*10,h=cell*20;return{cell,x:(tW-w)/2,y:(tH-h)/2,w,h}}
function drawMatrix(m,x,y,cell,color,alpha=1){m.forEach((r,dy)=>r.forEach((v,dx)=>{if(v){tctx.globalAlpha=alpha;dot(tctx,x+(dx+.5)*cell,y+(dy+.5)*cell,cell*.32,color);tctx.globalAlpha=1}}))}
function renderTetrisNext(){const el=$('tetrisNext');if(!el)return;el.innerHTML=tetris.queue.slice(0,3).map(type=>{const m=SHAPES[type],rows=m.length,cols=m[0].length,cells=m.flat().map(v=>`<i class=\"${v?'':'off'}\"></i>`).join('');return `<div class=\"next-piece\" style=\"--c:${cols};--r:${rows}\" aria-label=\"${type} piece\">${cells}</div>`}).join('')}
function drawTetris(){if(!tW)return;const g=tGeom();tctx.clearRect(0,0,tW,tH);for(let y=0;y<20;y++)for(let x=0;x<10;x++)dot(tctx,g.x+(x+.5)*g.cell,g.y+(y+.5)*g.cell,Math.max(1,g.cell*.05),'#e4eaf8');tetris.board.forEach((r,y)=>r.forEach((v,x)=>{if(v)dot(tctx,g.x+(x+.5)*g.cell,g.y+(y+.5)*g.cell,g.cell*.32,colors[v])}));if(tetris.p){const ghost=tetris.ghost();drawMatrix(tetris.p.m,g.x+tetris.p.x*g.cell,g.y+ghost*g.cell,g.cell,'#b8c7ed',.45);drawMatrix(tetris.p.m,g.x+tetris.p.x*g.cell,g.y+tetris.p.y*g.cell,g.cell,colors[tetris.p.type])}$('tetrisScore').textContent=tetris.score;$('tetrisLevel').textContent=tetris.level;$('tetrisLines').textContent=tetris.lines;renderTetrisNext();if(tetris.status==='over'){const ov=$('tetrisOverlay');ov.hidden=false;$('tetrisOverlayTitle').textContent='One more?';$('tetrisStart').textContent='Play again'}}"""

new_js="""const colors={I:'#6e91f4',O:'#8aa4f5',T:'#4b75eb',S:'#7394ed',Z:'#557fed',J:'#3568ee',L:'#91a9f3'};
const TETRIS_COLORS={blue:'#4f78ec',green:'#3e9b70',amber:'#d8942f',graphite:'#596171'};
let tetrisColor=storage.get('tetris.color','blue'),tetrisShape=storage.get('tetris.shape','round');
if(!TETRIS_COLORS[tetrisColor])tetrisColor='blue';if(!['round','square'].includes(tetrisShape))tetrisShape='round';
function setTetrisColor(name){if(!TETRIS_COLORS[name])return;tetrisColor=name;storage.set('tetris.color',name);document.querySelectorAll('[data-tetris-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tetrisColor===name)));drawTetris()}
function setTetrisShape(name){if(!['round','square'].includes(name))return;tetrisShape=name;storage.set('tetris.shape',name);document.querySelectorAll('[data-tetris-shape]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tetrisShape===name)));drawTetris()}
function tetrisMark(ctx,x,y,r,color,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;if(tetrisShape==='square')ctx.fillRect(x-r,y-r,r*2,r*2);else{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}ctx.restore()}
document.querySelectorAll('[data-tetris-color]').forEach(b=>b.addEventListener('click',()=>setTetrisColor(b.dataset.tetrisColor)));document.querySelectorAll('[data-tetris-shape]').forEach(b=>b.addEventListener('click',()=>setTetrisShape(b.dataset.tetrisShape)));setTetrisColor(tetrisColor);setTetrisShape(tetrisShape);
function resizeTetris(){const r=tc.parentElement.getBoundingClientRect();if(r.width<1)return;tW=r.width;tH=r.height;tDpr=Math.min(2,devicePixelRatio||1);tc.width=tW*tDpr;tc.height=tH*tDpr;tctx.setTransform(tDpr,0,0,tDpr,0,0)}
function tGeom(){const cell=Math.min((tH-20)/20,(tW-20)/10,31),w=cell*10,h=cell*20;return{cell,x:(tW-w)/2,y:(tH-h)/2,w,h}}
function drawMatrix(m,x,y,cell,color,alpha=1){m.forEach((r,dy)=>r.forEach((v,dx)=>{if(v)tetrisMark(tctx,x+(dx+.5)*cell,y+(dy+.5)*cell,cell*.32,color,alpha)}))}
function renderTetrisNext(){const el=$('tetrisNext');if(!el)return;el.style.setProperty('--tetris-color',TETRIS_COLORS[tetrisColor]);el.classList.toggle('square',tetrisShape==='square');el.innerHTML=tetris.queue.slice(0,3).map(type=>{const m=SHAPES[type],rows=m.length,cols=m[0].length,cells=m.flat().map(v=>`<i class=\"${v?'':'off'}\"></i>`).join('');return `<div class=\"next-piece\" style=\"--c:${cols};--r:${rows}\" aria-label=\"${type} piece\">${cells}</div>`}).join('')}
function drawTetris(){if(!tW)return;const g=tGeom(),c=TETRIS_COLORS[tetrisColor];tctx.clearRect(0,0,tW,tH);for(let y=0;y<20;y++)for(let x=0;x<10;x++)dot(tctx,g.x+(x+.5)*g.cell,g.y+(y+.5)*g.cell,Math.max(1,g.cell*.05),'#e4eaf8');tetris.board.forEach((r,y)=>r.forEach((v,x)=>{if(v)tetrisMark(tctx,g.x+(x+.5)*g.cell,g.y+(y+.5)*g.cell,g.cell*.32,c)}));if(tetris.p){const ghost=tetris.ghost();drawMatrix(tetris.p.m,g.x+tetris.p.x*g.cell,g.y+ghost*g.cell,g.cell,c,.28);drawMatrix(tetris.p.m,g.x+tetris.p.x*g.cell,g.y+tetris.p.y*g.cell,g.cell,c)}$('tetrisScore').textContent=tetris.score;$('tetrisLevel').textContent=tetris.level;$('tetrisLines').textContent=tetris.lines;renderTetrisNext();if(tetris.status==='over'){const ov=$('tetrisOverlay');ov.hidden=false;$('tetrisOverlayTitle').textContent='One more?';$('tetrisStart').textContent='Play again'}}"""
if old_js not in s: raise SystemExit('tetris render block not found')
s=s.replace(old_js,new_js,1)

s=s.replace("#tetrisPage .next-piece i{display:block;width:10px;height:10px;border-radius:50%;background:#6f91f4}","#tetrisPage .next-piece i{display:block;width:10px;height:10px;border-radius:50%;background:var(--tetris-color,#4f78ec)}#tetrisPage .tetris-next-stack.square .next-piece i{border-radius:0}",1)

p.write_text(s)
print('patched tetris appearance controls')
