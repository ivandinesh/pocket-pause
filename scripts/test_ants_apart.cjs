const fs = require('fs'), vm = require('vm'), assert = require('assert');

// Exercise the production controller with a small DOM and animation clock.
function environment(savedEntries = []) {
  const listeners = {}, elements = new Map(), frames = new Map(), storage = new Map(savedEntries);
  let frame = 0, picker;
  const context = new Proxy({}, {get: (target, key) => target[key] || (() => {})});
  function element() {
    return {
      textContent: '', hidden: false, disabled: false, dataset:{},setAttribute(name,value){this[name]=value;},
      append() {}, remove() {}, addEventListener() {},
      getBoundingClientRect: () => ({width: 360, height: 240}),
      getContext: () => context,
      showModal() { document.dialog = this; },
      querySelector: selector => get(selector), querySelectorAll: () => []
    };
  }
  function get(selector) {
    if (!elements.has(selector)) elements.set(selector, element());
    return elements.get(selector);
  }
  const document = {
    hidden: false, dialog: null, createElement: element,
    getElementById: get,
    querySelector: selector => selector === 'dialog[open]' ? document.dialog : get(selector),
    addEventListener: (name, fn) => { listeners[name] = fn; }
  };
  const sandbox = {
    document, currentPage: 'antsApart', devicePixelRatio: 1,
    performance: {now: () => 0}, matchMedia: () => ({matches: false}),
    localStorage: {getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value)},
    requestAnimationFrame: fn => { frames.set(++frame, fn); return frame; },
    cancelAnimationFrame: id => frames.delete(id), addEventListener() {},
    // Completion and failure must not leave an automatic reset waiting to fire.
    setTimeout: () => { throw Error('Unexpected delayed board transition'); },
    LevelPicker: {open: options => { picker = options; document.dialog = {}; }}
  };
  const source = fs.readFileSync('games/ants-apart.js', 'utf8').replace(
    ' reset();restoreAttempt();resize();stop();',
    ` globalThis.game={reset,start,setDir,loop,movePlayer,moveAnts,separation,finishCut,caught,
      save,restoreAttempt,validAttempt,snapshot,chooseLevel,antsFor,speedFor,openingWalls,
      get state(){return {running,won,level,cuts,lives,player,ants,acc,walls,trail,regionCache};},
      configure(s){if(s.ants)ants=s.ants;if(s.player)player=s.player;if(s.trail){trail=s.trail;trailSet=new Set(trail.map(([x,y])=>key(x,y)));}if(s.startSafe)startSafe=s.startSafe;}
    };reset();restoreAttempt();resize();stop();`
  );
  vm.createContext(sandbox); vm.runInContext(source, sandbox);
  assert(sandbox.game, 'test hook must attach to the production controller');
  return {game: sandbox.game, sandbox, document, get, listeners, frames, storage, picker: () => picker, tick(now) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(now)); }};
}

{
  const e = environment(), g = e.game;
  g.start(); g.setDir(1, 0); e.tick(50);
  assert.equal(g.state.acc, 50);
  g.setDir(1, 0); e.tick(100);
  assert.equal(g.state.player.x, 19, 'repeated input must not postpone movement');
  e.get('[data-help]').onclick();
  assert(!g.state.running, 'help pauses immediately');
  assert.equal(e.frames.size, 0);
  assert.equal(e.get('[data-pause]').textContent, 'Paused');
  e.document.dialog = null;
  assert(!g.state.running, 'closing help must require explicit resume');
  g.setDir(1,0); assert(g.state.running);
  e.get('[data-level]').onclick(); assert(!g.state.running);
  e.picker().onSelect(4); e.document.dialog = null;
  assert.equal(g.state.level, 4); assert(!g.state.running);
  g.setDir(1,0); assert(g.state.running);
  e.document.hidden = true; e.listeners.visibilitychange();
  assert(!g.state.running); assert.equal(e.get('[data-pause]').textContent, 'Paused');
  e.document.hidden = false; assert(!g.state.running);
  g.start(); e.sandbox.currentPage = 'home'; e.tick(200);
  assert(!g.state.running, 'off-page animation stops');
}

{
  const e = environment(), g = e.game;
  g.start(); e.document.dialog = {};
  e.listeners.keydown({key: 'ArrowRight', preventDefault() { throw Error('dialog input consumed'); }});
  e.tick(100); assert(!g.state.running, 'external dialogs pause on the next frame');
  assert.equal(g.state.player.x, 18);
}

