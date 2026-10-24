from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Words: one-column target list with bottom-pinned wheel */'
if marker in s:
    raise SystemExit('already patched')
css='''\n/* Words: one-column target list with bottom-pinned wheel */\n#wordsPage .word-targets{display:grid!important;grid-template-columns:1fr!important;grid-auto-rows:max-content!important;justify-items:center!important;align-content:start!important;align-items:start!important;flex:0 1 auto!important;width:100%;overflow-y:auto;overflow-x:visible;margin:6px 0 4px!important;padding:0 0 4px!important;gap:clamp(6px,.9dvh,10px)!important;scrollbar-width:none}\n#wordsPage .word-targets::-webkit-scrollbar{display:none}\n#wordsPage .word-target{width:max-content;max-width:100%;justify-content:center}\n#wordsPage .word-status{margin-top:auto!important;flex:0 0 auto}\n#wordsPage .word-selection-row{flex:0 0 auto}\n#wordsPage .word-wheel-wrap{flex:0 0 auto;margin:0 auto!important}\n@media(max-height:760px) and (orientation:portrait){#wordsPage .word-targets{gap:5px!important;--tile:clamp(27px,3.8dvh,34px)}}\n'''
needle='\n/* Snake-only true full-screen playfield */'
if needle not in s:
    raise SystemExit('insertion point not found')
s=s.replace(needle,css+needle,1)
p.write_text(s)
print('Words target list forced to one column; wheel remains bottom-pinned')
