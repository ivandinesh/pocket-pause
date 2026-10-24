from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Words: content-height answers with flexible spacer */'
if marker in s:
    raise SystemExit('already patched')
css='''\n/* Words: content-height answers with flexible spacer */\n#wordsPage .word-targets{flex:0 0 auto;min-height:0;align-content:start;align-items:start;justify-content:center;overflow:visible;margin:6px 0 4px;padding:0;grid-template-columns:repeat(2,max-content);grid-auto-rows:max-content}\n#wordsPage .word-status{margin-top:auto;flex:0 0 auto}\n#wordsPage .word-selection-row{flex:0 0 auto}\n#wordsPage .word-wheel-wrap{flex:0 0 auto;margin:0 auto}\n@media(max-height:760px) and (orientation:portrait){#wordsPage .word-targets{margin:3px 0 2px;--tile:clamp(28px,4dvh,36px);gap:5px 9px}}\n'''
needle='\n/* Snake-only true full-screen playfield */'
if needle not in s:
    raise SystemExit('insertion point not found')
s=s.replace(needle,css+needle,1)
p.write_text(s)
print('Words answers compact at top; spacer sits between answers and controls')
