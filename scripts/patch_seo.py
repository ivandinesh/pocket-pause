"""Give the app accurate metadata and a small, visible link to the crawlable guides."""
from pathlib import Path
from html import escape
import json,re,os
p=Path('index.html');s=p.read_text();catalogue=json.loads(Path('seo/games.json').read_text())
title='DoPop — Free Puzzle Games, No Ads, No Login'
description=f'Play {len(catalogue)} free puzzle and browser games: Sudoku, word search, 2048 and more. No ads or login. Open once online to prepare offline play.'
# Preserve the search title after the existing home initialization runs.
# No visible heading, tagline or game copy changes.
old_title="document.title='dopop — little games, good moments';"
assert s.count(old_title)==1
s=s.replace(old_title,'',1)
s=re.sub(r'<title>.*?</title>','<title>'+escape(title)+'</title>',s,count=1,flags=re.S)
s=re.sub(r'<meta name="description"[^>]*>','<meta name="description" content="'+escape(description,quote=True)+'">',s,count=1)
metadata='''<link rel="canonical" href="https://www.dopop.fun/">
<meta name="robots" content="'''+('noindex,follow' if os.environ.get('VERCEL_ENV')=='preview' else 'index,follow')+'''">
<meta property="og:type" content="website"><meta property="og:site_name" content="DoPop">
<meta property="og:title" content="'''+escape(title,quote=True)+'''">
<meta property="og:description" content="'''+escape(description,quote=True)+'''">
<meta property="og:url" content="https://www.dopop.fun/">
<meta property="og:image" content="https://www.dopop.fun/social-card.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="DoPop blue dot mark on a pale dotted background">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'''+escape(title,quote=True)+'''"><meta name="twitter:description" content="'''+escape(description,quote=True)+'''"><meta name="twitter:image" content="https://www.dopop.fun/social-card.png">
'''
verification=os.environ.get('GOOGLE_SITE_VERIFICATION','').strip()
if verification:
    if not re.fullmatch(r'[A-Za-z0-9_-]{10,200}',verification):raise ValueError('Invalid GOOGLE_SITE_VERIFICATION token')
    metadata+='<meta name="google-site-verification" content="'+verification+'">\n'
# Do not place JSON-LD ahead of the app module: existing assembly targets its closing tag.
schema={'@context':'https://schema.org','@graph':[{'@type':'WebSite','@id':'https://www.dopop.fun/#website','name':'DoPop','url':'https://www.dopop.fun/'},{'@type':'WebApplication','@id':'https://www.dopop.fun/#app','name':'DoPop','url':'https://www.dopop.fun/','description':description,'applicationCategory':'GameApplication','operatingSystem':'Any device with a modern web browser','isAccessibleForFree':True}]}
s=s.replace('</head>',metadata+'<script type="application/ld+json">'+json.dumps(schema).replace('<','\\u003c')+'</script></head>')
# Preserve the compact home heading while stating what is actually available.
s=re.sub(r'(<div class="home-intro">.*?<h1[^>]*>.*?</h1>\s*<p>).*?(</p>)',r'\g<1>'+str(len(catalogue))+r' free little games. Play online or keep them offline.\2',s,count=1,flags=re.S)
needle='<p class="home-foot">'
# The visible crawlable entry is small; the games directory supplies the full link graph.
footer='<p class="seo-guides"><a href="/games">Game guides</a></p>'
if needle in s:s=s.replace(needle,footer+needle,1)
else:
    match=re.search(r'<[^>]+class="home-foot"',s);assert match,'Home footer missing';s=s[:match.start()]+footer+s[match.start():]
s=s.replace('</head>','<style>.seo-guides{text-align:center;margin:20px 0 0;font-size:12px}.seo-guides a{display:inline-flex;min-height:44px;align-items:center;color:var(--theme-accent,#315ec7);text-underline-offset:3px}</style></head>')
entry='\nglobalThis.DoPopGameCatalogue='+json.dumps([{'id':g['id'],'slug':g['slug'],'name':g['name']} for g in catalogue])+';\n'+Path('app/seo-entry.js').read_text()
position=s.index('<script type="module">');end=s.index('</script>',position)
s=s[:end]+entry+s[end:]
p.write_text(s)
