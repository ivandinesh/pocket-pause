"""Responsive presentation and existing-control placement, preserving game engines."""
from pathlib import Path
p=Path('index.html');s=p.read_text()
assert 'id="responsiveStyles"' not in s
s=s.replace('</head>','<style id="responsiveStyles">'+Path('app/responsive.css').read_text()+'</style></head>',1)
# Dock the same number pad on wide screens, retaining the mobile popover path.
needle='function positionSudokuPad(i){'
assert s.count(needle)==1
s=s.replace(needle,needle+"if(document.getElementById('sudokuPage').hasAttribute('data-wide')){syncResponsiveSudokuPad();return;}",1)
needle='if(rerender){saveSudoku();'
assert s.count(needle)==1
s=s.replace(needle,'syncResponsiveSudokuPad();'+needle,1)
# Number-pad actions precede the digits in the DOM; update all nine digits.
old="[...pad.querySelectorAll('button')].slice(0,9).forEach((b,n)=>{b.disabled=sudoku.board.flat().filter(v=>v===n+1).length>=9})"
new="[...pad.querySelectorAll('button')].filter(b=>/^[1-9]$/.test(b.textContent.trim())).forEach(b=>{b.disabled=sudoku.board.flat().filter(v=>v===+b.textContent.trim()).length>=9})"
assert s.count(old)==1
s=s.replace(old,new,1)
s=s.replace('</script>',Path('app/responsive.js').read_text()+'\n</script>',1)
p.write_text(s)
