const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const context={};vm.createContext(context);
vm.runInContext(fs.readFileSync('games/word-guess-core.js','utf8')+';globalThis.C=WGCore;',context);
const C=context.C,plain=x=>JSON.parse(JSON.stringify(x));
const answers=fs.readFileSync('games/word-guess-answers.txt','utf8').trim().split(/\s+/);
const dict=new Set(fs.readFileSync('games/word-guess-dictionary.txt','utf8').toUpperCase().trim().split(/\s+/));
assert.equal(answers.length,1000);assert.equal(new Set(answers).size,1000);
answers.forEach((w,i)=>{assert.match(w,/^[A-Z]{5}$/);assert(dict.has(w));assert.equal(C.answerIndex('l:'+String(i+1).padStart(4,'0')),i);});
assert.deepEqual(plain(C.feedback('APPLE','ALLEY')),[2,1,0,1,0]);
assert.deepEqual(plain(C.feedback('LEVEL','LEECH')),[2,2,1,0,0]);
assert.deepEqual(plain(C.feedback('BANAL','LLAMA')),[1,0,1,0,1]);
assert.deepEqual(plain(C.feedback('APPLE','APPLE')),[2,2,2,2,2]);
// Every answer: colored copies can never exceed the answer's multiplicity.
for(const a of answers)for(const g of [a,'EERIE','LEVEL','ARRAY','ALLEY']){
  const f=C.feedback(a,g);
  for(const ch of new Set(g))assert(f.filter((m,i)=>m>0&&g[i]===ch).length<=[...a].filter(c=>c===ch).length);
}
assert(C.submit(C.fresh(),'APPLE','ZZZZZ',dict).error);
assert(C.submit(C.fresh(),'APPLE','APP',dict).error);
let r=C.submit(C.fresh(),'APPLE','ALLEY',dict).round;
assert.equal(r.guesses.length,1);assert(C.submit(r,'APPLE','ALLEY',dict).error);
assert(C.hardError('APPLE',['ALLEY'],'ALTER')); // yellow L cannot stay in its yellow position
assert(C.hardError('LEVEL',['EERIE'],'LEACH')); // two known Es required
assert.equal(C.hardError('APPLE',['ALLEY'],'APPLE'),'');
r=C.submit(r,'APPLE','APPLE',dict).round;
assert.equal(C.outcome(r,'APPLE'),'won');assert(C.submit(r,'APPLE','BRAVE',dict).error);
assert(C.validRound(r,'APPLE',dict));assert(!C.validRound({...r,guesses:[...r.guesses,'CRANE']},'APPLE',dict));
assert.equal(C.keyMarks(r,'APPLE').L,2);
let lost=C.fresh();for(const g of ['CRANE','TOUCH','BRAVE','MIGHT','SOUND','FJORD'])lost=C.submit(lost,'APPLE',g,dict).round;
assert.equal(C.outcome(lost,'APPLE'),'lost');assert(C.submit(lost,'APPLE','APPLE',dict).error);
assert(!C.validRound({...lost,input:'A'},'APPLE',dict));
assert(Number.isNaN(C.dayNumber('2026-02-30')));
assert.equal(C.dayNumber('2026-10-26')-C.dayNumber('2026-10-25'),1);
assert.equal(C.answerIndex('l:0000'),-1);assert.equal(C.answerIndex('l:1001'),-1);
const daily=new Set();
for(let d=0;d<1000;d++){const date=new Date(Date.UTC(2026,9,26+d)).toISOString().slice(0,10);daily.add(C.answerIndex('d:'+date));}
assert.equal(daily.size,1000,'daily schedule must not repeat within 1000 days');
const rounds={};for(const date of ['2026-10-24','2026-10-25','2026-10-26']){
  const id='d:'+date;rounds[id]={guesses:[answers[C.answerIndex(id)]],input:'',hard:false};
}
const stats=C.stats(rounds,answers,'daily','2026-10-26');
assert.equal(stats.streak,3);assert.equal(stats.best,3);assert.equal(stats.wins,3);assert.equal(stats.distribution[0],3);
assert.equal(C.stats(rounds,answers,'levels','2026-10-26').played,0);
assert.equal(C.stats(rounds,answers,'daily','2026-10-28').streak,0);
// Save round trip, including unfinished entry and hard mode.
const saved=JSON.parse(JSON.stringify({guesses:['CRANE'],input:'APP',hard:true}));
assert(C.validRound(saved,'APPLE',dict));assert.equal(saved.input,'APP');
assert(!C.validRound({guesses:['<script>'],input:'',hard:false},'APPLE',dict));
const client=fs.readFileSync('pwa/client.js','utf8');
assert(client.includes("k.startsWith('pocketpause.v1.')"));
assert(client.includes('all 17 games'));
console.log('Word Guess passed: 1000 unique levels, duplicate counts, hard constraints, win/loss, daily schedule, statistics, save validation, backup namespace.');
