from pathlib import Path
p=Path('index.html')
s=p.read_text()
old='''    <section id="tetrisPage" class="page game-page canvas-page" aria-label="Tetris game">
      <div class="game-heading canvas-heading">
        <button class="back-button" data-home>←</button>
        <div><p class="eyebrow">TETRIS</p><h1>Everything in place.</h1></div>
        <div class="heading-stat"><b id="tetrisScore">0</b><span>score</span></div>
      </div>
      <div class="canvas-shell tetris-shell"><canvas id="tetrisCanvas"></canvas><div id="tetrisOverlay" class="canvas-overlay"><h2 id="tetrisOverlayTitle">A few falling dots.</h2><p>Tap rotate. Swipe or use controls.</p><button id="tetrisStart" class="primary-button">Play</button></div></div>
      <div class="tetris-info"><span>Level <b id="tetrisLevel">1</b></span><span>Lines <b id="tetrisLines">0</b></span><span>Next <b id="tetrisNext">• • •</b></span></div>
      <div class="tetris-controls"><button data-tetris="left">←</button><button data-tetris="rotate">↻</button><button data-tetris="down">↓</button><button data-tetris="right">→</button><button data-tetris="drop">⇣</button></div>
    </section>'''
new='''    <section id="tetrisPage" class="page game-page canvas-page" aria-label="Tetris game">
      <div class="game-heading canvas-heading">
        <button class="back-button" data-home>←</button>
        <div><p class="eyebrow">TETRIS</p><h1>Everything in place.</h1></div>
        <div class="heading-stat"><b id="tetrisScore">0</b><span>score</span></div>
      </div>
      <div class="tetris-layout">
        <div class="canvas-shell tetris-shell"><canvas id="tetrisCanvas"></canvas><div id="tetrisOverlay" class="canvas-overlay"><h2 id="tetrisOverlayTitle">A few falling dots.</h2><p>Tap rotate. Swipe or use controls.</p><button id="tetrisStart" class="primary-button">Play</button></div></div>
        <aside class="tetris-side" aria-label="Tetris controls and next pieces">
          <div class="tetris-next-panel"><span>NEXT</span><div id="tetrisNext" class="tetris-next-stack"></div></div>
          <div class="tetris-side-stats"><span>LEVEL <b id="tetrisLevel">1</b></span><span>LINES <b id="tetrisLines">0</b></span></div>
          <div class="tetris-controls" aria-label="Tetris controls">
            <button data-tetris="rotate" aria-label="Rotate">↻</button>
            <button data-tetris="left" aria-label="Move left">←</button>
            <button data-tetris="right" aria-label="Move right">→</button>
            <button data-tetris="down" aria-label="Move down">↓</button>
            <button class="tetris-drop" data-tetris="drop" aria-label="Drop">⇣</button>
          </div>
        </aside>
      </div>
    </section>'''
