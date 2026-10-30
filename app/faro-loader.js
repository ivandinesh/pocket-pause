(function(){
 var host = window.location.hostname;
 if (host !== 'dopop.fun' && host !== 'www.dopop.fun') return;
 try { if (localStorage.getItem('dopop.analytics.disabled') === '1') return; } catch (_) { return; }
 var pending=false,attempts=0;
 function load(){
  if(pending||attempts>=2||!navigator.onLine||!DOPopTelemetry.allowed())return;pending=true;attempts++;
  var script=document.createElement('script');script.async=true;
  script.src='https://unpkg.com/@grafana/faro-web-sdk@2.13.0/dist/bundle/faro-web-sdk.iife.js';
  script.onload=function(){try{
   var sdk=window.GrafanaFaroWebSdk;if(!sdk||!sdk.initializeFaro||!sdk.getWebInstrumentations)return;
   var excluded=[sdk.UserActionInstrumentation,sdk.NavigationInstrumentation,sdk.FrustrationInstrumentation].filter(function(type){return typeof type==='function';});
   var instrumentations=sdk.getWebInstrumentations({captureConsole: false}).filter(function(item){return !excluded.some(function(type){return item instanceof type;});});
   var faro=sdk.initializeFaro({
    url:'https://faro-collector-prod-us-central-0.grafana.net/collect/0bcb5bd4ff070ee3b3f5631842db8da4',
    app:{name:'dopop',version:__VERSION__,environment:'production'},
    sessionTracking:{samplingRate: 1.0,persistent:false},
    instrumentations:instrumentations,
    pageTracking:{page:{url:location.origin+location.pathname}},
    webVitalsInstrumentation:{reportAllChanges:false,trackAttributionSources:false},
    beforeSend:DOPopTelemetry.filter
   });DOPopTelemetry.attach(faro);
  }catch(_){/* Optional monitoring never blocks the games. */}};
  script.onerror=function(){pending=false;};document.head.appendChild(script);
 }
 function schedule(){if('requestIdleCallback'in window)requestIdleCallback(load,{timeout:2000});else setTimeout(load,0);}
 if(document.readyState==='complete')schedule();else addEventListener('load',schedule,{once:true});
 addEventListener('online',schedule);
})();
