from pathlib import Path
p=Path('index.html');s=p.read_text()
s=s.replace('user-scalable=no','user-scalable=yes')
s=s.replace('<script type="module">','<script type="module">\n'+Path('app/game-session.js').read_text()+Path('app/level-picker.js').read_text(),1)
s=s.replace('function showPage(name){currentPage=name;',"function showPage(name){if(currentPage!==name)GameSession.pause(currentPage);currentPage=name;")
s=s.replace("if(currentPage==='snake'&&snake.status==='playing'){","if(currentPage==='snake'&&snake.status==='playing'&&GameSession.canPlay('snake')){")
s=s.replace("if(currentPage==='tetris'&&tetris.status==='playing')tetris.tick(dt)","if(currentPage==='tetris'&&tetris.status==='playing'&&GameSession.canPlay('tetris'))tetris.tick(dt)")
s=s.replace("if(run&&currentPage==='pac'&&!document.hidden){","if(run&&currentPage==='pac'&&GameSession.canPlay('pac')){")
s=s.replace("if(currentPage==='sudoku'&&!sudoku.solved){","if(currentPage==='sudoku'&&!sudoku.solved&&GameSession.canPlay('sudoku')){")
# Numeric picker changes are staged until explicit confirmation.
s=s.replace("$('pacLevel').onchange=e=>", "const applyPacLevel=e=>")
# Maze Chase's apply handler is inside its closure: use an explicit custom commit event.
s=s.replace("const applyPacLevel=e=>", "$('pacLevel').addEventListener('dopop-level-commit',e=>")
s=s.replace("run=false;make()};for(const name", "run=false;make()});for(const name")
s=s.replace("input.dispatchEvent(new Event('change'));", "if(!input.checkValidity()){input.reportValidity();return;}if(input.value!==dialog.dataset.original)input.dispatchEvent(new Event('dopop-level-commit'));")
s=s.replace("dialog.append(label,done);pg.append(dialog);controls.prepend(launch);launch.onclick=()=>dialog.showModal();", "done.textContent='Play';const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.className='soft-button';cancel.onclick=()=>dialog.close();dialog.append(label,done,cancel);pg.append(dialog);controls.prepend(launch);launch.onclick=()=>{dialog.dataset.original=input.value;dialog.showModal();};dialog.addEventListener('close',()=>{input.value=launch.textContent.replace('Level ','');});")
# Surface previously silent persistence failures without replacing stored progress.
s=s.replace("set(k,v){try{localStorage.setItem('pocketpause.v1.'+k,String(v))}catch{}}", "set(k,v){try{localStorage.setItem('pocketpause.v1.'+k,String(v));return true}catch{queueMicrotask(()=>{let note=document.getElementById('saveWarning');if(!note){note=document.createElement('p');note.id='saveWarning';note.setAttribute('role','status');note.textContent='Progress could not be saved. Keep this tab open.';document.body.append(note);}});return false}}")
s=s.replace("function syncLevelControl(id,n){const pg=$(id+'Page');if(!pg)return;", "function syncLevelControl(id,n){const pg=$(id+'Page');if(!pg||pg.querySelector('dialog[open]'))return;")
s=s.replace("launch.textContent=(id==='snake'?'Speed ':'Level ')+input.value;dialog.close()};done.textContent", "launch.textContent='Level '+input.value;dialog.dataset.original=input.value;dialog.close()};done.textContent")
s=s.replace("cancel.onclick=()=>dialog.close();dialog.append(label,done,cancel)", "cancel.onclick=()=>{input.value=dialog.dataset.original;dialog.close();};dialog.addEventListener('cancel',()=>{input.value=dialog.dataset.original;});dialog.append(label,done,cancel)")
s=s.replace("input.value=launch.textContent.replace('Level ','');", "input.value=dialog.dataset.original;launch.textContent='Level '+input.value;")
s=s.replace("launch.onclick=()=>dialog.showModal();footer.append(launch)", "launch.onclick=()=>LevelPicker.open({page:pg,current:+input.value,max:+input.max,label:id==='snake'?'Speed':id==='tetris'?'Starting level':'Level',description:'Selecting another level starts a new attempt.',onSelect:n=>{input.value=n;form.requestSubmit();}});footer.append(launch)")
s=s.replace("$('pacBack').onclick=", "document.addEventListener('dopop-resume',e=>{if(e.detail==='pac'&&lives>0){run=true;draw();}});$('pacBack').onclick=")
# Direct movement owns start/resume; engine and seeded level data stay unchanged.
s=s.replace("function startSnake(){snake.reset", "function startSnake(){if(!GameSession.resume('snake'))return;snake.reset")
s=s.replace("function steerSnake(dir){if(snake.status", "function steerSnake(dir){if(!GameSession.resume('snake'))return;if(snake.status")
s=s.replace("&&(next.x!==current.x||next.y!==current.y))steerSnake(dir)", ")steerSnake(dir)")
s=s.replace("function startTetris(){tetris.reset", "function startTetris(){if(!GameSession.resume('tetris'))return;tetris.reset")
s=s.replace("function tAction(a){if(tetris.status", "function tAction(a){if(!GameSession.resume('tetris'))return;if(tetris.status")
s=s.replace("'Paused · tap Play'", "'Move or swipe to start'")
s=s.replace("$('pacPlay').onclick=()=>{if(lives<=0)make();run=!run;draw()}", "$('pacPlay').onclick=()=>{run=false;GameSession.pause('pac');draw()}")
s=s.replace("card.onclick=()=>{showPage('pac');draw()}", "function steerMaze(d){if(!GameSession.resume('pac'))return;if(lives<=0)make();next=d;run=true;draw()}card.onclick=()=>{showPage('pac');draw()}")
s=s.replace("e.preventDefault();next=d;", "e.preventDefault();steerMaze(d);")
s=s.replace("next=Math.abs(x)>Math.abs(y)?[Math.sign(x),0]:[0,Math.sign(y)];", "steerMaze(Math.abs(x)>Math.abs(y)?[Math.sign(x),0]:[0,Math.sign(y)]);")
s=s.replace("$('pacNote').textContent=", "$('pacPlay').textContent=run?'Pause':'Paused';$('pacPlay').disabled=!run;$('pacNote').textContent=")
# A ready or finished board accepts gestures through the quiet overlay.
s=s.replace('</head>', '<style>#snakeOverlay,#tetrisOverlay{pointer-events:none}#snakeOverlay button,#tetrisOverlay button{pointer-events:auto}</style></head>')

p.write_text(s)

s=Path("index.html").read_text().replace('<script type="module">','<script type="module">await DoPopSaveSafety.ready;\n',1)
Path("index.html").write_text(s)