{
  const e = environment(), g = e.game;
  const cache = g.state.regionCache;
  g.moveAnts(); g.separation();
  assert.strictEqual(g.state.regionCache, cache, 'ant movement reuses region topology');
  const trail = Array.from({length: 22}, (_, i) => [18, i + 1]);
  g.configure({ants: [{x: 5, y: 5}, {x: 30, y: 5}], player: {x: 18, y: 0}, trail});
  g.finishCut();
  assert(g.state.won); assert(!g.state.running); assert.equal(g.state.cuts, 1);
  assert.equal(g.separation().left, 0);
  assert.notStrictEqual(g.state.regionCache, cache, 'completed cuts rebuild region topology');
  assert(!e.get('[data-next]').hidden);
  assert.equal(g.state.level, 1, 'completion waits for the player');
  const saved = JSON.parse(e.storage.get('pocketpause.v1.antsApartPrototype'));
  assert.equal(saved.best[1], 1, 'best scores retain the existing save key');
  e.get('[data-next]').onclick(); assert.equal(g.state.level, 2);
  assert(!g.state.won); assert(!g.state.running); assert(e.get('[data-next]').hidden);
}

{
  const e = environment(), g = e.game;
  g.state.walls.add('5,5');
  g.configure({player: {x: 18, y: 22}, startSafe: {x: 18, y: 23}, trail: [[18, 22]]});
  g.caught();
  assert.equal(g.state.walls.size, 1, 'collision preserves completed cuts');
  assert.equal(g.state.trail.length, 0); assert.equal(g.state.player.y, 23);
  assert.equal(g.state.level, 1);
  g.reset(); assert.equal(g.state.walls.size, 0, 'explicit restart still starts fresh');
}

{
  function route() {
    const g = environment().game, snapshots = [];
    for (let step = 0; step < 30; step++) {
      g.moveAnts(); snapshots.push(JSON.stringify(g.state.ants));
    }
    return snapshots;
  }
  assert.deepStrictEqual(route(), route(), 'ant movement is reproducible from the level seed');
}


{
  const e = environment(), g = e.game;
  g.start(); g.setDir(0, -1); g.movePlayer(); g.movePlayer(); g.save();
  const savedEntries = [...e.storage];
  const restored = environment(savedEntries), other = restored.game;
  assert.equal(JSON.stringify(other.state.player), JSON.stringify(g.state.player));
  assert.equal(JSON.stringify(other.state.trail), JSON.stringify(g.state.trail));
  assert(!other.state.running, 'restored board waits for Resume');
  assert(other.validAttempt(JSON.parse(e.storage.get('pocketpause.v1.antsApartPrototype')).attempts[1]));
  // RNG state must continue exactly, rather than restart its decision stream.
  g.moveAnts(); other.moveAnts();
  assert.equal(JSON.stringify(other.state.ants), JSON.stringify(g.state.ants));
  e.get('[data-level]').onclick(); e.picker().onSelect(3); e.document.dialog = null;
  e.get('[data-level]').onclick(); e.picker().onSelect(1); e.document.dialog = null;
  assert.equal(g.state.trail.length, 2, 'switching levels preserves the unfinished board');
  const beforeRestore = e.storage.get('pocketpause.v1.antsApartPrototype');
  e.document.documentElement = {dataset:{dopopRestoringSaves:'true'}};
  g.reset(); g.save();
  assert.equal(e.storage.get('pocketpause.v1.antsApartPrototype'), beforeRestore, 'exit writes must not overwrite an imported backup');
  delete e.document.documentElement.dataset.dopopRestoringSaves;
  const broken = JSON.parse(savedEntries[0][1]);
  broken.attempts[1].player.x = -1;
  const invalid = environment([['pocketpause.v1.antsApartPrototype', JSON.stringify(broken)]]);
  assert.equal(invalid.game.state.player.y, 23, 'malformed attempts fall back to a fresh board');
  const legacy = environment([['pocketpause.v1.antsApartPrototype', JSON.stringify({level:4,best:{1:2}})]]);
  legacy.game.save();
  const migrated = JSON.parse(legacy.storage.get('pocketpause.v1.antsApartPrototype'));
  assert.equal(migrated.level,4); assert.equal(migrated.best[1],2); assert.equal(migrated.version,2);
}

console.log('PASS: Ants Apart pause/resume, dialog and page ownership, held input, explicit progression, collision recovery, topology cache, deterministic movement, saved scores, attempt migration and paused trail restoration.');

