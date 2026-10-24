from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Words: tuned one-column spacing and size */'
if marker in s:
    raise SystemExit('already patched')
css='''\n/* Words: tuned one-column spacing and size */\n#wordsPage .word-targets{\n  display:grid!important;\n  grid-template-columns:1fr!important;\n  grid-auto-rows:max-content!important;\n  justify-items:center!important;\n  align-content:space-evenly!important;\n  flex:0 0 auto!important;\n  width:100%;\n  min-height:calc(var(--target-count) * 58px)!important;\n  height:clamp(220px,calc(var(--target-count) * 64px),34dvh)!important;\n  max-height:34dvh!important;\n  overflow-y:auto;\n  overflow-x:visible;\n  margin:8px 0 4px!important;\n  padding:4px 0!important;\n  gap:0!important;\n  --tile:clamp(46px,5.3dvh,54px)!important;\n  scrollbar-width:none\n}\n#wordsPage .word-targets::-webkit-scrollbar{display:none}\n#wordsPage .word-target{\n  width:max-content;\n  max-width:100%;\n  justify-content:center;\n  gap:clamp(8px,1.4vw,11px)!important\n}\n#wordsPage .word-status{margin-top:auto!important;flex:0 0 auto}\n#wordsPage .word-selection-row{flex:0 0 auto}\n#wordsPage .word-wheel-wrap{flex:0 0 auto;margin:0 auto!important}\n@media(max-height:760px) and (orientation:portrait){\n  #wordsPage .word-targets{\n    min-height:calc(var(--target-count) * 46px)!important;\n    height:clamp(180px,calc(var(--target-count) * 52px),29dvh)!important;\n    max-height:29dvh!important;\n    --tile:clamp(38px,4.7dvh,46px)!important\n  }\n}\n'''
needle='\n/* Snake-only true full-screen playfield */'
if needle not in s:
    raise SystemExit('insertion point not found')
s=s.replace(needle,css+needle,1)
p.write_text(s)
print('Words one-column spacing and tile size tuned')
