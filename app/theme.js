(() => {
  const KEY='pocketpause.v1.appearance',colors=DoPopThemeColors,root=document.documentElement,media=matchMedia('(prefers-color-scheme: dark)');
  const modes=['system','light','dark'];let mode='system',stored=true;
  function read(raw){try{const value=JSON.parse(raw);return modes.includes(value?.mode)?value.mode:'system';}catch{return 'system';}}
  try{mode=read(localStorage.getItem(KEY));}catch{stored=false;}
  let paletteSheet;
  const known=new Set();
  function register(name,value){if(known.has(name))return;known.add(name);if(!paletteSheet){const style=document.createElement('style');style.id='dopopLivePalette';document.head.append(style);paletteSheet=style.sheet;}paletteSheet.insertRule(':root[data-theme="dark"]{'+name+':'+value+'}',paletteSheet.cssRules.length);}
  const themed=(value,role)=>colors.transform(value,role,register);
  function apply(){const theme=mode==='system'?(media.matches?'dark':'light'):mode;root.dataset.theme=theme;root.style.colorScheme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0e1622':'#fbfcff');renderChoice();document.dispatchEvent(new CustomEvent('dopop-theme-change',{detail:theme}));}
  function choose(next){if(!modes.includes(next))return;mode=next;try{localStorage.setItem(KEY,JSON.stringify({mode}));stored=true;}catch{stored=false;}apply();}
  function renderChoice(){const dialog=document.getElementById('appearanceDialog');if(!dialog)return;dialog.querySelectorAll('[data-theme-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeMode===mode)));dialog.querySelector('[data-theme-note]').textContent=stored?'Match your device, or choose a look.':'This choice applies to this tab. Storage is unavailable.';}
  apply();
  media.addEventListener('change',()=>{if(mode==='system')apply();});
  addEventListener('storage',e=>{if(e.key===KEY||e.key===null){mode=read(e.key===null?null:e.newValue);apply();}});
  // Resolve neutral canvas paints when requested, retaining native gradients and save/restore.
  // White fills are surfaces only in Ants Apart and Fidget; white eyes/markers stay white.
  if(typeof CanvasRenderingContext2D!=='undefined')for(const property of ['fillStyle','strokeStyle']){
    const native=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,property);
    if(!native?.get||!native?.set)continue;
    Object.defineProperty(CanvasRenderingContext2D.prototype,property,{...native,set(value){if(root.dataset.theme==='dark'&&typeof value==='string'&&value.toLowerCase()!=='#24345b'){const parsed=colors.parse(value);if(parsed){const white=parsed[0]>245&&parsed[1]>245&&parsed[2]>245;if(white){if(this.canvas.id==='fidgetCanvas'||this.canvas.closest('.ants-game'))value='rgba(17,25,38,'+parsed[3]+')';}else{value=colors.dark(value,'canvas');if(this.canvas.id==='pacCanvas'&&property==='fillStyle'&&parsed[3]>0&&parsed[3]<.3){const c=colors.parse(value);value='rgba('+c.slice(0,3).join(',')+',0.6)';}}}}native.set.call(this,value);}});
  }
  // Inline colors are tokenized once, so later theme changes are handled by CSS.
  // Saturated tile backgrounds, palette swatches and clue colors retain their identities.
  function normalise(element){
    if(element.nodeType!==1)return;
    if(element.style)for(const property of [...element.style]){if(property.startsWith('--'))continue;const role=colors.role(property);if(role==='keep')continue;const original=element.style.getPropertyValue(property),next=themed(original,role);if(next!==original)element.style.setProperty(property,next,element.style.getPropertyPriority(property));}
    if(element.namespaceURI==='http://www.w3.org/2000/svg')for(const attr of ['fill','stroke','stop-color']){const value=element.getAttribute(attr);if(value&&!value.includes('url(')){const next=themed(value,element.tagName.toLowerCase()==='text'?'ink':element.closest('.mini-art')?'icon':'svg');if(next!==value)element.setAttribute(attr,next);}}
  }
  function scan(element){normalise(element);element.querySelectorAll?.('[style],svg [fill],svg [stroke],svg [stop-color]').forEach(normalise);}
  function mount(){
    scan(document.body);
    new MutationObserver(records=>{const nodes=new Set();for(const record of records){if(record.type==='attributes')nodes.add(record.target);else record.addedNodes.forEach(n=>{if(n.nodeType===1)nodes.add(n);});}nodes.forEach(scan);}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','fill','stroke','stop-color']});
    const home=document.getElementById('homePage');if(!home)return;
    const button=document.createElement('button');button.id='appearanceButton';button.type='button';button.className='text-button';button.textContent='Appearance';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','appearanceDialog');
    const dialog=document.createElement('dialog');dialog.id='appearanceDialog';dialog.className='appearance-dialog';dialog.setAttribute('aria-labelledby','appearanceTitle');dialog.innerHTML='<h2 id="appearanceTitle">Appearance</h2><p data-theme-note></p><div class="appearance-modes" role="group" aria-label="Color theme"></div><form method="dialog"><button>Done</button></form>';
    for(const name of modes){const b=document.createElement('button');b.type='button';b.dataset.themeMode=name;b.textContent=name[0].toUpperCase()+name.slice(1);b.onclick=()=>choose(name);dialog.querySelector('.appearance-modes').append(b);}
    document.body.append(dialog);(home.querySelector('.home-foot')||home).append(button);
    button.onclick=()=>{renderChoice();dialog.showModal();};dialog.addEventListener('close',()=>button.focus());renderChoice();
  }
  document.addEventListener('DOMContentLoaded',mount,{once:true});
  globalThis.DoPopTheme={choose,get mode(){return mode;},get theme(){return root.dataset.theme;}};
})();
