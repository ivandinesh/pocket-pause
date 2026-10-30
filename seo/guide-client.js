// Static guides participate in the app's update-safety handshake without registering a worker.
(() => {
 if(!('serviceWorker'in navigator))return;
 let lockTimer;
 function unlock(){clearTimeout(lockTimer);document.body.inert=false;}
 navigator.serviceWorker.addEventListener('message',event=>{
  if(event.data?.type==='DOPOP_UPDATE_CANCEL'){unlock();return;}
  if(event.data?.type!=='DOPOP_SAFE_TO_UPDATE')return;
  const safe=!document.querySelector('dialog[open]');
  if(safe){document.body.inert=true;clearTimeout(lockTimer);lockTimer=setTimeout(unlock,8000);}
  event.ports[0]?.postMessage({safe});
 });
 navigator.serviceWorker.addEventListener('controllerchange',unlock);
 addEventListener('pageshow',unlock);
})();
