const fs=require('fs'),vm=require('vm'),assert=require('assert');
const catalogue=JSON.parse(fs.readFileSync('seo/games.json','utf8')).map(({id,slug})=>({id,slug})),source=fs.readFileSync('app/telemetry.js','utf8').replace('__CATALOGUE__',JSON.stringify(catalogue));
function environment({host='www.dopop.fun',off=false,blocked=false}={}){
 let now=100,fail=false;const listeners={},events=[],measurements=[],metaViews=[];
 class Store{getItem(){if(blocked)throw Error('Blocked');return off?'1':null;}setItem(){if(fail){const error=Error('private backup contents');error.name='QuotaExceededError';throw error;}}}
 const storage=new Store(),document={hidden:false,documentElement:{dataset:{theme:'dark'}},addEventListener:(name,fn)=>listeners[name]=fn,querySelector:selector=>selector==='.page.active'?{id:'homePage'}:document.dialog?{}:null};
 const ctx={document,location:{hostname:host,origin:'https://'+host,pathname:'/',href:'https://'+host+'/?token=private#secret'},localStorage:storage,Storage:Store,URL,performance:{now:()=>now},matchMedia:()=>({matches:false}),addEventListener:(name,fn)=>listeners[name]=fn};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 const startup=[];const api={pushError:(error,options)=>startup.push({message:error.message,...options}),pushEvent:(name,attrs)=>events.push({name,attrs}),pushMeasurement:(value,options)=>measurements.push({value,options}),setView:value=>metaViews.push(value)};
 return {T:ctx.DOPopTelemetry,startup,events,measurements,metaViews,api,listeners,document,storage,time:n=>now=n,fail:v=>fail=v,optOut:v=>off=v};
}
{
 const e=environment();e.T.view('snake');e.T.attach({api:e.api});assert.equal(e.events[0].name,'dopop.game_open');assert.equal(e.events[0].attrs.game,'snake');
 e.time(1100);e.document.hidden=true;e.listeners.visibilitychange();e.time(5100);e.document.hidden=false;e.listeners.visibilitychange();e.time(6100);e.T.view('home');assert.equal(e.measurements[0].value.values.foreground_ms,2000,'hidden time is excluded');assert.equal(e.measurements[0].options.context.game,'snake');
 e.T.signal('backup_import',{result:'restored',contents:'private',guesses:['CRANE']});assert.deepStrictEqual(Object.keys(e.events.at(-1).attrs),['result']);
 for(let i=0;i<20;i++)e.T.signal('offline_error',{stage:'install',reason:'download_failed'});assert.equal(e.events.filter(x=>x.name==='dopop.offline_error').length,1);
 e.fail(true);assert.throws(()=>e.storage.setItem('pocketpause.v1.words','private words'));assert.equal(e.events.at(-1).name,'dopop.save_error');assert(!JSON.stringify(e.events).includes('private'));e.fail(false);
 const clean=e.T.filter({type:'event',meta:{page:{url:'https://www.dopop.fun/?secret=word#guess'},user:{email:'private@example.com'}},payload:{name:'session_start',attributes:{url:'https://www.dopop.fun/games/sudoku?token=private'}}});assert.equal(clean.meta.page.url,'https://www.dopop.fun/');assert(!clean.meta.user);assert.equal(clean.payload.attributes.url,'https://www.dopop.fun/games/sudoku');const error=e.T.filter({type:'exception',payload:{stacktrace:{frames:[{filename:'https://www.dopop.fun/?token=private'}]}}});assert(!JSON.stringify(error).includes('private'));assert(!JSON.stringify(error).includes('?token'));
 e.optOut(true);e.T.signal('game_open',{game:'words'});assert.equal(e.T.filter({type:'event'}),null);
}
for(const options of [{host:'localhost'},{off:true},{blocked:true}]){const e=environment(options);e.T.attach({api:e.api});e.T.view('snake');e.T.signal('offline_ready');assert.equal(e.events.length,0);}
{
 const e=environment();for(let i=0;i<100;i++){e.T.view(i%2?'words':'snake');}e.T.attach({api:e.api});assert(e.events.length+e.measurements.length<=40,'pre-SDK queue is bounded');for(let i=0;i<1000;i++)e.T.signal('guide_play',{game:'snake'});assert(e.events.length+e.measurements.length<=200,'custom event budget is bounded');
}
{const e=environment();for(let i=0;i<10;i++)e.listeners.error({filename:'https://www.dopop.fun/?private=guess',lineno:42,colno:3,error:Error('private answer')});e.T.attach({api:e.api});assert.equal(e.startup.length,3);assert(!JSON.stringify(e.startup).includes('private'));}
console.log('PASS: production/opt-out gates, bounded queues and signals, active view timing, storage-error contract, attribute allowlists and query/user redaction.');

