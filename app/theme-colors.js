// Shared color roles for CSS, inline SVG and canvas. Game state is never transformed.
globalThis.DoPopThemeColors = (() => {
  const pattern = /#[a-f\d]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/gi;
  function parse(value) {
    if(typeof value!=='string')return null;
    let s=value.toLowerCase().trim();if(s==='white')s='#ffffff';if(s==='black')s='#000000';
    if(/^#[a-f\d]{3,8}$/.test(s)){
      let h=s.slice(1);if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');if(h.length!==6&&h.length!==8)return null;
      return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),h.length===8?parseInt(h.slice(6,8),16)/255:1];
    }
    const m=s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
    return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null;
  }
  function hsl([r,g,b]){r/=255;g/=255;b/=255;const hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo,l=(hi+lo)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=hi===r?((g-b)/d)%6:hi===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;}return[h,s,l];}
  function rgb(h,s,l){const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const base=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return base.map(v=>Math.round((v+m)*255));}
  function role(property){if(property.startsWith('--'))return /ink|muted|blue|pale|line|control/.test(property)?(/line|border/.test(property)?'line':/pale/.test(property)?'bg':'ink'):'keep';if(/shadow/.test(property))return 'shadow';if(/border|outline|text-decoration/.test(property))return 'line';if(/background/.test(property))return 'bg';if(/color|fill|stroke/.test(property))return 'ink';return 'keep';}
  function dark(value,kind='ink'){
    const rgba=parse(value);if(!rgba||kind==='keep')return value;let [r,g,b,a]=rgba;const [h,s,l]=hsl(rgba);let out=[r,g,b];
    if(kind==='shadow')return 'rgba(0,0,0,'+Math.max(.12,a*.65).toFixed(3)+')';
    if(kind==='bg'){
      if(l>.91&&s<.6)out=l>.98?[17,25,38]:[22,33,49];
      else if(l>.72)out=rgb(h,Math.min(.45,s),.19+.05*s);
      else if(l<.3&&s<.3)out=[26,38,55];
    }else if(kind==='line'){
      out=s>.4&&l<.75?rgb(h,Math.min(.75,s),.69):[66,85,111];
    }else if(kind==='canvas'){
      if(l>.84)out=[57,78,106];
      else if(s<.28)out=[184,200,222];
      else if(l<.65)out=rgb(h,Math.min(.78,s),Math.max(.67,l));
    }else if(kind==='svg'||kind==='icon'){
      if(l>.96&&s<.4)out=[17,25,38];
      else if(l>.82)out=kind==='icon'?[127,153,190]:[65,88,119];
      else if(s<.28)out=[184,200,222];
      else if(l<.65)out=rgb(h,Math.min(.78,s),Math.max(.67,l));
    }else{
      if(l>.96&&s<.4)out=[255,255,255];
      else if(s>.33)out=rgb(h,Math.min(.8,s),Math.max(.74,l>.85?.76:l));
      else out=l<.29?[229,237,249]:[174,191,215];
    }
    return 'rgba('+out.join(',')+','+a.toFixed(3)+')';
  }
  function token(value,kind){const c=parse(value);return c?'--dp-'+kind+'-'+c.slice(0,3).map(n=>Math.round(n).toString(16).padStart(2,'0')).join('')+'-'+Math.round(c[3]*255).toString(16):null;}
  function transform(value,kind,register){if(kind==='keep'||value.includes('--dp-'))return value;return value.replace(pattern,color=>{const name=token(color,kind);if(!name)return color;register(name,dark(color,kind));return 'var('+name+','+color+')';});}
  return {parse,hsl,role,dark,token,transform};
})();
