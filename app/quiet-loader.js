// Only the small shell runs at startup. Engines, styles and packs load on demand.
(() => {
 const assets=__QUIET_ASSETS__,controllers=new Map(),packs=new Map(),pending=new Map();let enginePromise=null;
 const ids=Object.keys(assets.levels),validators=globalThis.DoPopQuietBackupValidators={};
 const env={showPage,LevelPicker};
 function style(){return new Promise((resolve,reject)=>{if(document.getElementById('quietGameStyles'))return resolve();const link=document.createElement('link');link.id='quietGameStyles';link.rel='stylesheet';link.href=assets.css;link.onload=resolve;link.onerror=()=>{link.remove();reject(Error('Styles unavailable'));};document.head.append(link);});}
 function engine(){if(!enginePromise)enginePromise=Promise.all([import(assets.core),import(assets.ui),style()]).catch(error=>{enginePromise=null;throw error;});return enginePromise;}
 async function data(id){
  if(packs.has(id))return packs.get(id);
  if(!pending.has(id))pending.set(id,fetch(assets.levels[id]).then(r=>{if(!r.ok)throw Error('Levels unavailable');return r.json();}).then(pack=>{packs.set(id,pack);pending.delete(id);return pack;}).catch(error=>{pending.delete(id);throw error;}));
  return pending.get(id);
 }
 async function prepare(data){
  const needed=[...new Set((data?.entries||[]).map(row=>Array.isArray(row)?row[0]:'').filter(key=>typeof key==='string'&&key.startsWith('pocketpause.v1.')).map(key=>key.slice('pocketpause.v1.'.length)).filter(id=>ids.includes(id)))];
  if(!needed.length)return;
  // Backup preparation needs the pure core and relevant data, not any UI/styles.
  await import(assets.core);
  await Promise.all(needed.map(async id=>{const pack=await dataPack(id);validators[id]=value=>DoPopQuietCore.validSave(id,value,pack);}));
 }
 const dataPack=data;
 async function open(id){
  if(!ids.includes(id))return;const page=document.getElementById(id+'Page');showPage(id);
  if(controllers.has(id)){controllers.get(id).render();return;}
  page.querySelector('.quiet-note').textContent='Opening '+page.querySelector('h1').textContent+'…';
  try{
   const [,pack]=await Promise.all([engine(),data(id)]);validators[id]=value=>DoPopQuietCore.validSave(id,value,pack);
   if(!page.classList.contains('active'))return;
   if(!controllers.has(id)){const response=await fetch(assets.specs);if(!response.ok)throw Error('Game unavailable');const specs=await response.json(),spec=specs.find(s=>s.id===id);if(!page.classList.contains('active'))return;if(!controllers.has(id))controllers.set(id,DoPopQuietMount(id,pack,spec,env));}
   controllers.get(id).render();
  }catch{if(page.classList.contains('active')){page.querySelector('.quiet-note').textContent='This game could not open. Reconnect or finish the offline download, then try again. Your saves are unchanged.';page.querySelector('[data-quiet-retry-load]').hidden=false;}}
 }
 const template=document.getElementById('quietCards');document.querySelector('.game-grid').append(template.content.cloneNode(true));template.remove();
 for(const id of ids){const page=document.getElementById(id+'Page');page.querySelector('.back-button').onclick=()=>showPage('home');page.querySelector('[data-quiet-retry-load]').onclick=()=>open(id);document.querySelector('[data-quiet-game="'+id+'"]').onclick=()=>open(id);}
 globalThis.DoPopQuietGames={open,prepare};
 DoPopSaveSafety.prepare=prepare;
})();
