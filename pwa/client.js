(()=>{
 const home=document.getElementById('homePage');if(!home)return;
 const panel=document.createElement('div');panel.id='offlineTools';panel.innerHTML='<p id="offlineStatus" role="status">Preparing offline play…</p><div><button id="offlineInstall">Install app</button><button id="offlineUpdate" hidden>Update ready</button><button id="offlineManage">Offline & saves</button></div>';
 home.append(panel);
 const status=document.getElementById('offlineStatus'),update=document.getElementById('offlineUpdate');
 const signal=(name,attributes)=>globalThis.DOPopTelemetry?.signal(name,attributes);
 let lastReadySignal=false;
 let savesAvailable=true;try{localStorage.setItem('dopop.storage-check','1');localStorage.removeItem('dopop.storage-check');}catch{savesAvailable=false;}
 const atHome=()=>home.classList.contains('active');
 let applyingUpdate=false,pendingReload=false,updateLockTimer=null;
 let registration=null,installPrompt=null,ready=false,lastCheck=0,updateLocked=false,controller=navigator.serviceWorker?.controller;
 function showStatus(){status.textContent=ready?(navigator.onLine?'Ready for offline play · all games':'Offline · all games available'):(navigator.onLine?'Offline files not ready yet. Open Offline & saves to retry.':'Connect once to download offline games.');if(!savesAvailable)status.textContent+=' · Progress cannot be saved in this browser.';}
 function message(worker,type,timeout=6000){return new Promise((resolve,reject)=>{if(!worker){reject(Error('No offline worker'));return;}const ch=new MessageChannel(),timer=setTimeout(()=>{ch.port1.close();reject(Error('Offline check timed out'));},timeout);ch.port1.onmessage=e=>{clearTimeout(timer);ch.port1.close();resolve(e.data);};worker.postMessage({type},[ch.port2]);});}
 async function check(){try{const response=await message(navigator.serviceWorker.controller||registration?.active,'DOPOP_STATUS');ready=response.ready===true;}catch{ready=false;}showStatus();if(ready&&!lastReadySignal)signal('offline_ready');if(!ready&&lastReadySignal)signal('offline_error',{stage:'status',reason:'cache_missing'});lastReadySignal=ready;update.hidden=!registration?.waiting;maybeUpdate();}
 async function register(){if(!('serviceWorker'in navigator)||!isSecureContext){status.textContent='Offline play needs a supported browser and a secure connection.';return;}
 try{registration=await navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'});
 const watch=worker=>{worker?.addEventListener('statechange',()=>{if(worker.state==='installed'||worker.state==='activated')check();if(worker.state==='redundant')signal('offline_error',{stage:'install',reason:'download_failed'});if(worker.state==='redundant'&&!ready){status.textContent='Download interrupted. Your existing saves are safe. Retry in Offline & saves.';}});};
 watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));await check();
 }catch{signal('offline_error',{stage:'register',reason:'download_failed'});ready=false;status.textContent='Offline download unavailable. Your games still work while this page is open.';}}
 if('serviceWorker'in navigator){navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='DOPOP_UPDATE_CANCEL'){clearTimeout(updateLockTimer);updateLocked=false;home.inert=false;return;}if(e.data?.type==='DOPOP_SAFE_TO_UPDATE'){const safe=atHome()&&!document.querySelector('dialog[open]');if(safe){updateLocked=true;home.inert=true;clearTimeout(updateLockTimer);updateLockTimer=setTimeout(()=>{updateLocked=false;home.inert=false;},8000);}e.ports[0]?.postMessage({safe});}});
 navigator.serviceWorker.addEventListener('controllerchange',()=>{const changed=!!controller;controller=navigator.serviceWorker.controller;if(changed){pendingReload=true;if(atHome()&&!document.querySelector('dialog[open]')){location.reload();return;}}check();});}
 const safeHere=()=>atHome()&&!document.hidden&&!document.querySelector('dialog[open]');
 async function applyUpdate(manual=false){
  if(applyingUpdate||!safeHere()||!registration?.waiting)return;
  applyingUpdate=true;update.disabled=true;
  try{const answer=await message(registration.waiting,'DOPOP_UPDATE');
   signal('update',{result:answer.ok?'accepted':'deferred'});if(!answer.ok){if(manual)status.textContent=answer.reason;home.inert=false;updateLocked=false;}
  }catch{signal('update',{result:'failed'});if(manual)status.textContent='Update could not be applied. Try again after closing other dopop tabs.';home.inert=false;updateLocked=false;}
  finally{applyingUpdate=false;update.disabled=false;}
 }
 function maybeUpdate(){
  if(!safeHere()||updateLocked)return;
  if(pendingReload){location.reload();return;}
  if(navigator.onLine)applyUpdate();
 }
 function refreshRelease(){
  if(document.hidden||!navigator.onLine)return;
  if(registration){if(Date.now()-lastCheck>60000){lastCheck=Date.now();registration.update().catch(()=>{});}check();}
  else register();
 }
 update.onclick=()=>applyUpdate(true);
 window.addEventListener('online',refreshRelease);window.addEventListener('offline',showStatus);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshRelease();});
 window.addEventListener('focus',refreshRelease);
 new MutationObserver(maybeUpdate).observe(home,{attributes:true,attributeFilter:['class']});
 document.addEventListener('close',maybeUpdate,true);
 setInterval(()=>{if(!document.hidden){maybeUpdate();refreshRelease();}},30000);
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
 window.addEventListener('appinstalled',()=>{signal('install',{result:'installed'});installPrompt=null;document.getElementById('offlineInstall').textContent='App installed';});
 function dialog(title,body){const d=document.createElement('dialog');d.className='offline-dialog';d.innerHTML='<h2>'+title+'</h2>'+body+'<form method="dialog"><button>Done</button></form>';document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();return d;}
 document.getElementById('offlineInstall').onclick=async()=>{if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();const choice=await prompt.userChoice;signal('install',{result:choice.outcome==='accepted'?'prompt_accepted':'prompt_dismissed'});return;}dialog('Keep dopop close.','<p><b>iPhone / iPad:</b> open this site in Safari, tap Share, then Add to Home Screen. Enable Open as Web App if offered.</p><p><b>Android:</b> open the browser menu and choose Install app or Add to Home screen.</p><p>Wait for “Ready for offline play” before disconnecting. Open the installed app once online too.</p>');};
 const allowed=DoPopSaveSafety.owned;
 const snapshot=()=>DoPopSaveSafety.snapshot(localStorage);
 const validate=DoPopSaveSafety.validate;
 async function exportSave(note){try{const blob=new Blob([JSON.stringify({app:'dopop',version:1,exportedAt:new Date().toISOString(),entries:snapshot()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='dopop-progress-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);signal('backup_export',{result:'prepared'});note.textContent='Backup prepared. Keep the downloaded JSON file somewhere safe.';}catch{signal('backup_export',{result:'failed'});note.textContent='Could not read saves. Browser storage may be unavailable.';}}
 document.getElementById('offlineManage').onclick=()=>{
 const d=dialog('Offline & saves','<p id="offlineDetail"></p><div class="offline-actions"><button data-retry>Check / retry download</button><button data-keep>Keep files on this device</button><button data-export>Export progress</button><button data-import>Import progress</button></div><input data-file type="file" accept="application/json,.json" hidden><p data-note role="status"></p><p class="offline-small">Saves stay in this browser. Clearing site data removes them. Storage protection depends on your browser; an exported backup is the safest copy. Arcade games keep their existing save behavior.</p>');
 const note=d.querySelector('[data-note]');d.querySelector('#offlineDetail').textContent=status.textContent;
 d.querySelector('[data-retry]').onclick=async()=>{note.textContent='Checking offline files…';try{if(!registration)await register();else await registration.update();if(registration?.active){const repair=await message(registration.active,'DOPOP_REPAIR',30000);if(!repair.ok)signal('offline_error',{stage:'repair',reason:'download_failed'});}await check();d.querySelector('#offlineDetail').textContent=status.textContent;note.textContent=registration?.waiting?'An update is ready. Close this panel to apply it.':ready?'All game files are cached.':'The download may still be running. Keep this page open and check again.';}catch{signal('offline_error',{stage:'repair',reason:'download_failed'});note.textContent='Could not download. Reconnect and try again; your saved progress is unchanged.';}};
 d.querySelector('[data-keep]').onclick=async()=>{try{const ok=await navigator.storage?.persist?.();note.textContent=ok?'Storage protection enabled. Keep a backup too.':'This browser has not granted storage protection. Export a backup to keep your progress safe.';}catch{note.textContent='Storage protection is unavailable here. You can still export progress.';}};
 d.querySelector('[data-export]').onclick=()=>exportSave(note);
 const input=d.querySelector('[data-file]');d.querySelector('[data-import]').onclick=()=>input.click();
 input.onchange=async()=>{const file=input.files[0];if(!file)return;try{if(file.size>2500000)throw Error('Backup is too large.');const entries=validate(JSON.parse(await file.text()));const confirm=dialog('Restore this backup?',`<p>This replaces the saved progress and preferences in this browser with ${entries.length} saved entries. Export your current progress first if you want to keep it.</p><button data-confirm>Replace progress</button>`);confirm.querySelector('[data-confirm]').onclick=async()=>{
 const action=confirm.querySelector('[data-confirm]');action.disabled=true;
 try{
  if(navigator.serviceWorker?.controller){const peers=await message(navigator.serviceWorker.controller,'DOPOP_RESTORE_CHECK');if(!peers.alone)throw Error('Close other DoPop tabs before restoring progress.');}
  const result=await DoPopSaveSafety.exclusive(()=>{
   document.documentElement.dataset.dopopRestoringSaves='true';
   const answer=DoPopSaveSafety.replace(localStorage,entries);
   if(answer.result!=='restored')delete document.documentElement.dataset.dopopRestoringSaves;
   return answer.result;
  });
  if(result==='restored'){signal('backup_import',{result:'restored'});location.reload();return;}
  signal('backup_import',{result:result==='aborted'?'rejected':result});confirm.close();
  note.textContent=result==='aborted'?'Could not read current saves. No progress was changed.':result==='rolled_back'?'Restore failed. Your previous saves were restored.':'Restore failed and recovery is incomplete. Keep your backup file and avoid further changes.';
 }catch(error){delete document.documentElement.dataset.dopopRestoringSaves;confirm.close();note.textContent=error.message||'Restore unavailable. Your progress was not changed.';}finally{action.disabled=false;}
};}catch(error){signal('backup_import',{result:'rejected'});note.textContent=error.message||'Could not read this backup.';}finally{input.value='';}};
 };
 register();
})();
