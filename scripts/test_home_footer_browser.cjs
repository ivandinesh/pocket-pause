// Optional browser regression: use the same preview/Playwright setup as responsive QA.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('assert'),path=require('path'),os=require('os');
(async()=>{const browser=await chromium.launch({...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{}),headless:true}),context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.goto(process.env.DOPOP_PREVIEW_URL||'http://localhost:8765/',{waitUntil:'networkidle'});
const searchTitle=await page.locator('meta[property="og:title"]').getAttribute('content');assert.equal(await page.title(),searchTitle,'App startup must preserve the search title');
for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:width===320?568:width===390?844:900});for(const theme of ['light','dark']){
 await page.evaluate(theme=>DoPopTheme.choose(theme),theme);
 assert.equal(await page.locator('#homeUtilities a:visible,#homeUtilities button:visible').count(),3);
 assert.equal(await page.locator('#pointsChip,#globalPoints').count(),0);
 assert(!await page.locator('#privacyAnalyticsButton').isVisible());
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#aboutDopopButton').click();assert.equal(await page.locator('dialog[open]').count(),1);
 for(const id of ['aboutAppearance','privacyAnalyticsButton','creditsLicensesButton','offlineManage','offlineInstall']){
  await page.locator('#'+id).click();assert.equal(await page.locator('dialog[open]').count(),1,'one sheet at a time');assert(!await page.locator('#aboutDopop').isVisible());
  await page.keyboard.press('Escape');await page.locator('#aboutDopop[open]').waitFor();assert.equal(await page.evaluate(()=>document.activeElement.id),id);
 }
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement.id==='aboutDopopButton');
 if(width===390||width===1440)await page.screenshot({path:path.join(os.tmpdir(),`dopop-footer-${width}-${theme}.png`),fullPage:true});
}}
for(let i=0;i<3;i++)await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow')));assert.equal(await page.locator('#privacyAnalyticsButton').count(),1);
await page.evaluate(()=>document.getElementById('offlineStatus').textContent='Download interrupted. Retry in Offline & saves.');await page.locator('#homeOfflineWarning').waitFor();
await page.evaluate(()=>document.getElementById('offlineStatus').textContent='Ready for offline play · all games');await page.locator('#homeOfflineWarning').waitFor({state:'hidden'});
await page.locator('.game-card').filter({hasText:'Words'}).first().click();assert.equal(await page.title(),searchTitle,'Opening a game must preserve the search title');const points=await page.locator('#wordPoints').textContent();assert(/^\d+$/.test(points));await page.reload({waitUntil:'networkidle'});assert.equal(await page.title(),searchTitle,'Reload must preserve the search title');await page.locator('.game-card').filter({hasText:'Words'}).first().click();assert.equal(await page.locator('#wordPoints').textContent(),points);await page.locator('#wordsPage .back-button').click();
await page.locator('#homeUtilities a[href="/games"]').click();assert(new URL(page.url()).pathname.startsWith('/games'));assert.deepEqual(errors,[]);await browser.close();
console.log('PASS: three-action footer at 320/390/768/1440 in both themes, single-sheet utilities and focus return, offline warning visibility, independent Words balance/save and guide navigation.');
})().catch(error=>{console.error(error);process.exit(1)});