for(const [key,dx,dy] of [['ArrowUp',0,-1],['ArrowDown',0,1],['ArrowLeft',-1,0],['ArrowRight',1,0],['w',0,-1],['a',-1,0],['s',0,1],['d',1,0]]){
 const e=environment(),g=e.game;g.configure({player:{x:18,y:12},ants:[{x:3,y:3},{x:30,y:3}]});
 e.listeners.keydown({key,repeat:true,preventDefault(){}});assert(!g.state.running,'held key does not start');
 e.listeners.keydown({key,target:{closest:()=>({})},preventDefault(){}});assert(!g.state.running,'editable arrows do not start');
 e.listeners.keydown({key,repeat:false,preventDefault(){}});assert(g.state.running,'fresh direction starts');
 e.tick(50);e.tick(100);assert.equal(g.state.player.x,18+dx);assert.equal(g.state.player.y,12+dy);
}
console.log('PASS: all Arrow/WASD directions start and move on the first input; held and editable keys stay paused.');

// Pin the first twelve boards: adding levels must never renumber older saves.
const originalAnts=[[[23,7],[17,4]],[[25,7],[5,18]],[[28,8],[3,17]],[[30,9],[10,6],[4,18]],[[32,10],[18,12],[22,15]],[[4,11],[26,19],[11,11]],[[7,12],[4,8],[30,7],[18,6]],[[9,13],[19,4],[25,16],[27,11]],[[11,14],[19,3],[8,18],[30,14]],[[14,15],[27,9],[11,9],[21,8],[14,3]],[[16,16],[4,16],[15,10],[28,16],[23,8]],[[18,16],[12,5],[4,7],[28,3],[32,13]]];
const levelEnvironment=l=>environment([['pocketpause.v1.antsApartPrototype',JSON.stringify({level:l,best:{1:2,12:4}})]]);
const boardSignatures=new Set();let movementStates=0,certifiedCuts=0;
function cellsWithout(walls){
 const visited=new Set(),regions=[];
 for(let y=1;y<23;y++)for(let x=1;x<35;x++){
  const key=x+','+y;if(walls.has(key)||visited.has(key))continue;
  const cells=[],stack=[[x,y]];visited.add(key);
  while(stack.length){const p=stack.pop();cells.push(p);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=p[0]+dx,ny=p[1]+dy,k=nx+','+ny;if(nx<1||nx>34||ny<1||ny>22||walls.has(k)||visited.has(k))continue;visited.add(k);stack.push([nx,ny]);}}
  regions.push(cells);
 }
 return regions;
}
// Construct straight, ant-free cuts with safe endpoints. This certifies opening
// geometry; moving-ant timing and human difficulty still need playtesting.
function certifyOpening(g,l){
 while(!g.state.won){
  const before=g.separation().counts.filter(n=>n>0).length,ants=new Set(g.state.ants.map(a=>a.x+','+a.y));let chosen;
  for(const vertical of [true,false])for(let axis=1;axis<(vertical?35:23);axis++){
   let run=[];
   const consider=()=>{
    if(!run.length||run.some(p=>ants.has(p.join(','))))return;
    const proposed=new Set(g.state.walls);run.forEach(p=>proposed.add(p.join(',')));
    const occupied=cellsWithout(proposed).filter(c=>c.some(p=>ants.has(p.join(',')))).length;
    if(occupied>before&&(!chosen||run.length<chosen.trail.length))chosen={trail:run.slice(),vertical};
   };
   for(let along=1;along<=(vertical?23:35);along++){
    const p=vertical?[axis,along]:[along,axis];
    if(along===(vertical?23:35)||g.state.walls.has(p.join(','))){consider();run=[];}else run.push(p);
   }
  }
  assert(chosen,`level ${l} has an ant-free straight separation route`);
  const a=chosen.trail[0],b=chosen.trail.at(-1),vertical=chosen.vertical,start={x:a[0]-(vertical?0:1),y:a[1]-(vertical?1:0)},end={x:b[0]+(vertical?0:1),y:b[1]+(vertical?1:0)};
  g.configure({player:end,startSafe:start,trail:chosen.trail});g.finishCut();certifiedCuts++;assert(g.validAttempt(g.snapshot()),`level ${l}: certified cut produces a valid saved board`);
  assert(g.state.cuts<=g.state.ants.length-1,'each certified cut separates occupied regions');
 }
 assert.equal(g.separation().left,0);
 assert(!g.state.running);
}
for(let l=1;l<=36;l++){
 const e=levelEnvironment(l),g=e.game;
 assert.equal(g.state.ants.length,g.antsFor(l),`level ${l} generates every ant`);
 assert.equal(g.state.walls.size,g.openingWalls(l).size);
 assert.equal(g.separation().comps.length,1,`level ${l} starts with one connected field`);
 assert(!g.state.won);assert(g.state.ants.every(a=>!g.state.walls.has(a.x+','+a.y)));
 assert(g.speedFor(l)>=178&&g.speedFor(l)<=293);
 if(l<=12){assert.equal(JSON.stringify(g.state.ants.map(a=>[a.x,a.y])),JSON.stringify(originalAnts[l-1]));assert.equal(g.speedFor(l),300-l*7);assert.equal(g.state.walls.size,0);}
 for(let i=0;i<g.state.ants.length;i++)for(let j=0;j<i;j++)assert(Math.abs(g.state.ants[i].x-g.state.ants[j].x)+Math.abs(g.state.ants[i].y-g.state.ants[j].y)>6);
 const signature=JSON.stringify({ants:g.state.ants,walls:[...g.state.walls]});assert(!boardSignatures.has(signature));boardSignatures.add(signature);
 const repeat=levelEnvironment(l).game;assert.equal(JSON.stringify(repeat.state.ants),JSON.stringify(g.state.ants));
 certifyOpening(repeat,l);
 for(let step=0;step<600;step++){
  g.moveAnts();movementStates++;
  const positions=g.state.ants.map(a=>a.x+','+a.y);
  assert.equal(new Set(positions).size,positions.length,`level ${l}: ants cannot stack at step ${step}`);
  assert(g.state.ants.every(a=>a.x>0&&a.x<35&&a.y>0&&a.y<23&&!g.state.walls.has(a.x+','+a.y)));
 }
 g.save();const saved=JSON.parse(e.storage.get('pocketpause.v1.antsApartPrototype'));assert(g.validAttempt(saved.attempts[l],l));
 assert.equal(saved.best[1],2);assert.equal(saved.best[12],4);
 const restored=environment([...e.storage]).game;assert.equal(restored.state.level,l);assert.equal(JSON.stringify(restored.state.ants),JSON.stringify(g.state.ants));assert.equal(JSON.stringify([...restored.state.walls]),JSON.stringify([...g.state.walls]));
 g.moveAnts();restored.moveAnts();assert.equal(JSON.stringify(restored.state.ants),JSON.stringify(g.state.ants),'continued ant RNG survives reload');
}
{
 const e=levelEnvironment(36),g=e.game;certifyOpening(g,36);assert(e.get('[data-next]').hidden,'final level has no unavailable Next');
 for(const invalid of [0,37,1.5,NaN]){g.chooseLevel(invalid);assert.equal(g.state.level,36);}
 const restored=environment([...e.storage]).game;assert(restored.state.won,'completed new boards restore');
 const boundary=levelEnvironment(12);certifyOpening(boundary.game,12);boundary.get('[data-next]').onclick();assert.equal(boundary.game.state.level,13);assert.equal(boundary.game.state.ants.length,6);assert(!boundary.game.state.running);
}
console.log(`PASS: 36 unique connected opening layouts, ${certifiedCuts} constructive separation cuts, ${movementStates} legal non-overlapping ant states, original 12 layout/speed fixtures, all-level saves/RNG, level 12→13 progression and final-level bounds.`);

