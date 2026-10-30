"""Mark accepted UI gameplay input, outside pinned engines and level generators."""
from pathlib import Path
p=Path('index.html');s=p.read_text()
def hook(needle,replacement):
    count=s.count(needle)
    assert count==1, f'Gameplay metric hook must match once ({count}): {needle[:90]}'
    return s.replace(needle,replacement,1)
def play(game):return f'globalThis.DOPopTelemetry?.play?.({game});'
s=hook('selection.push(index);',play("'words'")+'selection.push(index);')
s=hook('sudoku.notes[i]=[]}checkSudoku();saveSudoku();renderSudoku();',"sudoku.notes[i]=[]}if(prev!==sudoku.board[r][c]||JSON.stringify(prevNotes)!==JSON.stringify(sudoku.notes[i]||[])){"+play("'sudoku'")+"}checkSudoku();saveSudoku();renderSudoku();")
for game,name in [('snake','startSnake'),('tetris','startTetris')]:
    needle=f"function {name}(){{if(!GameSession.resume('{game}'))return;"
    s=hook(needle,needle+play(repr(game)))
for game,name,arg in [('snake','steerSnake','dir'),('tetris','tAction','a'),('pac','steerMaze','d')]:
    needle=f"function {name}({arg}){{if(!GameSession.resume('{game}'))return;"
    s=hook(needle,needle+play(repr(game)))
s=hook('function finishSearch(cells){',"function finishSearch(cells){if(cells.length>1){"+play("'wordSearch'")+"}")
s=hook('const ok=zipCanEnter(x,y);if(!ok)return false;', 'const ok=zipCanEnter(x,y);if(!ok)return false;'+play("'zipLine'"))
s=hook('travel=Math.hypot(dx,dy),gain=2.4;', 'travel=Math.hypot(dx,dy),gain=2.4;if(travel>1){'+play("'fidget'")+'}')
s=hook('fAngle+=d*g.sign;', "if(Math.abs(d)>.005){"+play("'fidget'")+"}fAngle+=d*g.sign;")
s=hook("if(fidgetType!=='gears')return;gearDrag=null;", "if(fidgetType!=='gears')return;"+play("'fidget'")+"gearDrag=null;")
s=hook('const epoch=++dotEpoch,clear=dopopClearDots',play("'dotConnect'")+'const epoch=++dotEpoch,clear=dopopClearDots')
s=hook('if(!result.changed)return;const epoch=++mergeEpoch;', 'if(!result.changed)return;'+play("'merge'")+'const epoch=++mergeEpoch;')
s=hook('if(JSON.stringify(before)!==JSON.stringify(g.state)){g.history=before;', 'if(JSON.stringify(before)!==JSON.stringify(g.state)){'+play('g.id')+'g.history=before;')
s=hook("else if(/^[A-Z]$/.test(key)&&r.input.length<5)r.input+=key;", "else if(/^[A-Z]$/.test(key)&&r.input.length<5){r.input+=key;"+play("'wordGuess'")+"}")
s=hook('data.rounds[id()]=result.round;persist();render();',play("'wordGuess'")+'data.rounds[id()]=result.round;persist();render();')
s=hook("if(key==='Backspace')r.input=r.input.slice(0,-1);", "if(key==='Backspace'){if(r.input.length){"+play("'wordGuess'")+"}r.input=r.input.slice(0,-1);}")
s=hook('fn();state.moves++;render();save();', 'fn();'+play('id')+'state.moves++;render();save();')
s=hook("if(id==='sightline'&&cfg.clues[i]!==null)return;history.push", "if(id==='sightline'&&cfg.clues[i]!==null)return;"+play('id')+'history.push')
s=hook('if(won||lives===0||blocked())return;if(!running)start();dir={x,y};', 'if(won||lives===0||blocked())return;'+play("'antsApart'")+'if(!running)start();dir={x,y};')
s=hook('history=history.slice(-30);fn();save();render();', 'history=history.slice(-30);fn();if(JSON.stringify(history.at(-1))!==JSON.stringify(state)){'+play('id')+'}save();render();')
p.write_text(s)
print('Added accepted gameplay input metrics for all 24 games')
