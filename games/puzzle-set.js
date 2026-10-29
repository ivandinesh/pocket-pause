(() => {
  const C=PuzzleSetCore,pack=PuzzleSetLevels;
  const symbols=['○','△','□','◇'],names=['blue circle','green triangle','amber square','graphite diamond'];
  const specs={
    rotateNetwork:{key:'pocketpause.v1.rotateNetwork',name:'Rotate Network',subtitle:'Everything connected.',icon:'┼',hint:'Tap to rotate. Join every tile without a loop.',help:'Rotate the tiles until every path connects into one network with no loose ends or loops. All tiles must join. Use Lock tiles to protect a tile, or press L while it is focused. Tap again in lock mode to unlock. Arrow keys move focus; Enter or Space activates a tile.'},
    loop:{key:'pocketpause.v1.loop',name:'Loop',subtitle:'One quiet loop.',icon:'▱',hint:'Tap an edge: line → excluded → unknown.',help:'Draw exactly one closed loop along the edges. Each number tells you how many of its four surrounding edges belong to the loop. Empty clues have no number constraint. Tap an edge to cycle through line, excluded (×), and unknown. Lines cannot branch or form separate loops. Arrow keys move focus; Enter or Space changes an edge.'},
    colorCode:{key:'pocketpause.v1.colorCode',name:'Color Code',subtitle:'A little deduction.',icon:'◇',hint:'Choose four symbols, then check your guess.',help:'Find the hidden four-symbol code in eight guesses. Symbols may repeat. Choose a slot, then a symbol; you can also type 1–4. A filled dot means the correct symbol in the correct place; an open dot means the correct symbol in a different place. Feedback is a count and does not identify specific slots. Each symbol is counted only once. Backspace clears a slot and Enter checks a complete guess. Colors have matching shapes so color vision is never required.'},
    pictureGrid:{key:'pocketpause.v1.pictureGrid',name:'Picture Grid',subtitle:'A pattern takes shape.',icon:'▦',hint:'Tap a cell: filled → empty → unknown.',help:'Reveal an abstract pattern using the clues beside each row and above each column. The numbers give the lengths of consecutive filled runs, in order, with at least one empty cell between runs. For example, 2 1 means two filled cells, a gap, then one filled cell. Tap to cycle filled, empty (×), and unknown. Unfilled cells need not all be marked to finish. Arrow keys move focus; Enter or Space changes a cell.'}
  };
  function make(id){
    const spec=specs[id],key=spec.key,max=pack[id].length;
    let level=1,attempts={},state,history=[],lockMode=false,selected=0,saveFailed=false;
    try{const raw=JSON.parse(localStorage.getItem(key)||'null');if(raw?.version===1){if(Number.isInteger(raw.level)&&raw.level>=1&&raw.level<=max)level=raw.level;if(raw.attempts&&typeof raw.attempts==='object'&&!Array.isArray(raw.attempts))attempts=raw.attempts;}}catch{}
    const cfg=()=>pack[id][level-1];
    function load(){const old=attempts[level];state=C.valid(id,old?.state,cfg())?C.copy(old.state):C.fresh(id,cfg());history=Array.isArray(old?.history)?old.history.filter(s=>C.valid(id,s,cfg())).slice(-30).map(C.copy):[];selected=0;lockMode=false;}
    load();
    const page=document.createElement('section');page.id=id+'Page';page.className='page game-page ps-game';
    page.innerHTML='<div class="game-heading"><button class="back-button" aria-label="Back to games">←</button><div><p class="eyebrow">'+spec.name.toUpperCase()+'</p><h1>'+spec.subtitle+'</h1></div><div class="ps-stat"><b data-progress></b><span>level</span></div></div><p class="ps-meta"></p><div class="ps-board-wrap"><div class="ps-board"></div><div class="ps-tools"></div></div><p class="ps-note" role="status"></p><button class="ps-next" data-next hidden>Next level</button><div class="ps-actions"><button data-level>Level</button><button data-undo>Undo</button><button data-reset>Reset</button><button data-help aria-label="How to play '+spec.name+'">?</button></div>';
    document.getElementById('app').append(page);
    const q=s=>page.querySelector(s),board=q('.ps-board'),tools=q('.ps-tools');
    const card=document.createElement('button');card.className='game-card';card.innerHTML='<span class="mini-art logic-icon" aria-hidden="true">'+spec.icon+'</span><span class="card-copy"><b>'+spec.name+'</b><small>'+spec.subtitle+'</small></span><span class="arrow">→</span>';document.querySelector('.game-grid').append(card);
    function save(){attempts[level]={state:C.copy(state),history:history.slice(-30).map(C.copy)};const safe={};for(let l=1;l<=max;l++){const a=attempts[l],c=pack[id][l-1];if(C.valid(id,a?.state,c))safe[l]={state:a.state,history:Array.isArray(a.history)?a.history.filter(s=>C.valid(id,s,c)).slice(-30):[]};}attempts=safe;try{localStorage.setItem(key,JSON.stringify({version:1,level,attempts}));saveFailed=false;}catch{saveFailed=true;}}
    function edit(fn){if(C.solved(id,state,cfg()))return;history.push(C.copy(state));history=history.slice(-30);fn();save();render();}
    function button(label,action,className=''){const b=document.createElement('button');b.type='button';b.className=className;b.setAttribute('aria-label',label);b.onclick=action;return b;}
    function focusKey(b,key){b.dataset.focus=key;return b;}
    function cellLabel(i){return 'Row '+(Math.floor(i/cfg().n)+1)+', column '+(i%cfg().n+1);}
    function change(next){save();level=next;load();save();render();}
    function modal(title,body,setup=()=>{}){const d=document.createElement('dialog'),previous=document.activeElement;d.className='ps-dialog';d.innerHTML='<h2>'+title+'</h2>'+body+'<form method="dialog"><button>Done</button></form>';page.append(d);setup(d);d.addEventListener('close',()=>{d.remove();if(previous?.isConnected&&(document.activeElement===document.body||d.contains(document.activeElement)))previous.focus();});d.showModal();}
    function network(){
      const n=cfg().n;board.classList.add('ps-network');board.style.gridTemplateColumns='repeat('+n+',minmax(0,1fr))';
      state.values.forEach((mask,i)=>{const label=cellLabel(i)+(state.locks[i]?', locked':', unlocked');const b=focusKey(button(label,()=>{if(lockMode)edit(()=>state.locks[i]=!state.locks[i]);else if(!state.locks[i])edit(()=>state.values[i]=C.rotate(mask));},'ps-tile'),'tile-'+i);b.dataset.locked=String(state.locks[i]);let lines='';for(const [bit,x,y]of [[1,20,0],[2,40,20],[4,20,40],[8,0,20]])if(mask&bit)lines+='<path d="M20 20L'+x+' '+y+'"/>';b.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true">'+lines+'<circle cx="20" cy="20" r="2.5"/></svg>'+(state.locks[i]?'<span class="ps-lock" aria-hidden="true">•</span>':'');b.setAttribute('aria-label',label+'; paths '+[[1,'up'],[2,'right'],[4,'down'],[8,'left']].filter(([bit])=>mask&bit).map(([,name])=>name).join(', '));b.onkeydown=e=>{if(e.key.toLowerCase()==='l'){e.preventDefault();edit(()=>state.locks[i]=!state.locks[i]);}};board.append(b);});
      const lock=focusKey(button('Lock tile mode',()=>{lockMode=!lockMode;render();},'ps-mode'),'mode');lock.textContent=lockMode?'Lock mode · tap tiles':'Lock tiles';lock.setAttribute('aria-pressed',String(lockMode));tools.append(lock);
    }
    function loop(){
      const n=cfg().n,geo=C.loopGeometry(n);board.classList.add('ps-loop');board.style.gridTemplateColumns='repeat('+(2*n+1)+',minmax(0,1fr))';
      for(let y=0;y<=2*n;y++)for(let x=0;x<=2*n;x++){
        if(y%2&&x%2){const clue=document.createElement('span');clue.className='ps-clue';const c=cfg().clues[((y-1)/2)*n+(x-1)/2];clue.textContent=c===null?'':c;board.append(clue);}
        else if(!(y%2)&&!(x%2)){const dot=document.createElement('span');dot.className='ps-vertex';dot.setAttribute('aria-hidden','true');board.append(dot);}
        else {const horizontal=!(y%2),index=horizontal?(y/2)*n+(x-1)/2:n*(n+1)+((y-1)/2)*(n+1)+x/2;const value=state.values[index];const b=focusKey(button((horizontal?'Horizontal':'Vertical')+' edge row '+(Math.floor(y/2)+1)+', column '+(Math.floor(x/2)+1)+', '+(value===1?'line':value===0?'excluded':'unknown'),()=>edit(()=>state.values[index]=value===-1?1:value===1?0:-1),'ps-edge '+(horizontal?'ps-horizontal':'ps-vertical')),'edge-'+index);b.dataset.state=value;b.textContent=value===0?'×':'';board.append(b);}
      }
      // The order of edges is generated independently of the visual DOM order.
      board.dataset.edgeCount=geo.edges.length;
    }
    function picture(){
      const n=cfg().n;board.classList.add('ps-picture');board.style.gridTemplateColumns='minmax(34px,auto) repeat('+n+',minmax(0,1fr))';
      const corner=document.createElement('span');corner.setAttribute('aria-hidden','true');board.append(corner);
      for(let x=0;x<n;x++){const clue=document.createElement('span');clue.className='ps-column-clue';clue.textContent=cfg().cols[x].join('\n')||'0';clue.setAttribute('aria-label','Column '+(x+1)+' runs '+(cfg().cols[x].join(', ')||'0'));board.append(clue);}
      for(let y=0;y<n;y++){const clue=document.createElement('span');clue.className='ps-row-clue';clue.textContent=cfg().rows[y].join(' ')||'0';clue.setAttribute('aria-label','Row '+(y+1)+' runs '+(cfg().rows[y].join(', ')||'0'));board.append(clue);for(let x=0;x<n;x++){const i=y*n+x,value=state.values[i],b=focusKey(button(cellLabel(i)+', '+(value===1?'filled':value===0?'empty':'unknown'),()=>edit(()=>state.values[i]=value===-1?1:value===1?0:-1),'ps-pixel'),'pixel-'+i);b.dataset.state=value;b.textContent=value===0?'×':'';board.append(b);}}
    }
    function put(value){if(state.guesses.length>=cfg().turns||C.solved(id,state,cfg()))return;edit(()=>{state.entry[selected]=value;selected=(selected+1)%cfg().size;});}
    function submit(){if(state.guesses.length>=cfg().turns)return;if(state.entry.some(v=>v===null)){q('.ps-note').textContent='Choose all four symbols first.';return;}edit(()=>{state.guesses.push(state.entry.slice());state.entry.fill(null);selected=0;});}
    function code(){
      board.classList.add('ps-code');board.style.removeProperty('grid-template-columns');
      for(let i=0;i<cfg().turns;i++){const row=document.createElement('div');row.className='ps-code-row';const guess=state.guesses[i];const number=document.createElement('span');number.className='ps-turn';number.textContent=i+1;row.append(number);for(let j=0;j<cfg().size;j++){const peg=document.createElement('span');peg.className='ps-peg';if(guess){peg.dataset.color=guess[j];peg.textContent=symbols[guess[j]];peg.setAttribute('aria-label',names[guess[j]]);}else{peg.textContent='·';peg.setAttribute('aria-hidden','true');}row.append(peg);}const feedback=document.createElement('span');feedback.className='ps-feedback';if(guess){const f=C.feedback(guess,cfg().answer);feedback.textContent='●'.repeat(f.exact)+'○'.repeat(f.misplaced)||'—';feedback.setAttribute('aria-label',f.exact+' exact, '+f.misplaced+' misplaced');}row.append(feedback);board.append(row);}
      const ended=C.solved(id,state,cfg())||state.guesses.length>=cfg().turns;
      if(!ended){const entry=document.createElement('div');entry.className='ps-entry';entry.setAttribute('aria-label','Current guess');state.entry.forEach((value,i)=>{const b=focusKey(button('Slot '+(i+1)+(value===null?', empty':', '+names[value]),()=>{selected=i;render();},'ps-peg'),'slot-'+i);b.textContent=value===null?'·':symbols[value];b.dataset.color=value===null?'':value;b.setAttribute('aria-pressed',String(selected===i));entry.append(b);});const palette=document.createElement('div');palette.className='ps-palette';for(let value=0;value<cfg().colors;value++){const b=focusKey(button(names[value]+', key '+(value+1),()=>put(value),'ps-peg'),'symbol-'+value);b.dataset.color=value;b.textContent=symbols[value];palette.append(b);}const check=focusKey(button('Check guess',submit,'ps-check'),'check');check.textContent='Check';const erase=focusKey(button('Clear selected slot',()=>edit(()=>state.entry[selected]=null),'ps-erase'),'erase');erase.textContent='Clear slot';tools.append(entry,palette,check,erase);}
    }
    function render(){
      const focused=page.contains(document.activeElement)?document.activeElement?.dataset?.focus:null;
      q('[data-progress]').textContent=level;q('[data-level]').textContent='Level '+level;q('[data-undo]').disabled=!history.length;
      q('.ps-meta').textContent='Level '+level+' / '+max+(cfg().n?' · '+cfg().n+' × '+cfg().n:' · four symbols, eight guesses');
      board.className='ps-board';board.replaceChildren();tools.replaceChildren();
      if(id==='rotateNetwork')network();else if(id==='loop')loop();else if(id==='pictureGrid')picture();else code();
      const complete=C.solved(id,state,cfg()),lost=id==='colorCode'&&!complete&&state.guesses.length>=cfg().turns;
      q('.ps-note').textContent=saveFailed?'Progress could not be saved. Keep this tab open.':complete?(level===max?'All 30 levels complete.':'Solved. Take a moment, then choose Next level.'):lost?'Code: '+cfg().answer.map(v=>symbols[v]).join(' ')+' · Reset to try again.':spec.hint;
      q('[data-next]').hidden=!complete||level===max;
      if(focused)page.querySelector('[data-focus="'+focused+'"]')?.focus({preventScroll:true});
    }
    board.addEventListener('keydown',e=>{if(document.hidden||page.querySelector('dialog[open]'))return;const cells=[...board.querySelectorAll('button')],index=cells.indexOf(e.target);if(index<0)return;const stride=id==='loop'?cfg().n*2+1:cfg().n,offset={ArrowRight:1,ArrowLeft:-1,ArrowDown:stride,ArrowUp:-stride}[e.key];if(offset!==undefined){e.preventDefault();cells[(index+offset+cells.length)%cells.length].focus();}});
    page.addEventListener('keydown',e=>{if(id!=='colorCode'||document.hidden||page.querySelector('dialog[open]')||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;if(/^[1-4]$/.test(e.key)){e.preventDefault();put(Number(e.key)-1);}else if(e.key==='Backspace'){e.preventDefault();edit(()=>state.entry[selected]=null);}else if(e.key==='Enter'&&(e.target.tagName!=='BUTTON'||/^(slot|symbol)-/.test(e.target.dataset.focus||''))){e.preventDefault();submit();}});
    card.onclick=()=>{showPage(id);render();};q('.back-button').onclick=()=>{save();showPage('home');};q('[data-next]').onclick=()=>{if(C.solved(id,state,cfg())&&level<max)change(level+1);};q('[data-level]').onclick=()=>LevelPicker.open({page,current:level,max,onSelect:change});q('[data-undo]').onclick=()=>{if(!history.length)return;state=history.pop();save();render();};q('[data-reset]').onclick=()=>modal('Start again?','<p>Reset this level? Your other levels stay saved.</p><button data-confirm>Reset level</button>',d=>d.querySelector('[data-confirm]').onclick=()=>{state=C.fresh(id,cfg());history=[];selected=0;lockMode=false;save();d.close();render();});q('[data-help]').onclick=()=>modal(spec.name,'<p>'+spec.help+'</p><p>30 fixed levels. Progress stays on this device and is included in Offline &amp; saves backups.</p>');
    render();
  }
  Object.keys(specs).forEach(make);
})();
