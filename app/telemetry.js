// Bounded application signals for the existing Faro instance. No moves, guesses or save values.
(() => {
 const catalogue=__CATALOGUE__,games=new Set(catalogue.map(g=>g.id)),paths=new Set(['/','/games',...catalogue.map(g=>'/games/'+g.slug)]),views=new Set(['home','guides',...games,...catalogue.map(g=>'guide.'+g.id)]);
 let sdk=null,view='',started=null,foreground=0,visit=null,queue=[],budget=0;const recent=new Map(),startupErrors=[];
 const host=location.hostname==='dopop.fun'||location.hostname==='www.dopop.fun';
 function allowed(){if(!host)return false;try{return localStorage.getItem('dopop.analytics.disabled')!=='1';}catch{return false;}}
 const definitions={game_open:{game:[...games],theme:['light','dark'],display:['browser','standalone']},game_start:{game:[...games]},game_visit_end:{game:[...games],outcome:['not_started','started'],duration:['under_5s','5_30s','30s_2m','over_2m'],exit:['navigation','pagehide']},guide_play:{game:[...games]},offline_ready:{},offline_error:{stage:['register','install','status','repair'],reason:['unavailable','download_failed','cache_missing']},update:{result:['accepted','deferred','failed']},backup_export:{result:['prepared','failed']},backup_import:{result:['restored','rejected','rolled_back','rollback_failed']},install:{result:['installed','prompt_accepted','prompt_dismissed']},save_error:{view:[...views],reason:['quota','blocked','unknown']}};
 function attributes(name,input){const schema=definitions[name];if(!schema)return null;const out={};for(const [key,values]of Object.entries(schema))if(values.includes(input?.[key]))out[key]=input[key];return out;}
 function deliver(item){if(!allowed()){queue=[];return;}if(!sdk){if(queue.length<40)queue.push(item);return;}try{if(item.kind==='event')sdk.api.pushEvent('dopop.'+item.name,item.attributes,'dopop',{skipDedupe:['game_open','game_start','game_visit_end'].includes(item.name)});else sdk.api.pushMeasurement({type:'dopop.'+item.name,values:item.values},{context:item.context});}catch{/* Measurement must not interrupt play. */}}
 function signal(name,input={}){if(!allowed()||budget>=200)return;const attrs=attributes(name,input);if(!attrs)return;const key=name+JSON.stringify(attrs),now=performance.now();if(['save_error','offline_error','offline_ready','update'].includes(name)){const previous=recent.get(key);if(previous!==undefined&&now-previous<60000)return;recent.set(key,now);}budget++;deliver({kind:'event',name,attributes:attrs});}
 function measure(name,value,context){if(!allowed()||budget>=200||!Number.isFinite(value)||value<0)return;budget++;deliver({kind:'measurement',name,values:{[name==='game_visit'?'foreground_ms':'duration_ms']:Math.round(value)},context});}
 function elapsed(){return foreground+(started!==null?Math.max(0,performance.now()-started):0);}
 function durationBucket(ms){return ms<5000?'under_5s':ms<30000?'5_30s':ms<120000?'30s_2m':'over_2m';}
 function finish(exit='navigation'){
  if(!visit)return;const ms=Math.min(elapsed(),86400000),outcome=visit.played?'started':'not_started';
  signal('game_visit_end',{game:view,outcome,duration:durationBucket(ms),exit});
  measure('game_visit',ms,{game:view,outcome});visit=null;foreground=0;started=null;
 }
 function begin(){foreground=0;started=!document.hidden?performance.now():null;visit={played:false};signal('game_open',{game:view,theme:document.documentElement.dataset.theme==='dark'?'dark':'light',display:matchMedia('(display-mode: standalone)').matches?'standalone':'browser'});}
 // Controllers call this only after accepting gameplay input; never send that input.
 function play(id){if(!allowed()||id!==view||!games.has(id)||!visit||document.hidden||document.querySelector('dialog[open]'))return false;if(!visit.played){visit.played=true;signal('game_start',{game:id});}return true;}
 function select(next){if(!views.has(next)||next===view)return;finish();view=next;foreground=0;started=null;if(allowed()&&sdk)try{sdk.api.setView({name:view});}catch{}if(games.has(view))begin();}
 function cleanURL(value){try{const url=new URL(value,location.origin);return url.origin===location.origin?location.origin+(paths.has(url.pathname.replace(/\/$/,'')||'/')?(url.pathname.replace(/\/$/,'')||'/'):'/'):url.origin+url.pathname;}catch{return location.origin+'/';}}
 function filter(item){if(!allowed())return null;
  function scrub(value,depth=0){if(depth>12)return undefined;if(typeof value==='string')return value.replace(/https?:\/\/[^\s"'<>]+/g,url=>cleanURL(url));if(Array.isArray(value))return value.map(v=>scrub(v,depth+1));if(value&&typeof value==='object'){const out={};for(const [key,item]of Object.entries(value))out[key]=scrub(item,depth+1);return out;}return value;}
  const safe=scrub(item);if(safe.meta?.page)safe.meta.page={url:cleanURL(safe.meta.page.url||location.href)};if(safe.meta?.user)delete safe.meta.user;return safe;
 }

 function attach(instance){sdk=instance;if(!allowed()){queue=[];return;}try{if(view)sdk.api.setView({name:view});}catch{}const waiting=queue;queue=[];waiting.forEach(deliver);for(const frame of startupErrors.splice(0))try{sdk.api.pushError(new Error('DoPop startup error'),{type:'StartupError',stackFrames:frame?[frame]:[]});}catch{}}
 // Preserve the native write/throw contract. Record only failures for DoPop saves, never keys or values.
 if(allowed()&&typeof Storage!=='undefined'){
  const write=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){try{return write.call(this,key,value);}catch(error){if(typeof key==='string'&&/^pocketpause\.(?:v1\.|zip\.progress\.v1$)/.test(key))signal('save_error',{view:views.has(view)?view:'home',reason:error?.name==='QuotaExceededError'?'quota':error?.name==='SecurityError'?'blocked':'unknown'});throw error;}};
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(started!==null)foreground+=Math.max(0,performance.now()-started);started=null;}else if(visit)started=performance.now();});
 addEventListener('pagehide',()=>finish('pagehide'));
 addEventListener('pageshow',e=>{if(e.persisted&&!visit&&games.has(view))begin();});
 function startup(event){if(!allowed()||sdk||startupErrors.length>=3)return;startupErrors.push(event.filename?{filename:cleanURL(event.filename),lineno:event.lineno||0,colno:event.colno||0,function:'startup'}:null);}
 addEventListener('error',startup);addEventListener('unhandledrejection',startup);
 document.addEventListener('click',event=>{const button=event.target.closest?.('[data-play-game]');if(button)signal('guide_play',{game:button.dataset.playGame});},true);
 document.addEventListener('DOMContentLoaded',()=>{
  const active=document.querySelector('.page.active'),path=location.pathname.replace(/\/$/,'');const guide=catalogue.find(g=>path==='/games/'+g.slug);
  select(active?(active.id==='homePage'?'home':active.id.replace(/Page$/,'')):guide?'guide.'+guide.id:'guides');
  measure('app_ready',performance.now(),{surface:active?'app':'guide'});
 },{once:true});
 globalThis.DOPopTelemetry={signal,view:select,play,attach,filter,allowed};
})();
