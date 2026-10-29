from pathlib import Path

p = Path('index.html')
s = p.read_text()

old_card = '<svg viewBox="0 0 80 80" width="64" height="64"><path d="M12 16H50V34H68M12 64H32V44" fill="none" stroke="#c9d7ef" stroke-width="7" stroke-linecap="round"/><path d="M27 23L39 35L27 47L15 35Z" fill="#4f78ec"/><circle cx="27" cy="35" r="4" fill="white"/><circle cx="58" cy="60" r="7" fill="none" stroke="#596171" stroke-width="4"/></svg>'
new_card = '''<svg viewBox="0 0 80 80" width="64" height="64"><path d="M10 17H49V35H69M10 64H32V45" fill="none" stroke="#c9d7ef" stroke-width="7" stroke-linecap="round"/><g fill="none" stroke="#4f78ec" stroke-width="3" stroke-linecap="round"><path d="M20 31l-7-6m7 11l-8 0m8 5l-7 6m18-16l7-6m-7 11h8m-8 5l7 6"/></g><g fill="#4f78ec"><circle cx="20" cy="36" r="5"/><circle cx="27" cy="36" r="5"/><ellipse cx="35" cy="36" rx="7" ry="6"/></g><g fill="none" stroke="#596171" stroke-width="3" stroke-linecap="round"><path d="M53 53l-8-7m7 12l-9-1m10 6l-7 7m20-17l8-7m-7 12l9-1m-10 6l7 7"/></g><g fill="#596171"><circle cx="60" cy="58" r="6"/><circle cx="60" cy="67" r="8"/></g></svg>'''
if old_card not in s:
    raise SystemExit('Maze Chase card artwork anchor missing')
s = s.replace(old_card, new_card, 1)

s = s.replace('aria-label="Maze Chase board: collect dots and avoid ring drones"', 'aria-label="Maze Chase board: collect dots and avoid spiders"', 1)

old_draw = ''' // Ring drones have no faces, ghost silhouettes or character-specific colors.
 (visualGhosts.length===ghosts.length?visualGhosts:ghosts).forEach(([x,y])=>{const px=x*c+20,py=y*c+20,tint=power?'#b9c9e9':'#596171';ring(px,py,12,tint);mark(px,py,4,tint);});
 // A solid diamond navigator with a central window, never an opening mouth.
 const [x,y]=visualPlayer||player;ctx.save();ctx.translate(x*c+20,y*c+20);ctx.fillStyle=pal.head;ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(13,0);ctx.lineTo(0,16);ctx.lineTo(-13,0);ctx.closePath();ctx.fill();mark(0,0,4,'white');ctx.restore();'''
new_draw = ''' function drawSpider(px,py,color){
   ctx.save();ctx.translate(px,py);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.4;ctx.lineCap='round';
   ctx.beginPath();ctx.moveTo(-4,-3);ctx.lineTo(-12,-10);ctx.moveTo(-5,1);ctx.lineTo(-14,-2);ctx.moveTo(-4,5);ctx.lineTo(-12,11);ctx.moveTo(4,-3);ctx.lineTo(12,-10);ctx.moveTo(5,1);ctx.lineTo(14,-2);ctx.moveTo(4,5);ctx.lineTo(12,11);ctx.stroke();
   ctx.beginPath();ctx.arc(0,-4,5,0,Math.PI*2);ctx.arc(0,5,8,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 function drawAnt(px,py,color){
   ctx.save();ctx.translate(px,py);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.2;ctx.lineCap='round';
   ctx.beginPath();ctx.moveTo(-7,-2);ctx.lineTo(-13,-8);ctx.moveTo(-7,2);ctx.lineTo(-14,2);ctx.moveTo(-6,5);ctx.lineTo(-12,10);ctx.moveTo(5,-2);ctx.lineTo(11,-8);ctx.moveTo(5,2);ctx.lineTo(12,2);ctx.moveTo(5,5);ctx.lineTo(11,10);ctx.moveTo(-10,-4);ctx.lineTo(-15,-10);ctx.moveTo(-8,-5);ctx.lineTo(-8,-12);ctx.stroke();
   ctx.beginPath();ctx.arc(-8,0,5,0,Math.PI*2);ctx.arc(0,1,5,0,Math.PI*2);ctx.ellipse(9,2,7,6,0,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 (visualGhosts.length===ghosts.length?visualGhosts:ghosts).forEach(([x,y])=>{const tint=power?'#b9c9e9':'#596171';drawSpider(x*c+20,y*c+20,tint);});
 const [x,y]=visualPlayer||player;drawAnt(x*c+20,y*c+20,pal.head);'''
if old_draw not in s:
    raise SystemExit('Maze Chase in-game artwork anchor missing')
s = s.replace(old_draw, new_draw, 1)

p.write_text(s)
print('Changed Maze Chase artwork to ant and spider')
