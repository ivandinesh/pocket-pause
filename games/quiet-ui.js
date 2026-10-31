// Mounted only when a new game is opened. Legacy controllers are never replaced.
globalThis.DoPopQuietMount=function(id,pack,spec,env){
 'use strict';
 const C=DoPopQuietCore,key='pocketpause.v1.'+id,page=document.getElementById(id+'Page');
 const symbols=['○','△','□','◇'],nameColor=['circle','triangle','square','diamond'];
 let level=1,attempts={},state,history=[],best=null,selected=-1,choice=0,mark=false,note='',storageFailed=false,timer=null,preview=[],drag=null,suppressClick=false;
 try{const raw=JSON.parse(localStorage.getItem(key)||'null');if(C.validSave(id,raw,pack)){level=raw.level;attempts=raw.attempts;}else if(raw?.version===1&&raw.contentVersion===1){
  if(Number.isInteger(raw.level)&&raw.level>=1&&raw.level<=pack.length)level=raw.level;
  for(const [n,a]of Object.entries(raw.attempts||{}))if(/^\d+$/.test(n)&&pack[n-1]&&C.valid(id,a?.state,pack[n-1]))attempts[n]={state:a.state,history:Array.isArray(a.history)?a.history.filter(s=>C.valid(id,s,pack[n-1])).slice(-30):[],best:Number.isInteger(a.best)&&a.best>=0?a.best:null};
  note='Some saved attempts were repaired. Your other levels stay saved.';
 }else if(raw)note='This game’s saved attempt needs a fresh start. Other games are unchanged.';}catch{storageFailed=true;}
 const cfg=()=>pack[level-1],q=s=>page.querySelector(s),board=q('.quiet-board'),tools=q('.quiet-tools'),noteEl=q('.quiet-note');
 board.dataset.drag=String(['rectangles','dominoPairs','tracks'].includes(id));
 function load(){const a=attempts[level];state=a?C.copy(a.state):C.fresh(id,cfg());history=a?C.copy(a.history):[];best=a?.best??null;selected=-1;choice=0;mark=false;preview=[];}
 load();
 function active(){return page.classList.contains('active')&&!document.hidden&&!document.querySelector('dialog[open]');}
 function save(){if(document.documentElement.dataset.dopopRestoringSaves)return;attempts[level]={state:C.copy(state),history:history.slice(-30).map(C.copy),best};
  // Retain every board/result while bounding historical copies to avoid storage
  // pressure on the other games. The active attempt always keeps 30 undo steps.
  let budget=90;for(const [n,a]of Object.entries(attempts))if(+n!==level){if(C.solved(id,a.state,pack[n-1]))a.history=[];else {a.history=a.history.slice(-Math.min(a.history.length,budget));if(!budget)a.history=[];budget-=a.history.length;}}
  try{localStorage.setItem(key,JSON.stringify({version:1,contentVersion:1,level,attempts}));storageFailed=false;}catch{storageFailed=true;}}
 function act(action,player=true){
  if(player&&!active())return false;const next=C.edit(id,state,cfg(),action);if(JSON.stringify(next)===JSON.stringify(state))return false;
  if(action.type!=='settle'&&action.type!=='assisted'){history.push(C.copy(state));history=history.slice(-30);}state=next;
  if(player)globalThis.DOPopTelemetry?.play(id);
  if(C.solved(id,state,cfg())&&!state.assisted){const score=id==='pegSolitaire'?1:state.moves;best=best===null?score:Math.min(best,score);}
  note='';save();render();return true;
 }
 function change(next){save();clearTimeout(timer);timer=null;level=next;load();note='';save();render();}
 function button(label,fn,cls=''){const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.onclick=fn;return b;}
 function text(tag,cls,value){const el=document.createElement(tag);el.className=cls;el.textContent=value;return el;}
 function icon(n){const shapes=['<circle cx="20" cy="20" r="10"/>','<path d="M20 8L32 31H8Z"/>','<rect x="9" y="9" width="22" height="22" rx="3"/>','<path d="M20 6L34 20L20 34L6 20Z"/>','<path d="M9 12H31M9 20H31M9 28H31"/>','<path d="M12 9V31M20 9V31M28 9V31"/>','<circle cx="13" cy="20" r="6"/><circle cx="27" cy="20" r="6"/>','<path d="M8 28L20 10L32 28M12 28H28"/>','<path d="M8 20H32M20 8V32"/>','<circle cx="20" cy="20" r="12"/><circle cx="20" cy="20" r="4"/>'];return '<svg viewBox="0 0 40 40" aria-hidden="true">'+shapes[n%shapes.length]+'</svg>';}
 function cell(i,label,onClick){const b=button(label,onClick,'quiet-cell');b.dataset.cell=i;b.dataset.selected=String(selected===i);return b;}
 function cellName(i){return 'Row '+(Math.floor(i/cfg().w)+1)+', column '+(i%cfg().w+1);}
 function grid(cols,rows,clue=false){const el=document.createElement('div');el.className='quiet-grid'+(clue?' quiet-clue-grid':'');el.style.setProperty('--quiet-cols',cols);el.style.setProperty('--quiet-rows',rows);board.append(el);return el;}
 function tool(label,value,fn){const b=button(label,fn);b.textContent=value;tools.append(b);return b;}
 function focusCell(i){board.querySelector('[data-cell="'+i+'"]')?.focus({preventScroll:true});}
 function palette(){for(const [value,label]of [...symbols.map((v,i)=>[i,v]),[-1,'Clear']]){const b=tool('Choose '+(value<0?'clear':nameColor[value]),label,()=>{choice=value;render();});b.setAttribute('aria-pressed',String(choice===value));if(value>=0)b.classList.add('quiet-tone-'+value);}}
 function numTools(){const c=cfg();for(let n=1;n<=c.w;n++)tool('Enter '+n,String(n),()=>{if(selected>=0)act({type:'cell',i:selected,value:n});});tool('Clear selected square','Clear',()=>{if(selected>=0)act({type:'cell',i:selected,value:-1});});}
 function handleCell(i){
  if(!active())return;
  const c=cfg();
  if(id==='pegSolitaire'){if(selected>=0&&selected!==i&&act({type:'jump',a:selected,b:i})){selected=-1;render();}else {selected=state.values[i]===1?i:-1;render();}return;}
  if(id==='dominoPairs'||id==='rectangles'||id==='tracks'){
   if(selected===-1){selected=i;render();return;}
   const a=selected;selected=-1;
   if(id==='dominoPairs')act({type:'pair',a,b:i});
   if(id==='rectangles')act({type:'rectangle',a,b:i});
   if(id==='tracks'){const e=C.edges(c.w,c.h).findIndex(([x,y])=>x===a&&y===i||x===i&&y===a);if(e>=0)act({type:'edge',i:e});}
   render();return;
  }
  if(['greaterGrid','skyline','cageSums'].includes(id)){selected=i;render();return;}
  if(id==='symmetryIslands'){act({type:'cell',i,value:choice});return;}
  if(id==='fourRegions'){act({type:'cell',i:c.regions[i],value:choice});return;}
  act({type:'cell',i,mark});
 }
 function decorateGroup(b,i,group,c){
  b.dataset.group=group;
  if(group>=0){const x=i%c.w,y=Math.floor(i/c.w),v=id==='fourRegions'?c.regions:state.values;
   b.style.borderTopColor=y>0&&v[i-c.w]===group?'transparent':'';b.style.borderBottomColor=y<c.h-1&&v[i+c.w]===group?'transparent':'';b.style.borderLeftColor=x>0&&v[i-1]===group?'transparent':'';b.style.borderRightColor=x<c.w-1&&v[i+1]===group?'transparent':'';}
 }
 function renderCells(){
  const c=cfg(),v=state.values,n=c.w,outer=['tents','skyline','magnets','tracks'].includes(id),g=grid(outer?n+2:n,outer?c.h+2:c.h,outer);
  if(outer){g.style.gridTemplateColumns='30px repeat('+n+',minmax(0,1fr)) 30px';g.style.gridTemplateRows='30px repeat('+c.h+',minmax(0,1fr)) 30px';}
  const clue=(x,y)=>{
   if(id==='tents'||id==='tracks')return y===-1&&x>=0&&x<n?c.cols[x]:x===n&&y>=0&&y<c.h?c.rows[y]:'';
   if(id==='skyline')return x===-1&&y>=0&&y<c.h?c.sides[2*y]:x===n&&y>=0&&y<c.h?c.sides[2*y+1]:y===-1&&x>=0&&x<n?c.sides[2*c.h+2*x]:y===c.h&&x>=0&&x<n?c.sides[2*c.h+2*x+1]:'';
   if(id==='magnets'){if(y===-1&&x>=0&&x<n)return '+'+c.counts[0][1][x]+'\n−'+c.counts[1][1][x];if(x===n&&y>=0&&y<c.h)return '+'+c.counts[0][0][y]+'\n−'+c.counts[1][0][y];}return '';
  };
  const magnetCells=id==='magnets'?C.magnetValues(v,c):null;
  for(let y=outer?-1:0;y<(outer?c.h+1:c.h);y++)for(let x=outer?-1:0;x<(outer?n+1:n);x++){
   if(x<0||x>=n||y<0||y>=c.h){const value=clue(x,y),el=text('span','quiet-clue',value===-1?'':value);if(value!=='')el.setAttribute('aria-label',(y<0?'Column '+(x+1)+', from top':y===c.h?'Column '+(x+1)+', from bottom':'Row '+(y+1)+(x<0?', from left':', from right'))+', clue '+value);g.append(el);continue;}
   const i=y*n+x,idx=id==='magnets'?c.pairs.findIndex(p=>p.includes(i)):i,value=id==='magnets'?magnetCells[i]:v[i];
   let label=cellName(i),b=cell(i,label,()=>{if(suppressClick){suppressClick=false;return;}handleCell(idx);});
   if(id==='magnets')b.onclick=()=>handleCell(idx);
   b.dataset.state=value;b.dataset.fixed=String(c.givens?.[idx]!==undefined&&c.givens[idx]!==-1);
   if(id==='memoryPairs'){
    const shown=v[i]||state.open.includes(i)||preview.includes(i);b.setAttribute('aria-label',label+(shown?', '+['circle','triangle','square','diamond','three lines','three bars','paired circles','open triangle','cross','ring'][c.cards[i]]+(v[i]?', matched':', revealed'):', hidden card'));
    b.innerHTML=shown?icon(c.cards[i]):'<span class="quiet-card-back" aria-hidden="true"></span>';
   }else if(id==='flipLights'||id==='pegSolitaire'){
    b.innerHTML='<span class="quiet-dot" aria-hidden="true"></span>';b.setAttribute('aria-label',label+', '+(value===1?'filled':value===-2?'unavailable':'empty'));
    if(value===-2){b.dataset.void='true';b.disabled=true;}
   }else if(id==='dominoPairs'){
    b.textContent=c.numbers[i]===0?'○':'●'.repeat(c.numbers[i]);b.classList.add('quiet-pips');b.setAttribute('aria-label',label+', '+c.numbers[i]+(value>=0?', paired with '+cellName(value):', unpaired'));
    if(value>=0){b.dataset.group=Math.min(i,value);b.style.borderColor='var(--theme-accent)';}
   }else if(id==='rectangles'){
    const k=c.clues.findIndex(([pos])=>pos===i);b.textContent=k>=0?c.clues[k][1]:'';decorateGroup(b,i,value,c);b.setAttribute('aria-label',label+(k>=0?', area clue '+c.clues[k][1]:'')+(value>=0?', rectangle '+(value+1):', unassigned'));
   }else if(id==='symmetryIslands'){
    decorateGroup(b,i,value,c);b.setAttribute('aria-label',label+(value>=0?', center '+(value+1):', unassigned'));
   }else if(id==='fourRegions'){
    const region=c.regions[i],tone=v[region];decorateGroup(b,i,region,c);b.classList.add('quiet-tone-'+tone);b.textContent=tone>=0?symbols[tone]:'·';b.dataset.fixed=String(c.givens[region]!==-1);b.setAttribute('aria-label',label+', region '+(region+1)+', '+(tone<0?'uncolored':nameColor[tone])+(c.givens[region]!==-1?', fixed':''));
   }else if(id==='tents'){
    const tree=c.trees.includes(i);b.innerHTML=tree?'<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="15" r="9"/><path d="M20 24V33"/></svg>':value===1?'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 31L20 8L34 31Z M20 8V31"/></svg>':value===0?'·':'';b.setAttribute('aria-label',label+', '+(tree?'tree':value===1?'tent':value===0?'grass':'unknown'));b.disabled=tree;
   }else if(id==='slant'){
    b.innerHTML=value<0?'':'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="'+(value===0?'M2 2L38 38':'M2 38L38 2')+'"/></svg>';b.setAttribute('aria-label',label+', '+(value<0?'unknown':value===0?'backslash':'slash'));
   }else if(id==='dotSweep'){
    b.classList.add('quiet-mine');const count=C.neighbors(i,c.w,c.h,true).reduce((s,j)=>s+c.mines[j],0);b.textContent=value===0?(count||'·'):value===1?'◇':'';b.setAttribute('aria-label',label+', '+(value===0?'revealed, '+count+' neighboring dots':value===1?'marked dot':'covered'));
   }else if(id==='magnets'){
    b.textContent=value===1?'+':value===2?'−':value===0?'×':'·';b.classList.add('quiet-mark');const [a,d]=c.pairs[idx];b.style.borderColor='var(--theme-line)';if(d-a===1){if(i===a)b.style.borderRightColor='transparent';else b.style.borderLeftColor='transparent';}else{if(i===a)b.style.borderBottomColor='transparent';else b.style.borderTopColor='transparent';}b.setAttribute('aria-label',label+', domino '+(idx+1)+', '+(value===1?'positive':value===2?'negative':value===0?'neutral':'unknown'));
   }else if(['greaterGrid','skyline','cageSums'].includes(id)){
    b.append(text('span','quiet-number',value<0?'':value));b.setAttribute('aria-label',label+', '+(value<0?'empty':value)+(c.givens[i]!==-1?', fixed':''));
    if(id==='cageSums'){const k=c.cages.findIndex(g=>g.cells.includes(i)),cage=c.cages[k];b.setAttribute('aria-label',b.getAttribute('aria-label')+', cage '+(k+1)+', target '+cage.target+' '+cage.op);if(i===Math.min(...cage.cells))b.append(text('span','quiet-cage',cage.target+cage.op));for(const [property,j]of [['borderTopColor',i-n],['borderBottomColor',i+n],['borderLeftColor',x?i-1:-1],['borderRightColor',x<n-1?i+1:-1]])b.style[property]=cage.cells.includes(j)?'transparent':'var(--theme-line)';}
    if(id==='greaterGrid'){b.setAttribute('aria-label',b.getAttribute('aria-label')+c.ineq.filter(([a,d])=>a===i||d===i).map(([a,d])=>', '+(a===i?'greater than ':'less than ')+cellName(a===i?d:a)).join(''));}if(id==='greaterGrid')for(const [a,d]of c.ineq)if(a===i||d===i){const other=a===i?d:a;if(other===i+1||other===i+n){const markEl=text('span','quiet-cage',other===i+1?(a===i?'>':'<'):(a===i?'⌄':'⌃'));markEl.style.left=other===i+1?'calc(100% - 4px)':'44%';markEl.style.top=other===i+1?'35%':'calc(100% - 5px)';markEl.style.zIndex=3;markEl.setAttribute('aria-hidden','true');b.append(markEl);}}
   }else if(id==='tracks'){if(i===c.a||i===c.b)b.append(text('span','quiet-endpoint',i===c.a?'A':'B'));else b.textContent='·';b.setAttribute('aria-label',label+(i===c.a?', start A':i===c.b?', finish B':''));}
   g.append(b);
  }
  if(id==='slant'){
   const layer=document.createElement('div');layer.className='quiet-vertices';c.clues.forEach((v,i)=>{if(v<0)return;const el=text('span','quiet-vertex',v);el.style.left=(i%(n+1))/n*100+'%';el.style.top=Math.floor(i/(n+1))/c.h*100+'%';el.setAttribute('aria-label','Vertex '+(i+1)+', '+v+' lines');layer.append(el);});board.append(layer);
  }
  if(id==='symmetryIslands')c.centers.forEach(([x,y],k)=>{const dot=text('span','quiet-center quiet-center-label',k+1);dot.style.left='calc(8px + (100% - 16px) * '+((x/2+.5)/n)+')';dot.style.top='calc(8px + (100% - 16px) * '+((y/2+.5)/c.h)+')';dot.setAttribute('aria-hidden','true');board.append(dot);});
  if(id==='tracks'){
   const es=C.edges(n,c.h),paths=es.flatMap(([a,b],i)=>v[i]?['<path '+(c.fixed.includes(i)?'class="quiet-given" ':'')+'d="M'+((a%n+.5)*100/n)+' '+((Math.floor(a/n)+.5)*100/c.h)+'L'+((b%n+.5)*100/n)+' '+((Math.floor(b/n)+.5)*100/c.h)+'"/>']:[]);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.classList.add('quiet-overlay');svg.style.inset='34px';svg.style.width='calc(100% - 68px)';svg.style.height='calc(100% - 68px)';svg.innerHTML=paths.join('');svg.setAttribute('aria-hidden','true');board.append(svg);
   // Keep the counts readable without introducing another permanent control row.
   noteEl.dataset.routeCounts='Rows '+c.rows.join(' · ')+'; columns '+c.cols.join(' · ');
  }
 }
 function rays(){
  const c=cfg(),n=c.w,g=grid(n+2,n+2,true),seen=new Map();g.style.gridTemplateColumns='30px repeat('+n+',minmax(0,1fr)) 30px';g.style.gridTemplateRows='30px repeat('+n+',minmax(0,1fr)) 30px';
  for(const p of state.probes){const value=c.signature[p],label=typeof value==='number'?String(Math.min(p,value)+1):value==='H'?'●':'↩';seen.set(p,label);if(typeof value==='number')seen.set(value,label);}
  for(let y=-1;y<=n;y++)for(let x=-1;x<=n;x++){
   if((x===-1||x===n)&&(y===-1||y===n)){g.append(text('span','',''));continue;}
   if(x===-1||x===n||y===-1||y===n){const p=y===-1?x:x===n?n+y:y===n?2*n+x:3*n+y,b=button('Probe '+(p+1)+(seen.has(p)?', result '+seen.get(p):''),()=>act({type:'probe',i:p}),'quiet-probe');b.dataset.probe=p;b.textContent=seen.get(p)||'·';g.append(b);continue;}
   const i=y*n+x,b=cell(i,cellName(i)+', '+(state.values[i]?'guessed dot':'unmarked'),()=>handleCell(i));b.dataset.state=state.values[i];b.innerHTML='<span class="quiet-dot" aria-hidden="true"></span>';g.append(b);
  }
  const check=tool('Check hidden dot arrangement','Check',()=>{act({type:'check'});if(!C.solved(id,state,cfg())){note='That arrangement gives different observations. Keep exploring.';render();}});check.disabled=state.values.filter(Boolean).length!==c.balls;
 }
 function render(){
  const c=cfg(),focus=document.activeElement?.closest('[data-cell]')?.dataset.cell;
  board.replaceChildren();tools.replaceChildren();
  board.style.setProperty('--quiet-ratio',c.w/c.h);board.setAttribute('aria-label',spec.name+' play area');
  q('[data-level-value]').textContent=level;q('[data-quiet-level]').textContent='Level '+level;
  if(id==='hiddenRays')rays();else renderCells();
  if(['greaterGrid','skyline','cageSums'].includes(id))numTools();
  if(id==='symmetryIslands'){c.centers.forEach((_,k)=>{const b=tool('Assign to center '+(k+1)+', row '+(c.centers[k][1]/2+1)+', column '+(c.centers[k][0]/2+1),'● '+(k+1),()=>{choice=k;render();});b.setAttribute('aria-pressed',String(choice===k));});const erase=tool('Clear assigned cells','Clear',()=>{choice=-1;render();});erase.setAttribute('aria-pressed',String(choice===-1));}
  if(id==='fourRegions')palette();
  if(id==='dotSweep'){const b=tool('Toggle reveal or mark mode',mark?'Mark ◇':'Reveal',()=>{mark=!mark;render();});b.setAttribute('aria-pressed',String(mark));}
  const won=C.solved(id,state,c),intro=spec.instruction;
  noteEl.textContent=storageFailed?'Progress could not be saved. Export a backup before closing.':note||(won?'Complete'+(state.assisted?' · with a hint':'')+(best!==null&&id==='memoryPairs'?' · best '+best+' pairs tried':'')+'.':state.failed?'A hidden dot. Undo or retry whenever you’re ready.':intro);
  q('[data-quiet-next]').hidden=!won||level>=pack.length;q('[data-quiet-undo]').disabled=!history.length;q('[data-quiet-hint]').disabled=won;
  for(const b of board.querySelectorAll('button'))if(won)b.disabled=true;
  if(focus!==undefined&&active())focusCell(+focus);
  clearTimeout(timer);timer=null;
  if(id==='memoryPairs'&&state.open.length===2&&active())timer=setTimeout(()=>{timer=null;if(active())act({type:'settle'},false);},850);
 }
 function dialog(title,paragraphs,confirm){
  const d=document.createElement('dialog');d.append(text('h2','',title));for(const p of paragraphs)d.append(text('p','',p));
  if(confirm){const b=button('Confirm retry',()=>{d.close();confirm();});b.textContent='Retry this level';d.append(b);}
  const form=document.createElement('form');form.method='dialog';const done=document.createElement('button');done.textContent=confirm?'Keep playing':'Done';form.append(done);d.append(form);page.append(d);const focused=document.activeElement;d.addEventListener('close',()=>{d.remove();focused?.focus?.();render();},{once:true});d.showModal();
 }
 q('[data-quiet-undo]').onclick=()=>{if(!history.length)return;const assisted=state.assisted;state=history.pop();state.assisted=state.assisted||assisted;globalThis.DOPopTelemetry?.play(id);note='';save();render();};
 q('[data-quiet-reset]').onclick=()=>dialog('Retry this level?',['Start this board again. Your other levels and games stay saved.'],()=>{clearTimeout(timer);timer=null;preview=[];drag=null;state=C.fresh(id,cfg());history=[];selected=-1;note='';save();render();});
 q('[data-quiet-level]').onclick=()=>env.LevelPicker.open({page,current:level,max:pack.length,onSelect:change});
 q('[data-quiet-next]').onclick=()=>change(Math.min(pack.length,level+1));
 q('[data-quiet-help]').onclick=()=>dialog(spec.name,spec.help);
 q('[data-quiet-hint]').onclick=()=>{
  if(!active())return;const h=C.hint(id,state,cfg());
  if(h.action||h.preview)globalThis.DOPopTelemetry?.play(id);
  if(h.action){const next=C.edit(id,state,cfg(),h.action);if(JSON.stringify(next)!==JSON.stringify(state)){history.push(C.copy(state));history=history.slice(-30);state=next;state.assisted=true;save();}}
  if(h.preview){state.assisted=true;preview=h.preview;save();setTimeout(()=>{preview=[];if(active())render();},1500);}
  note=h.text;render();
 };
 page.addEventListener('keydown',e=>{
  if(!active()||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
  const cell=e.target.closest('[data-cell]'),i=cell?+cell.dataset.cell:selected,c=cfg();
  if(cell&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-c.w,ArrowDown:c.w}[e.key],j=i+delta;
   if(j>=0&&j<c.w*c.h&&(Math.abs(delta)!==1||Math.floor(j/c.w)===Math.floor(i/c.w)))focusCell(j);return;
  }
  if(['greaterGrid','skyline','cageSums'].includes(id)&&i>=0&&(/^[1-9]$/.test(e.key)||['Backspace','Delete','0'].includes(e.key))){e.preventDefault();selected=i;act({type:'cell',i,value:/^[1-9]$/.test(e.key)?+e.key:-1});}
  if(id==='slant'&&cell&&['/','\\','Backspace','Delete'].includes(e.key)){e.preventDefault();act({type:'cell',i,value:e.key==='/'?1:e.key==='\\'?0:-1});}
  if(e.key==='Escape'){selected=-1;drag=null;render();}
 });
 board.addEventListener('pointerdown',e=>{if(!active()||!['rectangles','dominoPairs','tracks'].includes(id))return;const b=e.target.closest('[data-cell]');if(b)drag={a:+b.dataset.cell,b:+b.dataset.cell,id:e.pointerId};});
 board.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const b=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]');if(b&&board.contains(b)){drag.b=+b.dataset.cell;if(id==='rectangles')for(const cell of board.querySelectorAll('[data-cell]')){const i=+cell.dataset.cell,c=cfg(),x=i%c.w,y=Math.floor(i/c.w);cell.dataset.preview=String(x>=Math.min(drag.a%c.w,drag.b%c.w)&&x<=Math.max(drag.a%c.w,drag.b%c.w)&&y>=Math.min(Math.floor(drag.a/c.w),Math.floor(drag.b/c.w))&&y<=Math.max(Math.floor(drag.a/c.w),Math.floor(drag.b/c.w)));}}});
 board.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;if(d.a===d.b)return;suppressClick=true;selected=-1;if(id==='rectangles')act({type:'rectangle',a:d.a,b:d.b});if(id==='dominoPairs')act({type:'pair',a:d.a,b:d.b});if(id==='tracks'){const edge=C.edges(cfg().w,cfg().h).findIndex(([a,b])=>a===d.a&&b===d.b||a===d.b&&b===d.a);if(edge>=0)act({type:'edge',i:edge});}render();setTimeout(()=>suppressClick=false,0);});
 board.addEventListener('pointercancel',()=>{drag=null;render();});
 document.addEventListener('visibilitychange',()=>{clearTimeout(timer);timer=null;if(active())render();});
 new MutationObserver(()=>{if(active())render();else{clearTimeout(timer);timer=null;preview=[];drag=null;}}).observe(page,{attributes:true,attributeFilter:['class']});
 page.classList.toggle('quiet-memory',id==='memoryPairs');page.classList.toggle('quiet-slant',id==='slant');page.classList.toggle('quiet-rays',id==='hiddenRays');
 page.classList.toggle('quiet-regions',['rectangles','symmetryIslands','fourRegions'].includes(id));
 addEventListener('pagehide',save);render();env.registerBoard?.(id,'.quiet-board-wrap');
 return {render,snapshot:()=>C.copy(state),get level(){return level;},get config(){return C.copy(cfg());}};
};
