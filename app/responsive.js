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
 // Home utilities arrive from the offline, privacy and credits modules.
 const home=document.getElementById('homePage'),utilities=document.createElement('footer'),legal=document.createElement('div');
 utilities.id='homeUtilities';utilities.setAttribute('aria-label','App options');legal.id='homeLegal';legal.setAttribute('role','group');legal.setAttribute('aria-label','Privacy and licenses');utilities.append(legal);home.append(utilities);
 function organizeHome(){
  const focused=document.activeElement;
  for(const selector of ['.seo-guides','.home-foot','#offlineTools']){
   const node=home.querySelector(selector);if(node&&node.parentNode!==utilities)utilities.append(node);
  }
  const ordered=[home.querySelector('.seo-guides'),home.querySelector('.home-foot'),legal,home.querySelector('#offlineTools')].filter(Boolean);
  let cursor=utilities.firstElementChild;
  for(const node of ordered){if(node!==cursor)utilities.insertBefore(node,cursor);cursor=node.nextElementSibling;}
  const privacy=document.getElementById('privacyAnalyticsButton'),credits=document.getElementById('creditsLicensesButton');
  if(privacy&&(privacy.parentNode!==legal||legal.firstElementChild!==privacy))legal.prepend(privacy);
  if(credits&&(credits.parentNode!==legal||legal.lastElementChild!==credits))legal.append(credits);
  // Old separator text has no role in the new rows; the spacing is structural.
  const foot=home.querySelector('.home-foot');if(foot)for(const node of [...foot.childNodes])if(node.nodeType===3&&node.textContent.trim()==='·')node.remove();
  if(focused?.isConnected&&focused!==document.body&&document.activeElement!==focused)focused.focus({preventScroll:true});
 }
 new MutationObserver(organizeHome).observe(home,{childList:true,subtree:true});organizeHome();
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
