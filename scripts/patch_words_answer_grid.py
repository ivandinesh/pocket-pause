from pathlib import Path
p=Path('index.html')
s=p.read_text()
old="""#wordsPage .word-targets{flex:0 0 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:clamp(7px,1dvh,12px);margin:clamp(10px,2.2dvh,22px) 0 clamp(8px,1.4dvh,14px);padding:0;--tile:clamp(40px,5.8dvh,56px)}
#wordsPage .word-target{gap:clamp(7px,1vw,10px)}
#wordsPage .word-status{flex:0 0 auto;display:flex;flex-direction:row;justify-content:center;gap:14px;padding:2px 8px;background:rgba(255,255,255,.84);min-height:24px;margin-top:auto}
#wordsPage .word-selection-row{flex:0 0 auto;min-height:42px;margin:0}
#wordsPage .word-wheel-wrap{flex:0 0 auto;--wheel:min(370px,39dvh,calc(100vw - 68px));height:var(--wheel);margin:0 auto 2px}
"""
new="""#wordsPage .word-targets{flex:0 0 auto;min-height:0;display:grid;grid-template-columns:repeat(2,max-content);grid-auto-flow:row;align-items:center;justify-content:center;gap:clamp(10px,1.3dvh,16px) clamp(16px,3vw,28px);margin:clamp(12px,2dvh,20px) 0 clamp(10px,1.5dvh,16px);padding:0;--tile:clamp(38px,5.2dvh,50px)}
#wordsPage .word-target{gap:clamp(6px,.8vw,9px);justify-self:center}
#wordsPage .word-targets[style*='--target-count: 1'],#wordsPage .word-targets[style*='--target-count: 2']{grid-template-columns:max-content}
#wordsPage .word-status{flex:0 0 auto;display:flex;flex-direction:row;justify-content:center;gap:14px;padding:2px 8px;background:rgba(255,255,255,.84);min-height:24px;margin:0}
#wordsPage .word-selection-row{flex:0 0 auto;min-height:42px;margin:0}
#wordsPage .word-wheel-wrap{flex:0 0 auto;--wheel:min(380px,40dvh,calc(100vw - 58px));height:var(--wheel);margin:0 auto 2px}
"""
if old not in s: raise SystemExit('main block not found')
s=s.replace(old,new,1)
old2="""@media(max-width:760px){#wordsPage{height:100dvh;padding:max(7px,env(safe-area-inset-top)) 12px max(5px,env(safe-area-inset-bottom))}#wordsPage .game-heading h1{font-size:25px}#wordsPage .word-targets{--tile:clamp(38px,5.4dvh,52px);margin:clamp(8px,1.8dvh,18px) 0 clamp(7px,1.2dvh,12px)}#wordsPage .word-wheel-wrap{--wheel:min(365px,39dvh,calc(100vw - 60px))}#wordsPage .word-head-stats{gap:9px}#wordsPage .word-head-stats span{min-width:42px}}
@media(max-height:700px) and (orientation:portrait){#wordsPage .word-targets{--tile:clamp(30px,4.5dvh,39px);gap:5px;margin:5px 0 6px;padding:0}#wordsPage .word-wheel-wrap{--wheel:min(300px,33dvh,calc(100vw - 72px))}#wordsPage .word-selection-row{min-height:34px}#wordsPage .word-status{min-height:20px;font-size:9px}#wordsPage .word-gesture-hint{display:none}}
"""
new2="""@media(max-width:760px){#wordsPage{height:100dvh;padding:max(7px,env(safe-area-inset-top)) 12px max(5px,env(safe-area-inset-bottom))}#wordsPage .game-heading h1{font-size:25px}#wordsPage .word-targets{--tile:clamp(36px,4.9dvh,46px);gap:clamp(8px,1dvh,12px) clamp(12px,2.2vw,20px);margin:clamp(8px,1.4dvh,14px) 0 clamp(8px,1.1dvh,12px)}#wordsPage .word-wheel-wrap{--wheel:min(375px,40dvh,calc(100vw - 52px))}#wordsPage .word-head-stats{gap:9px}#wordsPage .word-head-stats span{min-width:42px}}
@media(max-height:700px) and (orientation:portrait){#wordsPage .word-targets{--tile:clamp(29px,4.2dvh,36px);gap:5px 10px;margin:4px 0 6px;padding:0}#wordsPage .word-wheel-wrap{--wheel:min(310px,34dvh,calc(100vw - 64px))}#wordsPage .word-selection-row{min-height:34px}#wordsPage .word-status{min-height:20px;font-size:9px}#wordsPage .word-gesture-hint{display:none}}
"""
if old2 not in s: raise SystemExit('mobile block not found')
s=s.replace(old2,new2,1)
p.write_text(s)
print('Words answer grid applied')
