from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Sudoku: equal popup + tall board */'
if marker in s:
    raise SystemExit('already patched')
# Make erase icon-only while preserving accessibility
s=s.replace('<button id="sudokuErase" class="soft-button">⌫ Erase</button>','<button id="sudokuErase" class="soft-button" aria-label="Erase">⌫</button>')
css=r'''

/* Sudoku: equal popup + tall board */
#sudokuNumbers{grid-template-columns:repeat(3,minmax(0,1fr));width:198px}
#sudokuNumbers button{min-width:0;width:100%;height:54px;padding:0;font-size:21px}
#sudokuNumbers #sudokuErase{font-size:23px;display:grid;place-items:center;padding:0}
#sudokuPage .sudoku-board{
  flex:1 1 0;
  width:min(620px,calc(100vw - 16px));
  height:auto;
  max-height:none;
  min-height:0;
  aspect-ratio:auto;
  grid-template-columns:repeat(9,minmax(0,1fr));
  grid-template-rows:repeat(9,minmax(0,1fr));
}
#sudokuPage .sudoku-tools{margin-top:8px;margin-bottom:clamp(2px,1dvh,10px)}
@media(max-width:760px){
  #sudokuPage .sudoku-board{width:100%;max-width:none;max-height:none}
}
@media(max-height:700px) and (orientation:portrait){
  #sudokuPage .sudoku-board{max-height:none}
}
'''
if '</style>' not in s:
    raise SystemExit('style end not found')
s=s.replace('</style>',css+'\n</style>',1)
p.write_text(s)
print('patched sudoku popup and tall board')
