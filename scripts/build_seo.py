"""Generate useful static game guides and search assets; the app bundle remains the offline core."""
from pathlib import Path
from html import escape
from urllib.parse import quote
import json,os,re,struct,zlib
root=Path('dist');catalogue=json.loads(Path('seo/games.json').read_text());origin='https://www.dopop.fun'
preview=os.environ.get('VERCEL_ENV')=='preview'
app=(root/'index.html').read_text()
analytics=re.search(r'<!-- DOPOP_FARO_BASELINE -->\s*<script>.*?</script>',app,re.S)
assert analytics,'Shared production telemetry loader missing'
for name in ('theme.js','theme-colors.js'):(root/name).write_text((Path('app')/name).read_text())
(root/'guide.css').write_text(Path('seo/guide.css').read_text())
(root/'guide-client.js').write_text(Path('seo/guide-client.js').read_text())
brand='<a class="brand" href="/" aria-label="DoPop home"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>dopop</a>'
def structured(data):return '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False).replace('<','\\u003c')+'</script>'
def page(title,description,path,content,schema):
    canonical=origin+path
    head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#fbfcff">'''
    head+='<title>'+escape(title)+'</title><meta name="description" content="'+escape(description,quote=True)+'"><link rel="canonical" href="'+canonical+'"><meta name="robots" content="'+('noindex,follow' if preview else 'index,follow')+'">'
    for prop,value in [('og:type','website'),('og:site_name','DoPop'),('og:title',title),('og:description',description),('og:url',canonical),('og:image',origin+'/social-card.png'),('og:image:width','1200'),('og:image:height','630'),('og:image:alt','DoPop blue dot mark on a pale dotted background')]:head+='<meta property="'+prop+'" content="'+escape(value,quote=True)+'">'
    head+='<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+escape(title,quote=True)+'"><meta name="twitter:description" content="'+escape(description,quote=True)+'"><meta name="twitter:image" content="'+origin+'/social-card.png">'
    head+='<script src="/theme-colors.js"></script><script src="/theme.js"></script><link rel="stylesheet" href="/guide.css"><script src="/guide-client.js" defer></script>'+structured(schema)+analytics[0]+'</head>'
    return head+'<body><header>'+brand+'<a href="/">Play all games</a></header><main id="homePage">'+content+'</main><footer class="guide-footer"><p class="home-foot"><a href="/">Play all games</a><a href="/games">Game guides</a><a href="/?privacy=1">Privacy &amp; analytics</a></p><p>No ads, accounts or purchases. Saves stay on this device.</p></footer></body></html>'
items=[{'@type':'ListItem','position':i+1,'name':g['name'],'url':origin+'/games/'+g['slug']}for i,g in enumerate(catalogue)]
links=''.join('<li><a href="/games/'+g['slug']+'">'+escape(g['name'])+'</a><p>'+escape(g['summary'])+'</p></li>'for g in catalogue)
directory='<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li>Game guides</li></ol></nav><section class="directory"><p class="eyebrow">24 little games</p><h1>Free browser games, with room to pause.</h1><p>Choose a word, logic, number, color or arcade game. Read its rules, then open the game in DoPop. Touch controls work on phones; keyboard controls are available where described.</p><ul class="game-list">'+links+'</ul><h2>Play online, then keep DoPop offline</h2><p>Open the games while connected and wait for Ready for offline play. You can then install DoPop or reopen it without a connection. Progress stays in this browser; Offline &amp; saves can export a backup.</p></section>'
schema={'@context':'https://schema.org','@type':'CollectionPage','name':'DoPop game guides','url':origin+'/games','mainEntity':{'@type':'ItemList','itemListElement':items}}
(root/'games').mkdir(exist_ok=True)
(root/'games.html').write_text(page('Free Puzzle & Browser Games — No Ads, No Login | DoPop','Explore 24 free games with no ads or login: word games, logic puzzles, Sudoku, 2048 and arcade games. Read the rules, then play online or prepare offline play.','/games',directory,schema))
for game in catalogue:
    name=escape(game['name']);path='/games/'+game['slug'];play='/?game='+quote(game['id'])
    related=[g for g in catalogue if g['category']==game['category'] and g['id']!=game['id']][:3]
    if not related:related=[g for g in catalogue if g['id']!=game['id']][:3]
    content='<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/games">Game guides</a></li><li>'+name+'</li></ol></nav><article><p class="eyebrow">'+escape(game['category'])+'</p><h1>'+name+'</h1><p>'+escape(game['summary'])+'</p><a class="play-link" data-play-game="'+game['id']+'" href="'+play+'">Play '+name+' →</a><h2>How to play</h2><ol>'+''.join('<li>'+escape(step)+'</li>'for step in game['steps'])+'</ol><h2>A useful starting point</h2><p>'+escape(game['tip'])+'</p><h2>Controls and progress</h2><p>'+escape(game['controls'])+'</p><p>'+escape(game['progress'])+'</p><h2>Offline play and saves</h2><p>Open DoPop online first and wait for Ready for offline play before disconnecting. You can install it from your browser. Saves belong to this device and browser; export a backup from Offline &amp; saves before clearing site data.</p><h2>Try another small game</h2><ul class="related">'+''.join('<li><a href="/games/'+g['slug']+'">'+escape(g['name'])+'</a></li>'for g in related)+'</ul></article>'
    schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':origin+path,'url':origin+path,'name':game['title'],'description':game['meta_description'],'mainEntity':{'@id':origin+path+'#game'}},{'@type':['WebApplication','VideoGame'],'@id':origin+path+'#game','name':game['name'],'url':origin+path,'description':game['summary'],'applicationCategory':'GameApplication','operatingSystem':'Any device with a modern web browser','browserRequirements':'Requires JavaScript to play','isAccessibleForFree':True}]}
    (root/'games'/(game['slug']+'.html')).write_text(page(game['title'],game['meta_description'],path,content,schema))
paths=['/','/games']+['/games/'+g['slug']for g in catalogue]
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+origin+p+'</loc></url>'for p in paths)+'</urlset>\n')
(root/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml\n')
# Original dot-mark artwork, encoded with the standard library; no imported art/font.
w,h=1200,630;dots=[(480+x*120,195+y*120)for y in range(3)for x in range(3)if(x,y)!=(0,0)];rows=[]
for y in range(h):
    row=bytearray()
    for x in range(w):
        hit=any((x-dx)**2+(y-dy)**2<=39**2 for dx,dy in dots)
        color=(79,120,236,255) if hit else (220,231,249,255) if(x%26==0 and y%26==0) else (249,251,255,255)
        row.extend(color)
    rows.append(b'\0'+row)
def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(rows),9))+chunk(b'IEND',b'')
(root/'social-card.png').write_bytes(png)
print('SEO: 24 static game guides, directory, canonical metadata, sitemap, robots and original social card.')
