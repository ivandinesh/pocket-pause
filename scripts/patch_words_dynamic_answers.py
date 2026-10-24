from pathlib import Path
p=Path('index.html')
s=p.read_text()

def once(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'{label} not found')
    s=s.replace(old,new,1)

old="""#wordsPage .word-targets{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,1.2dvh,14px);margin:0;padding:8px 0;--tile:clamp(40px,6.3dvh,58px)}
#wordsPage .word-target{gap:clamp(7px,1vw,10px)}
#wordsPage .word-status{flex:0 0 auto;display:flex;flex-direction:row;justify-content:center;gap:14px;padding:2px 8px;background:rgba(255,255,255,.84);min-height:24px}
#wordsPage .word-selection-row{flex:0 0 auto;min-height:42px;margin:0}
#wordsPage .word-wheel-wrap{flex:0 0 auto;--wheel:min(360px,38dvh,calc(100vw - 76px));height:var(--wheel);margin:2px auto 0}
"""
new="""#wordsPage .word-targets{flex:0 0 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:clamp(7px,1dvh,12px);margin:clamp(10px,2.2dvh,22px) 0 clamp(8px,1.4dvh,14px);padding:0;--tile:clamp(40px,5.8dvh,56px)}
#wordsPage .word-target{gap:clamp(7px,1vw,10px)}
#wordsPage .word-status{flex:0 0 auto;display:flex;flex-direction:row;justify-content:center;gap:14px;padding:2px 8px;background:rgba(255,255,255,.84);min-height:24px;margin-top:auto}
#wordsPage .word-selection-row{flex:0 0 auto;min-height:42px;margin:0}
#wordsPage .word-wheel-wrap{flex:0 0 auto;--wheel:min(370px,39dvh,calc(100vw - 68px));height:var(--wheel);margin:0 auto 2px}
"""
once(old,new,'main Words answer layout')

old2="""@media(max-width:760px){#wordsPage{height:100dvh;padding:max(7px,env(safe-area-inset-top)) 12px max(5px,env(safe-area-inset-bottom))}#wordsPage .game-heading h1{font-size:25px}#wordsPage .word-targets{--tile:clamp(38px,5.8dvh,54px)}#wordsPage .word-wheel-wrap{--wheel:min(350px,37dvh,calc(100vw - 68px))}#wordsPage .word-head-stats{gap:9px}#wordsPage .word-head-stats span{min-width:42px}}
@media(max-height:700px) and (orientation:portrait){#wordsPage .word-targets{--tile:clamp(30px,4.8dvh,40px);gap:5px;padding:3px 0}#wordsPage .word-wheel-wrap{--wheel:min(280px,31dvh,calc(100vw - 78px))}#wordsPage .word-selection-row{min-height:34px}#wordsPage .word-status{min-height:20px;font-size:9px}#wordsPage .word-gesture-hint{display:none}}
"""
new2="""@media(max-width:760px){#wordsPage{height:100dvh;padding:max(7px,env(safe-area-inset-top)) 12px max(5px,env(safe-area-inset-bottom))}#wordsPage .game-heading h1{font-size:25px}#wordsPage .word-targets{--tile:clamp(38px,5.4dvh,52px);margin:clamp(8px,1.8dvh,18px) 0 clamp(7px,1.2dvh,12px)}#wordsPage .word-wheel-wrap{--wheel:min(365px,39dvh,calc(100vw - 60px))}#wordsPage .word-head-stats{gap:9px}#wordsPage .word-head-stats span{min-width:42px}}
@media(max-height:700px) and (orientation:portrait){#wordsPage .word-targets{--tile:clamp(30px,4.5dvh,39px);gap:5px;margin:5px 0 6px;padding:0}#wordsPage .word-wheel-wrap{--wheel:min(300px,33dvh,calc(100vw - 72px))}#wordsPage .word-selection-row{min-height:34px}#wordsPage .word-status{min-height:20px;font-size:9px}#wordsPage .word-gesture-hint{display:none}}
"""
once(old2,new2,'mobile Words layout')

# Expose target count as a CSS variable so future levels with different answer counts can scale gracefully.
old3="""$('wordTargets').innerHTML=wordGame.level.targets.map(w=>`<div class=\"word-target ${wordGame.found.includes(w)?'found':''}\" aria-label=\"${wordGame.found.includes(w)?w:w.length+' letter word'}\">${[...w].map((c,i)=>`<span class=\"word-dot-tile ${!wordGame.found.includes(w)&&i<(wordGame.revealed[w]||0)?'revealed':''}\" aria-hidden=\"true\">${wordGame.found.includes(w)||i<(wordGame.revealed[w]||0)?c:''}</span>`).join('')}</div>`).join('');
"""
new3="""$('wordTargets').style.setProperty('--target-count',wordGame.level.targets.length);$('wordTargets').innerHTML=wordGame.level.targets.map(w=>`<div class=\"word-target ${wordGame.found.includes(w)?'found':''}\" aria-label=\"${wordGame.found.includes(w)?w:w.length+' letter word'}\">${[...w].map((c,i)=>`<span class=\"word-dot-tile ${!wordGame.found.includes(w)&&i<(wordGame.revealed[w]||0)?'revealed':''}\" aria-hidden=\"true\">${wordGame.found.includes(w)||i<(wordGame.revealed[w]||0)?c:''}</span>`).join('')}</div>`).join('');
"""
once(old3,new3,'target rendering')

p.write_text(s)
print('Dynamic Words answer spacing applied')
