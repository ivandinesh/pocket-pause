// One instance of each board and control. Wide windows regroup existing nodes;
// compact windows restore their original positions and event handlers.
function syncResponsiveSudokuPad(){
 const page=document.getElementById('sudokuPage');if(!page?.hasAttribute('data-wide')||!sudoku)return;
 const i=sudoku.selected,locked=i==null||sudoku.solved||!!sudoku.puzzle[Math.floor(i/9)][i%9];
 for(const button of document.querySelectorAll('#sudokuNumbers button')){
  const text=button.textContent.trim();if(/^[1-9]$/.test(text))button.disabled=locked||sudoku.board.flat().filter(v=>v===+text).length>=9;
 }
}
(()=>{
 // Keep a quiet three-action footer; existing utilities retain their handlers.
 const home=document.getElementById('homePage'),utilities=document.createElement('footer'),legal=document.createElement('div');
 utilities.id='homeUtilities';utilities.setAttribute('aria-label','DoPop links');
 const about=document.createElement('dialog');about.id='aboutDopop';about.className='offline-dialog about-dopop';about.setAttribute('aria-labelledby','aboutDopopTitle');
 about.innerHTML='<h2 id="aboutDopopTitle">About DoPop</h2><p>Little games. Good moments.<br>No ads, accounts or purchases. Progress stays on this device.</p><div class="about-options"><button type="button" id="aboutAppearance">Appearance</button></div><form method="dialog"><button>Done</button></form>';
 const options=about.querySelector('.about-options');legal.id='homeLegal';legal.setAttribute('role','group');legal.setAttribute('aria-label','Privacy and licenses');options.append(legal);
 const button=document.createElement('button');button.id='aboutDopopButton';button.type='button';button.textContent='About DoPop';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',about.id);button.onclick=()=>about.showModal();
 const warning=document.createElement('p');warning.id='homeOfflineWarning';warning.setAttribute('role','status');warning.hidden=true;
 utilities.append(button,warning);home.append(utilities,about);
 about.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))button.focus();});
 // Open one sheet at a time, then return focus to the originating option.
 function leaveAbout(action,origin){
  about.close();action();
  const next=[...document.querySelectorAll('dialog[open]')].at(-1);
  if(next)next.addEventListener('close',()=>{if(home.classList.contains('active')&&!document.querySelector('dialog[open]')){about.showModal();origin.focus();}},{once:true});
 }
 document.getElementById('aboutAppearance').onclick=e=>leaveAbout(()=>document.getElementById('appearanceButton')?.click(),e.currentTarget);
 const utilityTarget=e=>e.target.closest('button')?.matches('#offlineManage,#offlineInstall,#privacyAnalyticsButton,#creditsLicensesButton')?e.target.closest('button'):null;
 about.addEventListener('click',e=>{if(utilityTarget(e))about.close();},true);
 // Bubble runs after the existing target handler has synchronously opened its sheet.
 about.addEventListener('click',e=>{const target=utilityTarget(e),next=[...document.querySelectorAll('dialog[open]')].at(-1);if(target&&next)next.addEventListener('close',()=>{if(home.classList.contains('active')&&!document.querySelector('dialog[open]')){about.showModal();target.focus();}},{once:true});});
 function organizeHome(){
  const focused=document.activeElement,guide=home.querySelector('.seo-guides'),feedback=document.getElementById('feedbackLink'),offline=document.getElementById('offlineTools');
  if(guide&&guide.parentNode!==utilities)utilities.insertBefore(guide,button);
  if(feedback&&feedback.parentNode!==utilities){feedback.textContent='Feedback';utilities.insertBefore(feedback,button);}
  const foot=home.querySelector('.home-foot');if(foot&&!foot.hidden)foot.hidden=true;
  if(offline&&offline.parentNode!==options)options.insertBefore(offline,legal);
  const privacy=document.getElementById('privacyAnalyticsButton'),credits=document.getElementById('creditsLicensesButton');
  if(privacy&&(privacy.parentNode!==legal||legal.firstElementChild!==privacy))legal.prepend(privacy);
  if(credits&&(credits.parentNode!==legal||legal.lastElementChild!==credits))legal.append(credits);
  const status=document.getElementById('offlineStatus')?.textContent||'',problem=/not ready|unavailable|interrupted|cannot be saved|Connect once/i.test(status);
  const message=problem?status:'';if(warning.textContent!==message)warning.textContent=message;warning.hidden=!problem;
  const install=document.getElementById('offlineInstall');if(install)install.hidden=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true||install.textContent==='App installed';
  if(focused?.isConnected&&focused!==document.body&&document.activeElement!==focused)focused.focus({preventScroll:true});
 }
 new MutationObserver(organizeHome).observe(home,{childList:true,subtree:true});organizeHome();
 matchMedia('(display-mode: standalone)').addEventListener('change',organizeHome);
 const wide=matchMedia('(min-width: 1024px) and (min-height: 600px)'),layouts=[];
 const boards={words:'.word-targets',sudoku:'#sudokuBoard',snake:'.canvas-shell',tetris:'.tetris-layout',wordSearch:'#searchBoard',zipLine:'#zipStage',fidget:'.fidget-stage',pac:'#pacCanvas',dotConnect:'.new-middle',merge:'.new-middle',flow:'.new-middle',untangle:'.new-middle',flood:'.new-middle',wordGuess:'.wg-middle,.wg-result,.wg-footer',lightUp:'.logic-middle',bridges:'.logic-middle',slide:'.logic-middle',binaryGrid:'.mit-board-wrap',sightline:'.mit-board-wrap',antsApart:'.ants-wrap',rotateNetwork:'.ps-board-wrap',loop:'.ps-board-wrap',colorCode:'.ps-board-wrap',pictureGrid:'.ps-board-wrap'};
 for(const [id,selector] of Object.entries(boards)){
  const page=document.getElementById(id+'Page');if(!page)continue;
  const layout=document.createElement('div'),stage=document.createElement('div'),tools=document.createElement('div');
  layout.className='play-layout';stage.className='play-stage';tools.className='play-tools';
  const stageNodes=[...page.children].filter(el=>el.matches(selector));
  const toolNodes=[...page.children].filter(el=>!el.matches('.game-heading,dialog')&&!stageNodes.includes(el));
  // Word Guess keeps its keyboard with its tiles; only secondary actions move.
  if(id==='wordGuess')toolNodes.push(page.querySelector('.wg-actions'));
  const records=[...stageNodes.map(node=>({node,target:stage})),...toolNodes.filter(Boolean).map(node=>({node,target:tools}))];
  for(const r of records){r.anchor=document.createComment('responsive position');r.node.before(r.anchor);}
  layout.append(stage,tools);layouts.push({id,page,layout,stage,records,enabled:false});
 }
 let pointer=null,frame=0;
 document.addEventListener('pointerdown',e=>{pointer={target:e.target,id:e.pointerId};},true);
 const clear=()=>pointer=null;document.addEventListener('pointerup',clear,true);document.addEventListener('pointercancel',clear,true);
 function repaint(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;window.dispatchEvent(new Event('resize'));syncResponsiveSudokuPad();});}
 function apply(){
  if(pointer){const previous=pointer;pointer=null;previous.target.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:previous.id}));}
  const focused=document.activeElement;
  for(const l of layouts){
   if(l.enabled===wide.matches)continue;l.enabled=wide.matches;
   if(l.enabled){l.page.setAttribute('data-wide','');for(const r of l.records)r.target.append(r.node);l.page.append(l.layout);}
   else{l.page.removeAttribute('data-wide');for(const r of l.records)r.anchor.before(r.node);l.layout.remove();}
  }
  if(focused?.isConnected&&focused!==document.body)focused.focus({preventScroll:true});
  repaint();
 }
 if(typeof ResizeObserver!=='undefined'){
  const sizes=new WeakMap(),observer=new ResizeObserver(entries=>{let changed=false;for(const e of entries){const size=Math.round(e.contentRect.width)+','+Math.round(e.contentRect.height);if(sizes.get(e.target)!==size){sizes.set(e.target,size);if(e.contentRect.width&&e.contentRect.height)changed=true;}}if(changed)repaint();});
  for(const l of layouts){observer.observe(l.stage);for(const r of l.records)if(r.target===l.stage)observer.observe(r.node);}
 }
 wide.addEventListener('change',apply);apply();
})();
