// Optional browser suite; see README for Playwright and preview setup.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('fs'),assert=require('assert'),path=require('path'),os=require('os');
const catalogue=JSON.parse(fs.readFileSync(path.join(__dirname,'../seo/games.json'),'utf8'));
const targets={words:'.word-wheel',sudoku:'#sudokuBoard',snake:'#snakeCanvas',tetris:'#tetrisCanvas',wordSearch:'#searchBoard',zipLine:'#zipStage',fidget:'#fidgetCanvas',pac:'#pacCanvas',dotConnect:'#dotConnectBoard',merge:'#mergeBoard',flow:'.calm-board',untangle:'.calm-board',flood:'.calm-board',wordGuess:'.wg-board',lightUp:'.logic-board',bridges:'.logic-board',slide:'.logic-board',binaryGrid:'.mit-board',sightline:'.mit-board',antsApart:'.ants-board',rotateNetwork:'.ps-board',loop:'.ps-board',colorCode:'.ps-board',pictureGrid:'.ps-board'};
(async()=>{const b=await chromium.launch({...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{}),headless:true}),c=await b.newContext({serviceWorkers:'block'}),p=await c.newPage(),errors=[],reports=[];p.on('pageerror',e=>errors.push(e.message));const folder=process.env.DOPOP_LAYOUT_REPORT||path.join(os.tmpdir(),'dopop-responsive-matrix');fs.mkdirSync(folder,{recursive:true});await p.goto(process.env.DOPOP_PREVIEW_URL||'http://localhost:8765/',{waitUntil:'networkidle'});
for(const [width,height]of [[1440,900],[1280,720],[1920,1080],[1024,768],[768,1024],[390,844],[320,568],[844,390]]){
 await p.setViewportSize({width,height});await p.waitForTimeout(80);
 for(const theme of ['light','dark']){
  await p.emulateMedia({colorScheme:theme});await p.waitForTimeout(40);
  if(width===1440||width===390)await p.screenshot({path:folder+`/home-${width}-${theme}.png`,fullPage:true});
  for(const g of catalogue){await p.locator('.game-card').filter({has:p.locator('.card-copy b').getByText(g.name,{exact:true})}).click();await p.waitForTimeout(55);
   const data=await p.evaluate(({id,selector})=>{const page=document.getElementById(id+'Page'),e=page.querySelector(selector),r=e?.getBoundingClientRect();const controls=[...page.querySelectorAll('button')].filter(b=>b.getClientRects().length&&!b.closest('[hidden]'));return{id,width:innerWidth,height:innerHeight,theme:document.documentElement.dataset.theme,wide:page.hasAttribute('data-wide'),rect:r?{x:r.x,y:r.y,w:r.width,h:r.height}:null,canvas:[...page.querySelectorAll('canvas')].filter(c=>c.getBoundingClientRect().width>0).map(c=>({w:c.width,h:c.height})),scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,toolsBottom:Math.max(0,...controls.map(b=>b.getBoundingClientRect().bottom)),children:page.querySelectorAll('.play-layout').length};},{id:g.id,selector:targets[g.id]});reports.push(data);
   assert(data.rect&&data.rect.w>=150&&data.rect.h>=90,`collapsed ${JSON.stringify(data)}`);
   assert(data.rect.x>=-2&&data.rect.x+data.rect.w<=width+2,`board horizontal overflow ${JSON.stringify(data)}`);
   assert(data.scrollW<=width+2,`page horizontal overflow ${JSON.stringify(data)}`);
   assert(data.canvas.every(c=>c.w>0&&c.h>0),`blank canvas ${JSON.stringify(data)}`);
   if(data.wide)assert(data.scrollH<=height+2,`desktop controls require scrolling ${JSON.stringify(data)}`);
   assert.equal(data.wide,width>=1024&&height>=600);assert.equal(data.children,data.wide?1:0);
   if(['antsApart','pac','sudoku','merge'].includes(g.id)&&data.wide){const ratio={antsApart:1.5,pac:15/19,sudoku:1,merge:1}[g.id];assert(Math.abs(data.rect.w/data.rect.h-ratio)<.025,`aspect ratio ${JSON.stringify(data)}`);}
   if((width===1440||width===390)&&['antsApart','sudoku','words','tetris','pictureGrid','wordGuess'].includes(g.id))await p.screenshot({path:folder+`/${g.id}-${width}-${theme}.png`,fullPage:true});
   await p.locator('#'+g.id+'Page .back-button').first().click();
  }
 }
 console.log(`Checked ${width}×${height} in both themes`);
}
fs.writeFileSync(folder+'/report.json',JSON.stringify({errors,reports},null,2));assert.deepEqual(errors,[]);console.log('PASS: 384 game views, visible boards/canvases, horizontal fit, logical board proportions and single-instance desktop/mobile restoration; no runtime errors.');console.log('Desktop views with scrolling:',JSON.stringify(reports.filter(r=>r.wide&&r.scrollH>r.height+2).map(r=>({id:r.id,w:r.width,h:r.height,scroll:r.scrollH,controls:r.toolsBottom}))));await b.close();})().catch(e=>{console.error(e);process.exit(1)});
