from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Sudoku: use vertical space without over-stretching */'
if marker in s:
    raise SystemExit('already patched')
css=r'''

/* Sudoku: use vertical space without over-stretching */
#sudokuPage.active{display:flex;flex-direction:column;min-height:100dvh;height:100dvh}
#sudokuPage .sudoku-board{
  flex:1 1 auto;
  width:min(620px,calc(100vw - 16px));
  height:auto;
  min-height:0;
  max-height:min(calc((100vw - 16px)*1.18),calc(100dvh - 235px));
  aspect-ratio:auto;
  grid-template-columns:repeat(9,1fr);
  grid-template-rows:repeat(9,1fr);
  margin:2px auto 0;
}
#sudokuPage .sudoku-cell{min-height:0}
#sudokuPage .sudoku-tools{margin-top:auto;margin-bottom:clamp(2px,1.2dvh,12px)}
#sudokuPage #sudokuMessage{margin-top:0;margin-bottom:clamp(0px,.8dvh,8px)}
@media(max-width:760px){
  #sudokuPage{padding-left:8px;padding-right:8px}
  #sudokuPage .game-heading,#sudokuPage .sudoku-toolbar{width:100%}
  #sudokuPage .sudoku-board{width:100%;max-width:none;max-height:min(calc((100vw - 16px)*1.18),calc(100dvh - 225px))}
  #sudokuPage .sudoku-tools{width:min(300px,78vw)}
}
@media(max-height:700px) and (orientation:portrait){
  #sudokuPage .sudoku-board{max-height:min(calc((100vw - 16px)*1.10),calc(100dvh - 190px))}
}
'''
needle='</style>'
if needle not in s:
    raise SystemExit('style end not found')
s=s.replace(needle,css+'\n'+needle,1)
p.write_text(s)
print('Sudoku vertical fill patch applied')
