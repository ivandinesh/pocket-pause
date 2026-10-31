// End-to-end completion and reload use normal controls. Fixtures are isolated
// browser-local records; no production data, telemetry or game files are changed.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),C=require('../games/quiet-core.js');
const root=path.join(__dirname,'..'),specs=JSON.parse(fs.readFileSync(path.join(root,'games/quiet-specs.json'))),url=process.env.DOPOP_PREVIEW_URL||'http://localhost:8765/';
assert(['localhost','127.0.0.1'].includes(new URL(url).hostname));
function fixture(id,c){const s=C.fresh(id,c);let a;
 if(id==='memoryPairs'){s.values.fill(1);const cells=c.cards.flatMap((v,i)=>v===0?[i]:[]);for(const i of cells)s.values[i]=0;s.moves=c.cards.length/2-1;a=cells;}
 else if(id==='flipLights'){s.values.fill(0);for(const i of [0,...C.neighbors(0,c.w,c.h)])s.values[i]=1;a=0;}
 else if(id==='pegSolitaire'){let v=s;for(const action of c.witness.slice(0,-1))v=C.edit(id,v,c,action);Object.assign(s,v);a=c.witness.at(-1);}
 else if(id==='dotSweep'){s.values=c.mines.map(v=>v?1:0);a=c.mines.findIndex((v,i)=>!v&&!c.open.includes(i));s.values[a]=-1;}
 else if(id==='hiddenRays'){s.values=c.solution.slice();a=s.values.indexOf(1);s.values[a]=0;}
 else {s.values=c.solution.slice();if(id==='dominoPairs'){const i=0,j=s.values[i];s.values[i]=s.values[j]=-1;a=[i,j];}
  else if(id==='rectangles'){const group=0,cells=s.values.flatMap((v,i)=>v===group?[i]:[]);for(const i of cells)s.values[i]=-1;a=[Math.min(...cells),Math.max(...cells)];}
  else if(id==='tents'){a=s.values.indexOf(1);s.values[a]=-1;}
  else if(id==='tracks'){a=s.values.findIndex((v,i)=>v&&!c.fixed.includes(i));s.values[a]=0;}
  else {a=s.values.findIndex((v,i)=>!c.givens||c.givens[i]===-1);s.values[a]=-1;}}
 assert(C.valid(id,s,c),id+' fixture valid');assert(!C.solved(id,s,c),id+' fixture unfinished');return {state:s,action:a};}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})}),errors=[];
 for(const spec of specs){const id=spec.id,pack=JSON.parse(fs.readFileSync(path.join(root,'games/quiet-levels/'+id+'.json')));
  for(const level of [1,30]){
   const c=pack[level-1],f=fixture(id,c),key='pocketpause.v1.'+id,saved={version:1,contentVersion:1,level,attempts:{[level]:{state:f.state,history:[],best:null}}};
   const context=await browser.newContext({viewport:{width:level===1?390:1440,height:900},colorScheme:level===1?'light':'dark',serviceWorkers:'block'});
   await context.addInitScript(({key,saved})=>{if(!sessionStorage.seeded){localStorage.setItem(key,JSON.stringify(saved));localStorage.setItem('pocketpause.v1.snake.color','amber');localStorage.setItem('pocketpause.v1.new.2048best','4096');sessionStorage.seeded='yes';}},{key,saved});
   const p=await context.newPage();p.on('pageerror',e=>errors.push(id+': '+e.message));await p.goto(url,{waitUntil:'networkidle'});await p.waitForFunction(()=>document.querySelectorAll('.game-card').length===40);
   assert.equal(await p.evaluate(()=>typeof DoPopQuietCore),'undefined','new engines must stay deferred on home');
   const prior=await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>!DoPopGameCatalogue.some(g=>document.querySelector('[data-quiet-game="'+g.id+'"]')&&key==='pocketpause.v1.'+g.id))));
   await p.locator('[data-quiet-game="'+id+'"]').click();const page=p.locator('#'+id+'Page');await page.locator('.quiet-cell:visible').first().waitFor();
   const cell=i=>page.locator('[data-cell="'+i+'"]');
   if(id==='memoryPairs'){for(const i of f.action)await cell(i).click();}
   else if(id==='pegSolitaire'){await cell(f.action.a).click();await cell(f.action.b).click();}
   else if(id==='dominoPairs'||id==='rectangles'){await cell(f.action[0]).click();await cell(f.action[1]).click();}
   else if(id==='tracks'){const [a,b]=C.edges(c.w,c.h)[f.action];await cell(a).click();await cell(b).click();}
   else if(['greaterGrid','skyline','cageSums'].includes(id)){await cell(f.action).click();await p.keyboard.press(String(c.solution[f.action]));}
   else if(id==='symmetryIslands'){await page.getByRole('button',{name:new RegExp('^Assign to center '+(c.solution[f.action]+1)+',')}).click();await cell(f.action).click();}
   else if(id==='fourRegions'){await page.locator('.quiet-tools button').nth(c.solution[f.action]).click();await cell(c.regions.indexOf(f.action)).click();}
   else if(id==='magnets'){const value=c.solution[f.action],n=value===0?3:value;for(let k=0;k<n;k++)await cell(c.pairs[f.action][0]).click();}
   else if(id==='slant'){for(let k=0;k<=c.solution[f.action];k++)await cell(f.action).click();}
   else {await cell(f.action).click();if(id==='hiddenRays')await page.getByRole('button',{name:'Check hidden dot arrangement',exact:true}).click();}
   await page.locator('.quiet-note').filter({hasText:/Complete/}).waitFor();
   const result=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert(C.validSave(id,result,pack));assert(C.solved(id,result.attempts[level].state,c));
   await p.evaluate(async()=>{const backup={app:'dopop',version:1,entries:DoPopSaveSafety.snapshot(localStorage)};await DoPopSaveSafety.prepare(backup);DoPopSaveSafety.validate(backup);});
   assert.deepEqual(await p.evaluate(keys=>Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])),Object.keys(prior)),prior,'legacy saved records must not change');
   await p.reload({waitUntil:'networkidle'});await p.locator('[data-quiet-game="'+id+'"]').click();await page.locator('.quiet-note').filter({hasText:/Complete/}).waitFor();
   assert.equal(await page.locator('[data-level-value]').innerText(),String(level));assert.equal(await p.evaluate(()=>localStorage.getItem('pocketpause.v1.snake.color')),'amber');
   await page.locator('[data-quiet-undo]').click();assert(!/Complete/.test(await page.locator('.quiet-note').innerText()));
   await page.locator('[data-quiet-help]').click();await page.locator('dialog[open]').waitFor();await p.keyboard.press('Escape');
   if(level===1)await p.screenshot({path:path.join(require('os').tmpdir(),'dopop-new-'+id+'.png'),fullPage:true});
   if(level===1){
    await page.locator('[data-quiet-level]').click();await page.locator('dialog[open] input').fill('2');await page.locator('dialog[open]').getByRole('button',{name:'Play',exact:true}).click();assert.equal(await page.locator('[data-level-value]').innerText(),'2');
    assert.equal(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).level,key),2,'level choice saves immediately');
    await page.locator('[data-quiet-hint]').click();
    await page.locator('[data-quiet-reset]').click();await page.locator('dialog[open]').getByRole('button',{name:'Confirm retry',exact:true}).click();
    const retry=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.deepEqual(retry.attempts[2].state,C.fresh(id,pack[1]));assert(retry.attempts[1],'switch/retry preserves other levels');
    if(id==='memoryPairs')assert(await page.locator('.quiet-cell').evaluateAll(cells=>cells.every(b=>b.getAttribute('aria-label').includes('hidden card'))),'retry clears temporary hint previews');
   }
   await context.close();
  }console.log('Completed/reloaded',spec.name,'at levels 1 and 30');
 }
 // Validate a new-game backup before its UI has ever mounted; fail closed first.
 const context=await browser.newContext({serviceWorkers:'block'}),p=await context.newPage();await p.goto(url,{waitUntil:'networkidle'});
 const pack=JSON.parse(fs.readFileSync(path.join(root,'games/quiet-levels/flipLights.json'))),value={version:1,contentVersion:1,level:1,attempts:{1:{state:C.fresh('flipLights',pack[0]),history:[],best:null}}};
 const data={app:'dopop',version:1,entries:[['pocketpause.v1.flipLights',JSON.stringify(value)]]};
 assert(await p.evaluate(data=>{try{DoPopSaveSafety.validate(data);return false;}catch{return true;}},data));
 await p.evaluate(async data=>{await DoPopSaveSafety.prepare(data);DoPopSaveSafety.validate(data);},data);assert.equal(await p.evaluate(()=>typeof DoPopQuietMount),'undefined','backup preparation must not load game UI');
 // Rapid navigation can issue concurrent first opens while specifications load.
 // It must attach one controller, including its gesture/timer listeners.
 const mounts=await p.evaluate(async()=>{
  await DoPopQuietGames.open('flipLights');const mount=DoPopQuietMount;let count=0;
  DoPopQuietMount=(...args)=>{count++;return mount(...args);};
  try{await Promise.all([DoPopQuietGames.open('memoryPairs'),DoPopQuietGames.open('memoryPairs')]);return count;}finally{DoPopQuietMount=mount;}
 });assert.equal(mounts,1,'concurrent first opens attach only one controller');
 await p.locator('#memoryPairsPage [data-cell="0"]').click();
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('pocketpause.v1.memoryPairs')).attempts[1].state.open),[0]);
 assert.deepEqual(errors,[]);await context.close();await browser.close();
 console.log('PASS: all 16 games complete/undo/reload in mobile light and desktop dark; prior saves unchanged; semantic unopened-game backups; no startup engine load or runtime errors.');
})().catch(e=>{console.error(e);process.exit(1)});
