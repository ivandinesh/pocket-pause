from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Words: keep wheel anchored at bottom; only answer area adapts */'
if marker in s:
    raise SystemExit('already patched')
css='''\n/* Words: keep wheel anchored at bottom; only answer area adapts */\n#wordsPage.active{display:flex;flex-direction:column}\n#wordsPage .word-targets{flex:1 1 auto;min-height:0;align-content:start;align-items:start;justify-content:center;overflow:hidden;margin:clamp(10px,1.5dvh,16px) 0 6px;padding-top:clamp(4px,.8dvh,10px);grid-template-columns:repeat(2,max-content);grid-auto-rows:max-content}\n#wordsPage .word-target{align-self:start}\n#wordsPage .word-status{flex:0 0 auto;margin:0}\n#wordsPage .word-selection-row{flex:0 0 auto;margin:0}\n#wordsPage .word-wheel-wrap{flex:0 0 auto;margin:0 auto 0;--wheel:min(380px,40dvh,calc(100vw - 58px))}\n#wordsPage .word-gesture-hint{flex:0 0 auto;margin:2px 0 0}\n@media(max-width:760px){#wordsPage .word-targets{margin:6px 0 4px;padding-top:2px;gap:clamp(7px,.9dvh,11px) clamp(10px,2vw,18px);--tile:clamp(34px,4.6dvh,44px)}#wordsPage .word-wheel-wrap{--wheel:min(375px,40dvh,calc(100vw - 52px))}}\n@media(max-height:760px) and (orientation:portrait){#wordsPage .word-targets{--tile:clamp(28px,4dvh,36px);gap:5px 9px;margin:3px 0}#wordsPage .word-wheel-wrap{--wheel:min(330px,36dvh,calc(100vw - 58px))}}\n'''
needle='\n/* Snake-only true full-screen playfield */'
if needle not in s:
    raise SystemExit('insertion point not found')
s=s.replace(needle,css+needle,1)
p.write_text(s)
print('Words wheel anchored to bottom; answers remain adaptive')
