from pathlib import Path
p=Path('index.html')
s=p.read_text()
old="function selectSudoku(i,rerender=true){if(!sudoku)return;if(i==null){sudoku.selected=null;closeSudokuPad();return}sudoku.selected=i;const r=Math.floor(i/9),c=i%9,val=sudoku.board[r][c];document.querySelectorAll('.sudoku-cell').forEach((el,j)=>{const rr=Math.floor(j/9),cc=j%9,same=val&&sudoku.board[rr][cc]===val;el.classList.toggle('selected',j===i);el.classList.toggle('peer',j!==i&&(rr===r||cc===c||(Math.floor(rr/3)===Math.floor(r/3)&&Math.floor(cc/3)===Math.floor(c/3))));el.classList.toggle('same',j!==i&&!!same);el.classList.toggle('error',!!sudoku.board[rr][cc]&&sudoku.board[rr][cc]!==sudoku.solution[rr][cc]&&!sudoku.puzzle[rr][cc])});if(rerender){saveSudoku();positionSudokuPad(i)}}"
new="function selectSudoku(i,rerender=true){if(!sudoku)return;if(i==null){sudoku.selected=null;closeSudokuPad();return}const pad=$('sudokuNumbers'),sameCell=sudoku.selected===i,padOpen=!!pad?.classList.contains('open');sudoku.selected=i;const r=Math.floor(i/9),c=i%9,val=sudoku.board[r][c];document.querySelectorAll('.sudoku-cell').forEach((el,j)=>{const rr=Math.floor(j/9),cc=j%9,same=val&&sudoku.board[rr][cc]===val;el.classList.toggle('selected',j===i);el.classList.toggle('peer',j!==i&&(rr===r||cc===c||(Math.floor(rr/3)===Math.floor(r/3)&&Math.floor(cc/3)===Math.floor(c/3))));el.classList.toggle('same',j!==i&&!!same);el.classList.toggle('error',!!sudoku.board[rr][cc]&&sudoku.board[rr][cc]!==sudoku.solution[rr][cc]&&!sudoku.puzzle[rr][cc])});if(rerender){saveSudoku();if(sameCell&&padOpen)closeSudokuPad();else positionSudokuPad(i)}}"
if old not in s:
    raise SystemExit('selectSudoku function not found')
s=s.replace(old,new,1)
p.write_text(s)
print('patched sudoku tap-to-toggle popup')
