const fs=require('fs'),vm=require('vm'),assert=require('assert');
const palette=fs.readFileSync('app/theme-colors.js','utf8'),source=fs.readFileSync('app/theme.js','utf8');
function environment({dark=false,saved=null,denied=false}={}){
 const listeners={},domListeners={},storage=new Map(saved?[['pocketpause.v1.appearance',saved]]:[]),root={dataset:{},style:{}},meta={};
 const media={matches:dark,addEventListener(type,fn){this.change=fn;}};
 class CanvasContext {
  constructor(id='snakeCanvas'){this.canvas={id,closest:selector=>id==='ants'&&selector==='.ants-game'};this.fill='#000';this.stroke='#000';}
  get fillStyle(){return this.fill;}set fillStyle(v){this.fill=v;}
  get strokeStyle(){return this.stroke;}set strokeStyle(v){this.stroke=v;}
 }
 const document={documentElement:root,head:{append(){}},getElementById:()=>null,querySelector:()=>({setAttribute:(k,v)=>meta[k]=v}),addEventListener:(name,fn)=>domListeners[name]=fn,dispatchEvent:e=>domListeners[e.type]?.(e)};
 const ctx={document,matchMedia:()=>media,localStorage:{getItem:k=>{if(denied)throw Error('Storage unavailable');return storage.get(k)||null;},setItem:(k,v)=>{if(denied)throw Error('Storage unavailable');storage.set(k,v);}},addEventListener:(name,fn)=>listeners[name]=fn,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},CanvasRenderingContext2D:CanvasContext};
 vm.createContext(ctx);vm.runInContext(palette+'\n'+source,ctx);
 return {theme:ctx.DoPopTheme,colors:ctx.DoPopThemeColors,root,media,listeners,storage,meta,CanvasContext};
}
{
 const e=environment({dark:true});assert.equal(e.theme.mode,'system');assert.equal(e.theme.theme,'dark');assert.equal(e.meta.content,'#0e1622');
 e.media.matches=false;e.media.change();assert.equal(e.theme.theme,'light');
 e.theme.choose('dark');assert.equal(e.theme.theme,'dark');assert.equal(JSON.parse(e.storage.get('pocketpause.v1.appearance')).mode,'dark');
 e.media.matches=false;e.media.change();assert.equal(e.theme.theme,'dark','explicit choice overrides OS');
 e.theme.choose('invalid');assert.equal(e.theme.mode,'dark');
 e.listeners.storage({key:'pocketpause.v1.appearance',newValue:JSON.stringify({mode:'light'})});assert.equal(e.theme.theme,'light');
 e.listeners.storage({key:null});assert.equal(e.theme.mode,'system');
}
for(const saved of ['{','null','{}','{"mode":"unexpected"}'])assert.equal(environment({dark:true,saved}).theme.mode,'system');
assert.equal(environment({dark:false,saved:'{"mode":"dark"}'}).theme.theme,'dark');
assert.equal(environment({dark:true,saved:'{"mode":"light"}'}).theme.theme,'light');
{
 const e=environment({denied:true,dark:true});e.theme.choose('light');assert.equal(e.theme.theme,'light','storage denial must not block a usable theme');
}
{
 const e=environment(),ctx=new e.CanvasContext();ctx.fillStyle='#596171';assert.equal(ctx.fillStyle,'#596171','light paint is untouched');
 e.theme.choose('dark');ctx.fillStyle='#596171';assert.notEqual(ctx.fillStyle,'#596171');ctx.fillStyle='#24345b';assert.equal(ctx.fillStyle,'#24345b','pupils stay dark against white eyes');ctx.fillStyle='white';assert.equal(ctx.fillStyle,'white','white eyes remain white');
 const ants=new e.CanvasContext('ants');ants.fillStyle='#fff';assert.equal(ants.fillStyle,'rgba(17,25,38,1)');
 const fidget=new e.CanvasContext('fidgetCanvas');fidget.fillStyle='#ffffff';assert.equal(fidget.fillStyle,'rgba(17,25,38,1)');
 const maze=new e.CanvasContext('pacCanvas');maze.fillStyle='#4f78ec25';assert.equal(e.colors.parse(maze.fillStyle)[3],.6,'maze walls remain visible');
 const gradient={};ctx.fillStyle=gradient;assert.strictEqual(ctx.fillStyle,gradient,'native gradients retain identity');
 e.theme.choose('light');ctx.strokeStyle='#e8edf7';assert.equal(ctx.strokeStyle,'#e8edf7');
}
{
 const {colors:C}=environment(),registered={};
 const one=C.transform('radial-gradient(circle,#dce5f8 1px,transparent 1px)','bg',(k,v)=>registered[k]=v);
 assert(one.includes('var(--dp-bg-'));assert(one.includes('transparent'));
 assert.equal(C.transform(one,'bg',()=>{throw Error('Already tokenized');}),one);
 assert.equal(C.transform('var(--swatch)','keep',()=>{}),'var(--swatch)');
 const gradient={};assert.strictEqual(C.dark(gradient),gradient);
 const luminance=color=>{const a=C.parse(color).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
 for(const color of ['#172033','#66758c','#8490a8','#3568ee','#596171']){const ink=luminance(C.dark(color,'ink')),bg=luminance('#111926');assert((ink+.05)/(bg+.05)>=4.5,color+' text contrast');}
 assert(C.dark('#fff5d4','bg')!==C.dark('#dff1e6','bg'),'semantic tinted states remain distinct');
 assert(!fs.readFileSync('app/theme.css','utf8').includes('invert('),'no inversion filter may alter game meaning');
}
console.log('PASS: System/Light/Dark preferences, OS and storage changes, denied storage, early theme application, canvas surfaces/eyes/gradients, idempotent tokens, text contrast and semantic state separation.');
