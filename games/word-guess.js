(() => {
  'use strict';
  const KEY='pocketpause.v1.wordguess.v1', C=WGCore;
  const defaultSave=()=>({version:1,mode:'daily',level:1,date:C.localDate(),rounds:{},prefs:{hard:false,color:'blue',shape:'round',symbols:false,sound:false}});
  let storageProblem=false,recovered=false;
  function read(){
    const clean=defaultSave();
    try{
      const raw=localStorage.getItem(KEY);if(!raw)return clean;
      const saved=JSON.parse(raw);
      if(saved?.version!==1||!saved.rounds||typeof saved.rounds!=='object'||Array.isArray(saved.rounds))throw Error('Invalid save');
      clean.mode=saved.mode==='levels'?'levels':'daily';
      if(Number.isInteger(saved.level)&&saved.level>=1&&saved.level<=1000)clean.level=saved.level;
      if(Number.isFinite(C.dayNumber(saved.date)))clean.date=saved.date;
      for(const [id,round] of Object.entries(saved.rounds)){
        const i=C.answerIndex(id);
        if(i>=0&&C.validRound(round,WG_ANSWERS[i],WG_DICTIONARY))clean.rounds[id]=round;
        else recovered=true;
      }
      const p=saved.prefs||{};
      clean.prefs={hard:p.hard===true,color:Object.hasOwn(SNAKE_COLORS,p.color)?p.color:'blue',shape:p.shape==='square'?'square':'round',symbols:p.symbols===true,sound:p.sound===true};
    }catch{recovered=true;}
    return clean;
  }
  let data=read(),note='',audio=null,animationTimer=null;
  const id=()=>data.mode==='daily'?'d:'+data.date:'l:'+String(data.level).padStart(4,'0');
  const answer=()=>WG_ANSWERS[C.answerIndex(id())];
  const round=()=>data.rounds[id()]||(data.rounds[id()]=C.fresh(data.prefs.hard));
  const pg=document.createElement('section');
  pg.id='wordGuessPage';pg.className='page game-page wg-page';pg.setAttribute('aria-label','Word Guess game');
  pg.innerHTML='<div class="game-heading"><button class="back-button" aria-label="Back to games">←</button><div><p class="eyebrow">WORD GUESS</p><h1>One word. Six tries.</h1></div><button class="wg-icon-button" data-sound aria-label="Enable sound" aria-pressed="false">♪</button></div><div class="wg-meta"></div><div class="wg-middle"><div class="wg-board" role="group" aria-label="Six guesses, five letters each"></div></div><div class="wg-result" hidden></div><div class="wg-footer"><p class="wg-note" role="status" aria-live="polite"></p><div class="wg-keyboard" role="group" aria-label="Letter keyboard"></div><div class="wg-actions"><button data-mode="daily">Daily</button><button data-mode="levels">Levels</button><button data-level>Level 1</button><button data-stats aria-label="Statistics">Stats</button><button data-settings aria-label="Appearance and game settings">⚙</button><button data-help aria-label="How to play">?</button></div></div>';
  $('app').append(pg);
  const q=s=>pg.querySelector(s);
  const card=document.createElement('button');card.className='game-card';
  card.innerHTML='<span class="mini-art" aria-hidden="true"><svg viewBox="0 0 80 80" width="70" height="70"><rect x="13" y="16" width="25" height="25" rx="7" fill="#40845c"/><rect x="42" y="16" width="25" height="25" rx="7" fill="#986c19"/><rect x="13" y="45" width="25" height="20" rx="7" fill="#e4eaf4"/><rect x="42" y="45" width="25" height="20" rx="7" fill="#e4eaf4"/><text x="25.5" y="34" text-anchor="middle" font-size="18" font-weight="700" fill="white">W</text><text x="54.5" y="34" text-anchor="middle" font-size="18" font-weight="700" fill="white">G</text></svg></span><span class="card-copy"><b>Word Guess</b></span>';
  document.querySelector('.game-grid').append(card);
  function persist(){
    try{localStorage.setItem(KEY,JSON.stringify(data));storageProblem=false;}
    catch{storageProblem=true;}
  }
  function todayOnOpen(){
    if(data.date!==C.localDate()){
      const old=data.rounds['d:'+data.date];
      if(!old||!old.guesses.length&&!old.input||C.outcome(old,WG_ANSWERS[C.answerIndex('d:'+data.date)])!=='playing')data.date=C.localDate();
    }
  }
  card.onclick=()=>{todayOnOpen();showPage('wordGuess');note='';render();};
  q('.back-button').onclick=()=>{persist();showPage('home');};
  function dialog(title,body,setup=()=>{}){
    const d=document.createElement('dialog');d.className='wg-dialog';d.innerHTML='<h2>'+title+'</h2>'+body+'<form method="dialog"><button>Done</button></form>';
    pg.append(d);d.addEventListener('close',()=>d.remove());setup(d);d.showModal();return d;
  }
  function playSound(won){
    if(!data.prefs.sound)return;
    try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});
      [0,1,2].slice(0,won?3:1).forEach((_,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.09;o.type='sine';o.frequency.value=[440,554,659][i];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.17);});
    }catch{}
  }
  function switchMode(mode){data.mode=mode;if(mode==='daily')todayOnOpen();note='';persist();render();}
  pg.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
  function selectLevel(level){data.mode='levels';data.level=level;note='';persist();render();}
  q('[data-level]').onclick=()=>LevelPicker.open({page:pg,current:data.level,max:1000,onSelect:selectLevel});
  q('[data-sound]').onclick=()=>{data.prefs.sound=!data.prefs.sound;persist();render();if(data.prefs.sound)playSound(false);};
  q('[data-help]').onclick=()=>dialog('Find the hidden word.','<p>Guess a five-letter word in six tries. Press Enter to submit. Invalid words do not use a try.</p><p><b>✓ Green:</b> correct letter and position.<br><b>↔ Amber:</b> in the word, in a different position.<br><b>× Gray:</b> no remaining copy of that letter.</p><p>Repeated letters only get as many colored clues as the answer contains. Keyboard keys keep their strongest clue.</p><p>Daily uses your device’s local date. Everyone on the same date and puzzle version gets the same word. An unfinished older daily stays available until you choose Today. Levels can be played in any order.</p><p>Hard mode requires all revealed letters, their counts, and correct positions. Amber letters must move. Enable it before your first guess.</p><p>No timers, accounts or internet needed after the offline download. Your progress is included in Offline & saves backups.</p><p class="wg-small">Dictionary: Tab Atkins Jr., MIT license. Answer selection and game design by dopop.</p>');
  q('[data-stats]').onclick=()=>{
    const s=C.stats(data.rounds,WG_ANSWERS,data.mode,C.localDate());
    dialog(data.mode==='daily'?'Daily statistics':'Level statistics','<div class="wg-stats"><div><b>'+s.played+'</b>Played</div><div><b>'+s.percent+'%</b>Wins</div>'+(data.mode==='daily'?'<div><b>'+s.streak+'</b>Streak</div><div><b>'+s.best+'</b>Best streak</div>':'')+'</div><h3>Winning guesses</h3>'+s.distribution.map((n,i)=>'<div class="wg-dist"><span>'+(i+1)+'</span><div style="width:'+Math.max(8,n/Math.max(1,...s.distribution)*85)+'%">'+n+'</div></div>').join('')+'<p class="wg-small">Played counts puzzles with at least one submitted guess. Revisiting a completed puzzle does not count again.</p>');
  };
  q('[data-settings]').onclick=()=>dialog('Make it yours.','<div class="wg-settings"><label><input data-hard type="checkbox"> Hard mode</label><p data-hard-note></p><label><input data-symbols type="checkbox"> Show clue symbols</label><p>Colors change empty tiles and accents. Green, amber and gray clues stay consistent.</p><div class="new-appearance"><div class="appearance-group" data-colors role="group" aria-label="Accent color"></div><div class="appearance-group" data-shapes role="group" aria-label="Tile shape"></div></div></div>',d=>{
    const hard=d.querySelector('[data-hard]');hard.checked=round().hard;hard.disabled=round().guesses.length>0;
    d.querySelector('[data-hard-note]').textContent=hard.disabled?'Locked for this puzzle after the first guess.':'Use every revealed clue in later guesses.';
    hard.onchange=()=>{data.prefs.hard=hard.checked;round().hard=hard.checked;persist();render();};
    const symbols=d.querySelector('[data-symbols]');symbols.checked=data.prefs.symbols;symbols.onchange=()=>{data.prefs.symbols=symbols.checked;persist();render();};
    for(const [name,pal] of Object.entries(SNAKE_COLORS)){
      const b=document.createElement('button');b.className='new-swatch';b.style.setProperty('--swatch',pal.body);b.setAttribute('aria-label',name+' accent');b.setAttribute('aria-pressed',String(name===data.prefs.color));
      b.onclick=()=>{data.prefs.color=name;d.querySelectorAll('[data-colors] button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));persist();render();};d.querySelector('[data-colors]').append(b);
    }
    for(const shape of ['round','square']){
      const b=document.createElement('button');b.className='new-shape';b.textContent=shape;b.setAttribute('aria-pressed',String(shape===data.prefs.shape));
      b.onclick=()=>{data.prefs.shape=shape;d.querySelectorAll('[data-shapes] button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));persist();render();};d.querySelector('[data-shapes]').append(b);
    }
  });
  const labels=['absent','wrong position','correct position'],symbols=['×','↔','✓'];
  const cells=[];
  for(let r=0;r<6;r++){
    const row=document.createElement('div');row.className='wg-row';
    for(let c=0;c<5;c++){const cell=document.createElement('div');cell.className='wg-cell';cell.innerHTML='<span></span><small aria-hidden="true"></small>';row.append(cell);cells.push(cell);}
    q('.wg-board').append(row);
  }
  const buttons=new Map();
  for(const letters of ['QWERTYUIOP','ASDFGHJKL','!ZXCVBNM<']){
    const row=document.createElement('div');row.className='wg-key-row';
    for(const letter of letters){
      const key=letter==='!'?'Enter':letter==='<'?'Backspace':letter,b=document.createElement('button');b.type='button';b.dataset.key=key;b.textContent=key==='Backspace'?'⌫':key;
      if(key.length>1)b.classList.add('wg-key-wide');b.setAttribute('aria-label',key==='Backspace'?'Delete letter':key);
      b.onclick=()=>input(key);row.append(b);buttons.set(key,b);
    }q('.wg-keyboard').append(row);
  }
  function input(key){
    if(currentPage!=='wordGuess'||pg.querySelector('dialog[open]'))return;
    const r=round(),a=answer();
    if(C.outcome(r,a)!=='playing')return;
    note='';
    if(key==='Backspace')r.input=r.input.slice(0,-1);
    else if(key==='Enter'){
      const result=C.submit(r,a,r.input,WG_DICTIONARY);
      if(result.error){note=result.error;render();return;}
      data.rounds[id()]=result.round;persist();render();
      const row=q('.wg-board').children[result.round.guesses.length-1];
      row.classList.remove('wg-reveal');void row.offsetWidth;row.classList.add('wg-reveal');
      clearTimeout(animationTimer);animationTimer=setTimeout(()=>row.classList.remove('wg-reveal'),450);
      playSound(C.outcome(result.round,a)==='won');return;
    }else if(/^[A-Z]$/.test(key)&&r.input.length<5)r.input+=key;
    else return;
    persist();render();
  }
  document.addEventListener('keydown',e=>{
    if(currentPage!=='wordGuess'||pg.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.repeat)return;
    const key=e.key.length===1?e.key.toUpperCase():e.key;
    if(/^[A-Z]$/.test(key)||key==='Enter'||key==='Backspace'){e.preventDefault();input(key);}
  });
  function render(){
    const r=round(),a=answer(),result=C.outcome(r,a),marks=C.keyMarks(r,a);
    pg.dataset.shape=data.prefs.shape;pg.style.setProperty('--wg-accent',SNAKE_COLORS[data.prefs.color].body);
    q('.wg-meta').textContent=(data.mode==='daily'?'Daily · '+data.date:'Level '+data.level+' of 1,000')+(r.hard?' · Hard mode':'');
    q('[data-level]').textContent='Level '+data.level;q('[data-level]').hidden=data.mode!=='levels';
    pg.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===data.mode)));
    q('[data-sound]').setAttribute('aria-pressed',String(data.prefs.sound));q('[data-sound]').setAttribute('aria-label',data.prefs.sound?'Mute sound':'Enable sound');
    for(let row=0;row<6;row++){
      const guess=r.guesses[row],word=guess||(row===r.guesses.length?r.input:'');
      const feedback=guess?C.feedback(a,guess):null;
      for(let col=0;col<5;col++){
        const cell=cells[row*5+col],m=feedback?.[col];
        cell.firstChild.textContent=word[col]||'';cell.lastChild.textContent=data.prefs.symbols&&m!==undefined?symbols[m]:'';
        cell.dataset.mark=m===undefined?'empty':String(m);cell.dataset.filled=String(!!word[col]);
        cell.setAttribute('aria-label','Guess '+(row+1)+', letter '+(col+1)+': '+(word[col]||'empty')+(m!==undefined?', '+labels[m]:''));
      }
    }
    for(const [key,b] of buttons){
      const m=marks[key];b.dataset.mark=m===undefined?'empty':String(m);b.disabled=result!=='playing';
      b.setAttribute('aria-label',(key==='Backspace'?'Delete letter':key)+(m!==undefined?', '+labels[m]:''));
    }
    const resultBox=q('.wg-result');resultBox.replaceChildren();resultBox.hidden=result==='playing'&&!(data.mode==='daily'&&data.date!==C.localDate());
    if(result!=='playing'){
      const text=document.createElement('p');text.textContent=result==='won'?'Lovely! '+a+' · '+r.guesses.length+'/6':'The word was '+a+'. A fresh start awaits.';resultBox.append(text);
      const next=document.createElement('button');
      next.textContent=data.mode==='daily'?'Play levels':data.level<1000?'Next level':'Choose another level';
      next.onclick=()=>data.mode==='daily'?switchMode('levels'):data.level<1000?selectLevel(data.level+1):q('[data-level]').click();resultBox.append(next);
    }
    if(data.mode==='daily'&&data.date!==C.localDate()){
      const b=document.createElement('button');b.textContent='Play today’s puzzle';b.onclick=()=>{data.date=C.localDate();note='';persist();render();};resultBox.append(b);
    }
    q('.wg-note').textContent=storageProblem?'Progress could not be saved. Export a backup before closing.':note|| (recovered?'Some invalid saved data was ignored. Valid puzzles are preserved.':result==='playing'?'Five letters · '+(6-r.guesses.length)+' tries left':'Your result is saved.');
  }
  pg.addEventListener('contextmenu',e=>{if(!e.target.closest('input'))e.preventDefault();});
  pg.addEventListener('selectstart',e=>{if(!e.target.closest('input'))e.preventDefault();});
  window.addEventListener('storage',e=>{if(e.key===KEY){data=read();note='Progress updated from another tab.';render();}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&currentPage==='wordGuess')render();});
  setInterval(()=>{if(currentPage==='wordGuess'&&!document.hidden&&data.mode==='daily'&&data.date!==C.localDate())render();},60000);
  render();
})();