{
 const e=environment();e.game.configure({ants:[{x:10,y:10},{x:10,y:10}]});e.game.save();
 const repaired=environment([...e.storage]).game;assert.equal(repaired.state.ants.length,2,'older stacked ants do not discard the saved board');
 repaired.moveAnts();assert.notEqual(JSON.stringify(repaired.state.ants[0]),JSON.stringify(repaired.state.ants[1]),'older stacked ants can move apart');
}

{
 const e=environment(),g=e.game;assert.equal(g.state.lives,3);assert.equal(e.get('[data-hearts]')['aria-label'],'3 lives left');
 // Player walking into an ant costs exactly one heart before entering its cell.
 g.configure({ants:[{x:18,y:22},{x:30,y:5}]});g.setDir(0,-1);g.movePlayer();
 assert.equal(g.state.lives,2);assert.equal(g.state.player.y,23);assert(!g.state.running);assert.equal(g.state.trail.length,0);assert.equal(e.get('[data-hearts]')['aria-label'],'2 lives left');
 const restored=environment([...e.storage]);assert.equal(restored.game.state.lives,2);assert(!restored.game.state.running);
 // Three contacts exhaust the attempt; arrows and ant ticks cannot restart it.
 g.setDir(0,-1);g.movePlayer();assert.equal(g.state.lives,1);
 g.setDir(0,-1);g.movePlayer();assert.equal(g.state.lives,0);assert(!g.state.running);assert.equal(e.get('[data-restart]').textContent,'Retry level');
 const dead=environment([...e.storage]);assert.equal(dead.game.state.lives,0);dead.game.setDir(1,0);dead.game.start();dead.game.moveAnts();assert(!dead.game.state.running);assert.equal(dead.game.state.lives,0);
 e.get('[data-help]').onclick();e.document.dialog=null;assert(e.get('.ants-note').textContent.includes('No hearts left'));
 e.get('[data-restart]').onclick();assert.equal(g.state.lives,3);assert(!g.state.running);assert.equal(g.state.cuts,0);assert.equal(e.get('[data-restart]').textContent,'Restart');
 g.chooseLevel(2);assert.equal(g.state.lives,3);g.chooseLevel(1);assert.equal(g.state.lives,3,'retry persists replenished hearts');
 for(const invalid of [-1,4,1.5,null])assert(!g.validAttempt({...g.snapshot(),lives:invalid}));
 assert(!g.validAttempt({...g.snapshot(),lives:0,readyForInput:true}));
 const old=g.snapshot();delete old.lives;assert(g.validAttempt(old));
 const legacy=environment([['pocketpause.v1.antsApartPrototype',JSON.stringify({version:2,level:1,best:{1:2},attempts:{1:old}})]]);assert.equal(legacy.game.state.lives,3,'older attempts gain three hearts');assert.equal(JSON.stringify(legacy.game.state.player),JSON.stringify(old.player));
}
for(const onPlayer of [true,false]){
 const e=environment(),g=e.game;
 if(onPlayer){g.configure({ants:[{x:18,y:21},{x:30,y:5}],player:{x:18,y:22},trail:[[18,22]],startSafe:{x:18,y:23}});for(const k of ['17,21','19,21','18,20'])g.state.walls.add(k);}
 else{g.configure({ants:[{x:18,y:20},{x:30,y:5}],player:{x:19,y:22},trail:[[18,22],[18,21],[19,21],[19,22]],startSafe:{x:18,y:23}});for(const k of ['17,20','19,20','18,19'])g.state.walls.add(k);}
 const walls=[...g.state.walls];g.start();g.moveAnts();assert.equal(g.state.lives,onPlayer?2:3,onPlayer?'ant reaching player costs one heart':'an eaten trail keeps every heart');assert.equal(g.state.running,!onPlayer,'a lost trail waits for direction while ants keep moving');assert.equal(g.state.player.y,23);assert.equal(g.state.trail.length,0);assert.deepEqual([...g.state.walls],walls,'completed lines survive');assert(g.validAttempt(g.snapshot()));
 g.chooseLevel(2);assert.equal(g.state.lives,3);g.chooseLevel(1);assert.equal(g.state.lives,onPlayer?2:3,'hearts persist per board');
}
console.log('PASS: direct player contact costs one heart while eaten trails cost none; safe recovery preserves lines; zero hearts blocks play and survives dialogs/reload; retry refills; legacy saves and per-level heart counts migrate safely.');

{
 const e=environment(),g=e.game;
 g.configure({ants:[{x:17,y:19},{x:30,y:5}],player:{x:19,y:20},trail:[[18,19],[18,20],[19,20]],startSafe:{x:18,y:18}});
 for(const k of ['18,18','16,19','17,18','17,20'])g.state.walls.add(k);
 const walls=[...g.state.walls];g.start();g.moveAnts();
 assert.equal(g.state.lives,3);assert.equal(g.state.player.x,18);assert.equal(g.state.player.y,18,'return to this cut’s exact starting point on a completed line');
 assert.equal(g.state.trail.length,0);assert.deepEqual([...g.state.walls],walls);assert(g.validAttempt(g.snapshot()));
 const restored=environment([...e.storage]).game;assert.equal(restored.state.lives,3);assert.equal(restored.state.player.x,18);assert.equal(restored.state.player.y,18);assert.equal(restored.state.trail.length,0);
 g.setDir(0,-1);g.movePlayer();assert.equal(g.state.player.y,17,'fresh direction starts the next cut');assert.equal(g.state.trail.length,1);assert.equal(g.state.lives,3);
}
console.log('PASS: eaten line returns to its exact start on completed paths, preserves hearts and completed lines through reload, and accepts a fresh direction.');
