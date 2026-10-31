const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),specs=JSON.parse(fs.readFileSync(path.join(root,'games/quiet-specs.json'))),release=JSON.parse(fs.readFileSync(path.join(root,'dist/offline-release.json'))),url=process.env.DOPOP_PREVIEW_URL||'http://localhost:8765/';
assert(['localhost','127.0.0.1'].includes(new URL(url).hostname));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})}),context=await browser.newContext(),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url,{waitUntil:'networkidle'});await p.evaluate(()=>navigator.serviceWorker.ready);
 await p.waitForFunction(async release=>(await caches.keys()).includes('dopop-release-'+release),release.release);
 await p.reload({waitUntil:'networkidle'});await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
 assert.equal(await p.evaluate(()=>typeof DoPopQuietCore),'undefined');await context.setOffline(true);
 for(const spec of specs){await p.locator('[data-quiet-game="'+spec.id+'"]').click();await p.locator('#'+spec.id+'Page .quiet-cell:visible').first().waitFor();assert(!/could not open/i.test(await p.locator('#'+spec.id+'Page .quiet-note').innerText()));await p.locator('#'+spec.id+'Page .back-button').click();}
 await p.locator('[data-quiet-game="flipLights"]').click();await p.locator('#flipLightsPage .quiet-cell').first().click();const saved=await p.evaluate(()=>localStorage.getItem('pocketpause.v1.flipLights'));assert(saved);
 await p.goto(new URL('/games/skyline',url).href,{waitUntil:'networkidle'});await p.locator('#skylinePage.active .quiet-cell').first().waitFor();
 await p.locator('#skylinePage .back-button').click();await p.locator('[data-quiet-game="flipLights"]').click();await p.locator('#flipLightsPage .quiet-cell').first().waitFor();assert.equal(await p.evaluate(()=>localStorage.getItem('pocketpause.v1.flipLights')),saved);
 await p.evaluate(async()=>{const backup={app:'dopop',version:1,entries:DoPopSaveSafety.snapshot(localStorage)};await DoPopSaveSafety.prepare(backup);DoPopSaveSafety.validate(backup);});
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: real service worker installs complete release; all 16 games first-open offline; direct guide fallback, persisted board and semantic backup preparation work offline.');
})().catch(e=>{console.error(e);process.exit(1)});
