const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=require('./release_source.cjs').html(),read=name=>fs.readFileSync(name,'utf8');
const manifest=JSON.parse(read('games/word-content-manifest.json')),policy=JSON.parse(read('games/word-safety-policy.json'));
const blocked=new Set(Object.values(policy.categories).flat()),plain=value=>JSON.parse(JSON.stringify(value));
const start=source.indexOf('const WORD_CONTENT_VERSION='),end=source.indexOf('\nclass WordGame',start);
assert(start>=0&&end>start);
const helpers=['canSpell','wordBonus','hintCost'].map(name=>source.match(new RegExp('function '+name+'\\([^\\n]+'))[0]).join('\n');
const c={};vm.createContext(c);
vm.runInContext(helpers+source.slice(start,end)+';globalThis.make=makeWordLevel;globalThis.rng=wordRng;',c);
for(let i=0;i<1000;i++) {
  const level=c.make(i);assert.equal(level.targets.length,3+Math.floor(i/250));
  for(const word of [...level.targets,...level.bonus])assert(!blocked.has(word));
}
const classStart=source.indexOf('class WordGame{'),classEnd=source.indexOf('\n}',classStart)+2;
assert(classEnd>classStart);
vm.runInContext(source.slice(classStart,classEnd)+';globalThis.Game=WordGame;',c);
for(const i of [0,99,100,249,250,399,400,499,500,749,750,999]) {
  const game=new c.Game({contentVersion:2,levelIndex:i,score:9999,found:[],extras:[],revealed:{}});
  for(const word of game.level.targets)assert.equal(game.submit(word).type,'found');
  assert.equal(game.status,'won');assert.equal(new c.Game(plain(game.snapshot())).status,'won');
}
for(const n of manifest.review.words_changed_levels) {
  const old=new c.Game({contentVersion:2,levelIndex:n-1,score:543,found:['SHIT'],extras:['RAPE'],revealed:{SHIT:2}});
  assert.equal(old.levelIndex,n-1);assert.equal(old.score,543);
  assert.equal(old.found.length,0);assert.equal(old.extras.length,0);assert.deepEqual(plain(old.revealed),{});
}

// Test the shipped generator with an independent eight-direction scanner.
const search={};vm.createContext(search);
vm.runInContext('const SEARCH_BLOCKED_SEQUENCES='+JSON.stringify(policy.grid_sequences)+';const wordRng='+c.rng.toString()+';'+read('games/word-search-core.js')+';globalThis.make=makeSafeSearch;globalThis.scan=searchHasSensitiveSequence;',search);
const dirs=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
function independentScan(grid) {
  for(const word of policy.grid_sequences)for(let y=0;y<10;y++)for(let x=0;x<10;x++)for(const [dx,dy] of dirs) {
    if([...word].every((ch,i)=>grid[y+dy*i]?.[x+dx*i]===ch))return true;
  }
  return false;
}
const themes=JSON.parse(read('games/word-search-themes.json'));
for(let n=0;n<2048;n++) {
  const i=n<2000?n:[2147483647,4294967295,9007199254740991][n%3],theme=i%8;
  const puzzle=search.make(themes[theme],i,theme);
  assert.equal(puzzle.placed.length,themes[theme].length);assert(!independentScan(puzzle.grid));
  for(const {word,cells} of puzzle.placed)assert.equal(cells.map(([x,y])=>puzzle.grid[y][x]).join(''),word);
  if(n<8)assert.deepEqual(plain(puzzle),plain(search.make(themes[theme],i,theme)));
}
for(const [dx,dy] of dirs) {
  const grid=Array.from({length:10},()=>Array(10).fill('Z'));
  [...'SHIT'].forEach((ch,i)=>grid[5+dy*i][5+dx*i]=ch);assert(search.scan(grid));
}

// Exercise the real save reader, including a second reload after a changed round.
const answers=read('games/word-guess-answers.txt').trim().split(/\s+/),dictionary=read('games/word-guess-dictionary.txt').toUpperCase().trim().split(/\s+/);
const client=read('games/word-guess.js'),reader=client.slice(client.indexOf('  const defaultSave='),client.indexOf('  let data=read()'));
const store={value:null},wg={localStorage:{getItem:()=>store.value}};vm.createContext(wg);
vm.runInContext(read('games/word-guess-core.js')+';const C=WGCore,KEY="test",SNAKE_COLORS={blue:{}};const WG_ANSWERS='+JSON.stringify(answers)+';const WG_DICTIONARY=new Set('+JSON.stringify(dictionary)+');const WG_UPDATED_ANSWER_INDICES=new Set('+JSON.stringify(manifest.word_guess.replacements.map(x=>x.level-1))+');'+reader+';globalThis.readSave=read;',wg);
assert.equal(wg.readSave().vocabularyVersion,1);
for(const change of manifest.word_guess.replacements) {
  const id='l:'+String(change.level).padStart(4,'0');
  store.value=JSON.stringify({version:1,mode:'levels',level:change.level,date:'2026-10-31',rounds:{'l:0001':{guesses:['STORE'],input:'',hard:false},[id]:{guesses:[change.before],input:'',hard:false}},prefs:{color:'blue'}});
  let saved=wg.readSave();assert.equal(saved.level,change.level);assert(saved.rounds['l:0001']);assert(!saved.rounds[id]);
  saved.rounds[id]={guesses:[change.after],input:'',hard:false};store.value=JSON.stringify(saved);
  saved=wg.readSave();assert(saved.rounds[id]);assert(saved.rounds['l:0001']);
}
console.log('PASS: all 1,000 runtime Words levels, solve/save recovery, 2,048 screened search grids in eight directions, and Word Guess vocabulary migration/reload.');
