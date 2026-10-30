// Backup boundaries and recovery are independent of game rules and scoring.
(() => {
 const generationKey='dopop.save-generation';
 const prefix='pocketpause.v1.',registry=new Map(),integer=(v,max=1000,min=1)=>Number.isInteger(v)&&v>=min&&v<=max,object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const add=(keys,test)=>keys.split(' ').forEach(k=>registry.set(prefix+k,test));
 const colors=['blue','green','amber','pink','graphite','purple','red','teal'];
 add('sound new.music',v=>typeof v==='boolean');
 add('snake.color tetris.color pac.color fidget.color',v=>colors.includes(v));
 add('new.2048color',v=>colors.includes(v));
 add('snake.shape tetris.shape pac.shape new.2048shape',v=>['round','square'].includes(v));
 add('fidget.type',v=>['tri','bar','gear','ring','gears'].includes(v));
 add('snake.level',v=>integer(v,15));add('tetris.startLevel',v=>integer(v,20));
 add('sudoku.level pac.level',v=>integer(v));add('search.level',v=>integer(v,999,0));add('new.2048best',v=>Number.isFinite(v)&&v>=0);
 add('appearance',v=>object(v)&&['system','light','dark'].includes(v.mode));
 const matrix=v=>Array.isArray(v)&&v.length===9&&v.every(r=>Array.isArray(r)&&r.length===9&&r.every(n=>integer(n,9,0)));
 add('sudoku.progress',v=>object(v)&&matrix(v.puzzle)&&matrix(v.solution)&&matrix(v.board)&&Array.isArray(v.notes)&&v.notes.length===81&&v.notes.every(a=>Array.isArray(a)&&a.length<=9&&a.every(n=>integer(n,9)))&&(v.selected==null||integer(v.selected,80,0))&&Array.isArray(v.history)&&v.history.every(h=>object(h)&&integer(h.i,80,0)&&integer(h.prev,9,0)&&Array.isArray(h.prevNotes)&&h.prevNotes.length<=9&&h.prevNotes.every(n=>integer(n,9)))&&Number.isFinite(v.elapsed)&&v.elapsed>=0);
 add('words.progress',v=>object(v)&&integer(v.levelIndex,999,0)&&Number.isFinite(v.score)&&v.score>=0&&Array.isArray(v.found)&&v.found.every(w=>typeof w==='string'&&/^[A-Z]{3,20}$/.test(w)));
 add('pac.progress',v=>object(v)&&integer(v.level)&&Array.isArray(v.dots)&&Array.isArray(v.player)&&v.player.length===2&&integer(v.player[0],14,0)&&integer(v.player[1],18,0)&&v.dots.every(n=>integer(n,284,0))&&Number.isFinite(v.score)&&integer(v.lives,3,0));
 add('wordguess.v1',v=>object(v)&&v.version===1&&integer(v.level)&&object(v.rounds));
 add('antsApartPrototype',v=>object(v)&&integer(v.level,36)&&(!v.attempts||object(v.attempts)));
 for(const id of ['rotateNetwork','loop','colorCode','pictureGrid'])add(id,v=>object(v)&&integer(v.level,30)&&(!v.attempts||object(v.attempts)));
 add('binaryGrid sightline',v=>object(v)&&integer(v.level,50)&&(!v.attempts||object(v.attempts)));
 for(const id of ['lightUp','bridges','slide'])add('logic.'+id,v=>object(v)&&integer(v.level,50)&&object(v.state));
 for(const id of ['flow','untangle','flood'])add('calm.v1.'+id,v=>object(v)&&object(v.state)&&integer(v.state.level,50));
 add('new.dots new.dotsUndo',v=>v===null||object(v)&&integer(v.level,100)&&Array.isArray(v.board));
 add('new.2048 new.2048undo',v=>v===null||object(v)&&Array.isArray(v.board)&&v.board.length===16&&v.board.every(n=>Number.isInteger(n)&&n>=0)&&Number.isFinite(v.score));
 registry.set('pocketpause.zip.progress.v1',v=>object(v)&&integer(v.level)&&(!v.path||Array.isArray(v.path)&&v.path.length<=400&&v.path.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>integer(n,30,0)))));
 const owned=k=>typeof k==='string'&&k.length<150&&(k.startsWith(prefix)||k==='pocketpause.zip.progress.v1');
 function bounded(value){let count=0;function visit(v,depth){if(++count>100000||depth>18)throw Error('Backup structure is too large.');if(typeof v==='number'&&!Number.isFinite(v))throw Error('Invalid backup number.');if(typeof v==='string'&&v.length>10000)throw Error('Backup text is too large.');if(v&&typeof v==='object'){if(Array.isArray(v)&&v.length>10000)throw Error('Backup array is too large.');for(const [key,item]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(key))throw Error('Unsupported backup property.');visit(item,depth+1);}}}visit(value,0);}
 function valueFor(key,raw){const test=registry.get(key);if(!test)throw Error('This backup contains an unsupported save key.');let value;try{value=JSON.parse(raw);}catch{value=raw;}bounded(value);if(!test(value))throw Error('This backup contains invalid game progress or preferences.');}
 function validate(data){if(data?.app!=='dopop'||data.version!==1||!Array.isArray(data.entries)||data.entries.length>300)throw Error('This is not a supported dopop backup.');const keys=new Set();for(const row of data.entries){if(!Array.isArray(row)||row.length!==2||!owned(row[0])||typeof row[1]!=='string'||row[1].length>600000||keys.has(row[0]))throw Error('Invalid backup entries.');keys.add(row[0]);valueFor(...row);}return data.entries;}
 function snapshot(store){const rows=[];for(let i=0;i<store.length;i++){const key=store.key(i);if(owned(key)){const value=store.getItem(key);if(typeof value!=='string')throw Error('Could not read existing progress.');rows.push([key,value]);}}return rows;}
 function replace(store,entries){
  // Failure here must never enter destructive rollback.
  let previous;try{previous=snapshot(store);}catch{return{result:'aborted'};}
  try{for(const [key]of previous)store.removeItem(key);for(const [key,value]of entries)store.setItem(key,value);store.setItem(generationKey,String(Date.now())+'-'+Math.random().toString(36).slice(2));return{result:'restored'};}
  catch{try{for(const [key]of snapshot(store))store.removeItem(key);for(const [key,value]of previous)store.setItem(key,value);const check=snapshot(store);if(check.length!==previous.length||previous.some(([key,value])=>store.getItem(key)!==value))throw Error('Recovery incomplete');return{result:'rolled_back'};}catch{return{result:'rollback_failed'};}}
 }
 // All current app tabs hold a shared lease; restore requires an exclusive lease.
 const locks=globalThis.navigator?.locks;let release=null,lease=Promise.resolve();
 function acquire(){if(!locks)return Promise.resolve();return new Promise(resolve=>{lease=locks.request('dopop-save-session',{mode:'shared'},()=>new Promise(done=>{release=done;resolve();})).catch(()=>resolve());});}
 let generation=null;try{generation=globalThis.localStorage?.getItem(generationKey)??null;}catch{}
 let ready=acquire();
 async function exclusive(action){await ready;if(!locks)return action();release?.();release=null;await lease;try{return await locks.request('dopop-save-session',{ifAvailable:true},lock=>{if(!lock)throw Error('Close other DoPop tabs before restoring progress.');return action();});}finally{ready=acquire();await ready;}}
 globalThis.addEventListener?.('pagehide',()=>{release?.();release=null;});
 globalThis.addEventListener?.('pageshow',event=>{if(event.persisted){let current=generation;try{current=globalThis.localStorage?.getItem(generationKey)??null;}catch{}if(current!==generation){document.documentElement.dataset.dopopRestoringSaves='true';location.reload();return;}ready=acquire();api.ready=ready;}});
 const register=(key,test)=>{const base=registry.get(key);if(!base)throw Error('Unknown validator key');registry.set(key,value=>base(value)&&test(value));};
 const api={register,owned,validate,snapshot,replace,exclusive,ready};globalThis.DoPopSaveSafety=api;
})();