if old not in s: raise SystemExit('tetris section not found')
s=s.replace(old,new,1)
css='''

/* Tetris: full-screen left playfield + right control rail */
body:has(#tetrisPage.active) .topbar{display:none}
body:has(#tetrisPage.active) #app{min-height:100dvh}
#tetrisPage{height:100dvh;min-height:0;max-width:none;padding:max(8px,env(safe-area-inset-top)) 10px max(8px,env(safe-area-inset-bottom));overflow:hidden;background:#fff radial-gradient(circle,#dce5f8 1px,transparent 1.35px);background-size:28px 28px}
#tetrisPage.active{display:flex;flex-direction:column;gap:7px}
#tetrisPage .game-heading{flex:0 0 auto;width:100%;margin:0;padding:2px 2px 4px;grid-template-columns:44px minmax(0,1fr) auto;gap:10px}
#tetrisPage .game-heading h1{font-size:25px;font-weight:550}
#tetrisPage .eyebrow{margin:0 0 3px;font-size:9px;font-weight:600;color:#8d9ab8}
#tetrisPage .back-button{border:0;box-shadow:none;background:#ffffffd9;color:#8495b7}
#tetrisPage .heading-stat{min-width:52px}
#tetrisPage .heading-stat b{font-size:19px;color:#3568ee;font-weight:600}
#tetrisPage .heading-stat span{font-size:9px}
#tetrisPage .tetris-layout{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) clamp(96px,25vw,132px);gap:9px;width:100%}
#tetrisPage .tetris-shell{width:100%;height:100%;min-height:0;border:1.5px solid #dfe7f7;border-radius:18px;background:#ffffffed;box-shadow:none}
#tetrisPage .tetris-side{min-height:0;display:flex;flex-direction:column;gap:10px;padding:4px 0}
#tetrisPage .tetris-next-panel{flex:0 0 auto;border:1px solid #e4eaf7;background:#ffffffdc;border-radius:18px;padding:9px 6px 8px;text-align:center}
#tetrisPage .tetris-next-panel>span{display:block;font-size:9px;letter-spacing:.14em;color:#8d9ab8;margin-bottom:6px}
#tetrisPage .tetris-next-stack{display:flex;flex-direction:column;align-items:center;gap:9px;min-height:112px}
#tetrisPage .next-piece{display:grid;grid-template-columns:repeat(var(--c),10px);grid-template-rows:repeat(var(--r),10px);gap:3px;place-content:center;min-height:27px}
#tetrisPage .next-piece i{display:block;width:10px;height:10px;border-radius:50%;background:#6f91f4}
#tetrisPage .next-piece i.off{visibility:hidden}
#tetrisPage .tetris-side-stats{display:grid;grid-template-columns:1fr;gap:5px;text-align:center;color:#8a97af}
#tetrisPage .tetris-side-stats span{font-size:8px;letter-spacing:.12em}
#tetrisPage .tetris-side-stats b{display:block;font-size:18px;letter-spacing:0;color:#26334d;margin-top:1px}
#tetrisPage .tetris-controls{margin-top:auto;width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
#tetrisPage .tetris-controls button{height:54px;min-width:0;border:1px solid #e2e9f7;background:#ffffffeb;border-radius:16px;color:#496aa9;font-size:23px;box-shadow:none;touch-action:manipulation}
#tetrisPage .tetris-controls button:active{transform:scale(.96);background:#eef3ff}
#tetrisPage .tetris-controls .tetris-drop{grid-column:1/-1;height:60px;background:#3568ee;color:#fff;border-color:#3568ee;font-size:27px}
#tetrisPage .canvas-overlay{border-radius:17px;padding:16px 10px}
#tetrisPage .canvas-overlay h2{font-size:25px}
#tetrisPage .canvas-overlay p{font-size:12px;margin-bottom:14px}
#tetrisPage .canvas-overlay .primary-button{padding:11px 18px}
@media(max-width:420px){
  #tetrisPage{padding-left:7px;padding-right:7px}
  #tetrisPage .tetris-layout{grid-template-columns:minmax(0,1fr) 98px;gap:7px}
  #tetrisPage .tetris-side{gap:7px}
  #tetrisPage .tetris-next-panel{padding:8px 4px}
  #tetrisPage .tetris-next-stack{gap:7px;min-height:100px}
  #tetrisPage .tetris-controls{gap:6px}
  #tetrisPage .tetris-controls button{height:50px;border-radius:14px}
  #tetrisPage .tetris-controls .tetris-drop{height:56px}
}
@media(max-height:700px) and (orientation:portrait){
  #tetrisPage.active{gap:4px}
  #tetrisPage .game-heading h1{font-size:21px}
  #tetrisPage .tetris-side{gap:5px;padding-top:0}
  #tetrisPage .tetris-next-stack{gap:4px;min-height:82px}
  #tetrisPage .next-piece{grid-template-columns:repeat(var(--c),8px);grid-template-rows:repeat(var(--r),8px);gap:2px}
  #tetrisPage .next-piece i{width:8px;height:8px}
  #tetrisPage .tetris-controls button{height:43px}
  #tetrisPage .tetris-controls .tetris-drop{height:48px}
}
'''
s=s.replace('</style>',css+'\n</style>',1)
oldjs="$'tetrisScore'"
# Add a compact next-piece renderer and replace old text assignment.
needle="function drawTetris(){if(!tW)return;"
insert="function renderTetrisNext(){const el=$('tetrisNext');if(!el)return;el.innerHTML=tetris.queue.slice(0,3).map(type=>{const m=SHAPES[type],rows=m.length,cols=m[0].length,cells=m.flat().map(v=>`<i class=\"${v?'':'off'}\"></i>`).join('');return `<div class=\"next-piece\" style=\"--c:${cols};--r:${rows}\" aria-label=\"${type} piece\">${cells}</div>`}).join('')}\n"
if needle not in s: raise SystemExit('drawTetris not found')
s=s.replace(needle,insert+needle,1)
old_assign="$'tetrisNext'"
old_text="$('tetrisNext').textContent=tetris.queue.slice(0,3).join(' · ');"
if old_text not in s: raise SystemExit('tetris next assignment not found')
s=s.replace(old_text,"renderTetrisNext();",1)
p.write_text(s)
print('patched tetris full-screen side rail')
