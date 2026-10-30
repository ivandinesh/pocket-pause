// Inspect production controllers in an isolated browser; probes are never written
// to the build. The preview stays localhost-only, where telemetry is disabled.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{}),headless:true});
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let html=require('./release_source.cjs').html();
 const marker=' reset();restoreAttempt();resize();stop();';assert.equal(html.split(marker).length,2);
 html=html.replace(marker,' globalThis.__layoutAnt={snapshot,running:()=>running};'+marker);
 const end=html.indexOf('</script>',html.indexOf('<script type="module">'));assert(end>0);
 html=html.slice(0,end)+"globalThis.__layoutTest={snake,tetris,GameSession,zip:()=>JSON.stringify(zipPathCells)};\n"+html.slice(end);
 const url=process.env.DOPOP_PREVIEW_URL||'http://localhost:8765/';assert(['localhost','127.0.0.1'].includes(new URL(url).hostname));
 await context.route(url,route=>route.fulfill({status:200,contentType:'text/html',body:html}));await page.goto(url,{waitUntil:'networkidle'});
 const games=JSON.parse(fs.readFileSync(path.join(__dirname,'../seo/games.json'),'utf8'));
 async function open(id){const game=games.find(g=>g.id===id);await page.locator('.game-card').filter({has:page.locator('.card-copy b').getByText(game.name,{exact:true})}).click();await page.waitForTimeout(100);}
 async function back(id){await page.locator('#'+id+'Page .back-button').first().click();}
 async function resize(width,height){await page.setViewportSize({width,height});await page.waitForTimeout(120);}
 const save=key=>page.evaluate(key=>localStorage.getItem(key),key);
 await open('sudoku');await page.locator('.sudoku-cell:not(.given)').first().click();await page.locator('#sudokuNumbers button').filter({hasText:/^1$/}).click();let saved=await save('pocketpause.v1.sudoku.progress');assert(saved);
 await resize(390,844);assert.equal(await save('pocketpause.v1.sudoku.progress'),saved,'Sudoku saved board survives compact transition');
 await page.locator('.sudoku-cell:not(.given):not(.user)').first().click();const nine=page.locator('#sudokuNumbers button').filter({hasText:/^9$/});assert(await nine.isEnabled(),'all nine keypad buttons work after undocking');await nine.click();saved=await save('pocketpause.v1.sudoku.progress');await resize(1440,900);assert.equal(await save('pocketpause.v1.sudoku.progress'),saved);assert.equal(await page.locator('#sudokuNumbers').count(),1);await back('sudoku');
 await open('antsApart');await page.keyboard.press('ArrowUp');await page.waitForTimeout(190);await page.locator('[data-pause]').click();const ant=await page.evaluate(()=>JSON.stringify(__layoutAnt.snapshot()));assert(JSON.parse(ant).trail.length>0);
 for(const [w,h]of [[390,844],[844,390],[1024,768],[1280,720],[1440,900]]){await resize(w,h);assert.equal(await page.evaluate(()=>JSON.stringify(__layoutAnt.snapshot())),ant,'Ant board/hearts/RNG survive reflow');assert(!await page.evaluate(()=>__layoutAnt.running()));}
 await page.locator('#antsApartPage [data-help]').click();await resize(390,844);await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>JSON.stringify(__layoutAnt.snapshot())),ant,'dialog retains input ownership during reflow');await page.locator('dialog[open]').getByRole('button',{name:'Done',exact:true}).click();await page.keyboard.press('ArrowUp');await page.waitForTimeout(110);assert(await page.evaluate(()=>__layoutAnt.running()));await page.locator('[data-pause]').click();assert.equal(await page.locator('[data-hearts]').getAttribute('aria-label'),'3 lives left');await back('antsApart');
 await resize(1440,900);await open('snake');await page.keyboard.press('ArrowDown');await page.waitForTimeout(80);await page.evaluate(()=>__layoutTest.GameSession.pause('snake'));
 const snake=()=>page.evaluate(()=>JSON.stringify({cols:__layoutTest.snake.cols,rows:__layoutTest.snake.rows,body:__layoutTest.snake.snake,score:__layoutTest.snake.score,status:__layoutTest.snake.status}));const s=await snake();
 for(const [w,h]of [[390,844],[1440,900],[1280,720]]){await resize(w,h);assert.equal(await snake(),s,'live Snake grid/body remain unchanged during paused resize');}
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(360);assert.notEqual(await snake(),s,'fresh arrow resumes the same Snake round');await back('snake');
 await open('tetris');await page.keyboard.press('ArrowLeft');await page.evaluate(()=>__layoutTest.GameSession.pause('tetris'));
 const falling=()=>page.evaluate(()=>JSON.stringify({board:__layoutTest.tetris.board,piece:__layoutTest.tetris.p,score:__layoutTest.tetris.score,level:__layoutTest.tetris.level}));const t=await falling();
 for(const [w,h]of [[390,844],[1440,900]]){await resize(w,h);assert.equal(await falling(),t,'Falling Blocks piece and board survive paused reflow');}
 await page.keyboard.press('ArrowRight');assert.notEqual(await falling(),t,'Falling Blocks arrow resumes and moves without resetting');await back('tetris');
 await open('zipLine');const anchor=page.locator('.zip-cell.anchor').filter({hasText:/^1$/}),r=await anchor.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();const zip=await page.evaluate(()=>__layoutTest.zip());await resize(390,844);await page.mouse.up();assert.equal(await page.evaluate(()=>__layoutTest.zip()),zip,'resize cancels the gesture without erasing the Number Path');await back('zipLine');
 await page.locator('#aboutDopopButton').click();for(const id of ['privacyAnalyticsButton','aboutAppearance','creditsLicensesButton','offlineManage']){assert.equal(await page.locator('#'+id).count(),1);await page.locator('#'+id).click();assert.equal(await page.locator('dialog[open]').count(),1,id+' remains reachable');await page.keyboard.press('Escape');await page.locator('#aboutDopop[open]').waitFor();}
 assert.deepEqual(errors,[]);console.log('PASS: live/paused board state, Sudoku dock/undock including digit 9, Ants trails/hearts/RNG/dialog ownership, Snake/Falling Blocks continuation, Number Path gesture cancellation and all home utilities.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
