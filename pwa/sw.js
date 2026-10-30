/* Build injects immutable release metadata. No progress is stored in these caches. */
const RELEASE=__RELEASE__;
const ASSETS=__ASSETS__;
const GAME_ROUTES=__GAME_ROUTES__;
const CACHE='dopop-release-'+RELEASE;
async function verified(response,asset){
 if(!response.ok||response.type==='opaque')throw Error('Download failed: '+asset.url);
 const data=await response.clone().arrayBuffer();
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==asset.sha)throw Error('Release changed during download');
 return response;
}
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{for(const asset of ASSETS){const response=await fetch(new Request(asset.url,{cache:'reload',credentials:'same-origin'}));await cache.put(asset.url,await verified(response,asset));}}
 catch(error){await caches.delete(CACHE);throw error;}
 // Never skip waiting automatically: current games keep their running version.
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 await self.clients.claim();
 // Retain one previous complete release as a fallback; never touch unrelated caches.
 const keys=(await caches.keys()).filter(k=>k.startsWith('dopop-release-')&&k!==CACHE);
 for(const key of keys.slice(0,-1))await caches.delete(key);
})()));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(e.request.mode==='navigate'&&GAME_ROUTES.includes(url.pathname.replace(/\/$/,''))){e.respondWith(fetch(e.request).catch(async()=>{const cache=await caches.open(CACHE);return await cache.match('/')||Response.error();}));return;}
 const path=e.request.mode==='navigate'&&(url.pathname==='/'||url.pathname==='/index.html')?'/':url.pathname;
 const asset=ASSETS.find(a=>a.url===path);if(!asset)return;
 e.respondWith((async()=>{
 const cache=await caches.open(CACHE),hit=await cache.match(path);if(hit)return hit;
 try{const response=await verified(await fetch(e.request),asset);await cache.put(path,response.clone());return response;}
 catch{if(path==='/')return new Response('<!doctype html><meta name="viewport" content="width=device-width"><title>dopop</title><body style="font:18px system-ui;padding:32px;color:#33415e"><h1>Let’s reconnect.</h1><p>The offline download is missing. Open dopop once with internet to download your games again.</p><a href="/">Try again</a>',{status:503,headers:{'Content-Type':'text/html'}});return Response.error();}
 })());
});
let updateInFlight=false;
async function safeClient(client){return new Promise(resolve=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(false);},2500);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.safe===true);};client.postMessage({type:'DOPOP_SAFE_TO_UPDATE'},[channel.port2]);});}
self.addEventListener('message',e=>{
 const reply=data=>e.ports[0]?.postMessage(data);
 if(e.data?.type==='DOPOP_RESTORE_CHECK')e.waitUntil((async()=>{const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});reply({alone:clients.length===1&&clients[0].id===e.source?.id});})());
 if(e.data?.type==='DOPOP_STATUS')e.waitUntil((async()=>{try{const c=await caches.open(CACHE);const ready=(await Promise.all(ASSETS.map(a=>c.match(a.url)))).every(Boolean);reply({ready,release:RELEASE,files:ASSETS.length});}catch{reply({ready:false});}})());
 if(e.data?.type==='DOPOP_REPAIR')e.waitUntil((async()=>{try{const c=await caches.open(CACHE);for(const a of ASSETS)if(!await c.match(a.url)){const r=await verified(await fetch(new Request(a.url,{cache:'reload',credentials:'same-origin'})),a);await c.put(a.url,r);}reply({ok:true});}catch{reply({ok:false});}})());
 if(e.data?.type==='DOPOP_UPDATE')e.waitUntil((async()=>{
 if(updateInFlight){reply({ok:false,reason:'Another update check is in progress.'});return;}
 updateInFlight=true;let participants=[],activated=false;
 try{
 participants=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 const safe=participants.length>0&&(await Promise.all(participants.map(safeClient))).every(Boolean);
 const latest=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 const same=latest.length===participants.length&&latest.every(c=>participants.some(p=>p.id===c.id));
 if(!safe||!same){reply({ok:false,reason:'Return to the home screen in every open dopop tab, then try again.'});return;}
 await self.skipWaiting();activated=true;reply({ok:true});
 }catch{reply({ok:false,reason:'Update interrupted. Your current games are unchanged.'});}
 finally{if(!activated)for(const client of participants){try{client.postMessage({type:'DOPOP_UPDATE_CANCEL'});}catch{}}updateInFlight=false;}
 })());
});
