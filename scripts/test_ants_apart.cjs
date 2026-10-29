const fs = require('fs'), vm = require('vm'), assert = require('assert');

// Exercise the production controller with a small DOM and animation clock.
function environment(savedEntries = []) {
  const listeners = {}, elements = new Map(), frames = new Map(), storage = new Map(savedEntries);
  let frame = 0, picker;
  const context = new Proxy({}, {get: (target, key) => target[key] || (() => {})});
  function element() {
    return {
      textContent: '', hidden: false, disabled: false,
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
      save,restoreAttempt,validAttempt,
      get state(){return {running,won,level,cuts,player,ants,acc,walls,trail,regionCache};},
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
  assert.equal(e.get('[data-pause]').textContent, 'Resume');
  e.document.dialog = null;
  assert(!g.state.running, 'closing help must require explicit resume');
  e.get('[data-pause]').onclick(); assert(g.state.running);
  e.get('[data-level]').onclick(); assert(!g.state.running);
  e.picker().onSelect(4); e.document.dialog = null;
  assert.equal(g.state.level, 4); assert(!g.state.running);
  e.get('[data-pause]').onclick(); assert(g.state.running);
  e.document.hidden = true; e.listeners.visibilitychange();
  assert(!g.state.running); assert.equal(e.get('[data-pause]').textContent, 'Resume');
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