{
 const e=environment();e.T.attach({api:e.api});e.T.view('snake');e.T.view('snake');
 e.time(2100);e.T.view('home');let ends=e.events.filter(x=>x.name==='dopop.game_visit_end');assert.equal(ends.length,1);assert.equal(ends[0].attrs.outcome,'not_started');assert.equal(ends[0].attrs.duration,'under_5s');
 e.T.view('snake');assert.equal(e.T.play('words'),false);e.document.dialog=true;assert.equal(e.T.play('snake'),false);e.document.dialog=false;
 e.document.hidden=true;assert.equal(e.T.play('snake'),false);e.document.hidden=false;
 assert(e.T.play('snake'));for(let i=0;i<100;i++)e.T.play('snake');assert.equal(e.events.filter(x=>x.name==='dopop.game_start').length,1,'one start per visit');
 e.time(7100);e.T.view('home');ends=e.events.filter(x=>x.name==='dopop.game_visit_end');assert.equal(ends[1].attrs.outcome,'started');assert.equal(ends[1].attrs.duration,'5_30s');
 e.T.view('snake');assert(e.T.play('snake'));assert.equal(e.events.filter(x=>x.name==='dopop.game_start').length,2,'returning creates a separate visit');
 e.listeners.pagehide();e.listeners.pagehide();assert.equal(e.events.filter(x=>x.name==='dopop.game_visit_end').length,3,'pagehide finishes only once');
 e.listeners.pageshow({persisted:true});assert(e.T.play('snake'));e.T.view('home');assert.equal(e.events.filter(x=>x.name==='dopop.game_visit_end').length,4,'bfcache restoration creates a fresh visit');
 assert(!JSON.stringify(e.events).includes('guess'));
}
{
 const e=environment();e.T.attach({api:e.api});e.time(0);e.T.view('antsApart');e.time(1000);e.document.hidden=true;e.listeners.visibilitychange();e.time(100000);e.document.hidden=false;e.listeners.visibilitychange();e.time(101000);e.T.view('home');assert.equal(e.measurements[0].value.values.foreground_ms,2000,'zero timestamp and hidden duration are handled');
 assert.equal(e.events.find(x=>x.name==='dopop.game_visit_end').attrs.duration,'under_5s');
}
for(const options of [{host:'localhost'},{off:true},{blocked:true}]){const e=environment(options);e.T.attach({api:e.api});e.T.view('snake');assert.equal(e.T.play('snake'),false);e.T.view('home');assert.equal(e.events.length,0);}
console.log('PASS: gameplay starts deduplicate per visit, open-only exits, wrong-game/dialog/hidden/opt-out guards, foreground duration buckets, repeated pagehide and bfcache lifecycle.');

{
 const e=environment();const safe=e.T.filter({type:'exception',payload:{type:'SyntaxError',value:'PRIVATE_SAVE JSON content',context:{backup:'PRIVATE_SAVE'},stacktrace:{frames:[{filename:'https://evil.example/PRIVATE_PATH?token=PRIVATE_SAVE',function:'PRIVATE_SAVE',lineno:42,colno:3,module:'PRIVATE_SAVE'}]}}});
 assert(!JSON.stringify(safe).includes('PRIVATE_'),'exception text, context, function/module and external paths must not leak');
 assert.equal(safe.payload.type,'SyntaxError');assert.equal(safe.payload.stacktrace.frames[0].lineno,42);assert.equal(safe.payload.stacktrace.frames[0].filename,'https://evil.example');
}
console.log('PASS: exception payload privacy keeps source coordinates without arbitrary message/context or external paths.');
