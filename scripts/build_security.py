"""Externalize executable scripts after assembly, retaining exact order and script types."""
from pathlib import Path
from html import escape
from html_scripts import Scripts
import hashlib,json,os
root=Path('dist');assets=root/'assets';assets.mkdir(exist_ok=True)
for file in root.rglob('*.html'):
    source=file.read_text()
    for script in reversed(Scripts(source).scripts):
        attrs=dict(script.attrs)
        if 'src'in attrs or attrs.get('type','').lower()not in ('','module','text/javascript','application/javascript'):continue
        digest=hashlib.sha256(script.body.encode()).hexdigest()
        (assets/(digest+'.js')).write_text(script.body)
        attributes=''.join(' '+key+(''if value is None else '="'+escape(value,quote=True)+'"')for key,value in script.attrs)
        replacement='<script'+attributes+' src="/assets/'+digest+'.js"></script>'
        source=source[:script.start]+replacement+source[script.end:]
    file.write_text(source)
# Rebuild the offline contract after transforming the final HTML and scripts.
previous=json.loads((root/'offline-release.json').read_text())
paths=[a['url']for a in previous['assets']]+['/'+str(p.relative_to(root))for p in sorted(assets.glob('*.js'))]
manifest=[{'url':url,'sha':hashlib.sha256((root/('index.html'if url=='/'else url[1:])).read_bytes()).hexdigest()}for url in dict.fromkeys(paths)]
routes=['/games']+['/games/'+g['slug']for g in json.loads(Path('seo/games.json').read_text())]
template=Path('pwa/sw.js').read_text()
release=hashlib.sha256((json.dumps(manifest)+template+json.dumps(routes)+Path('vercel.json').read_text()).encode()).hexdigest()[:20]
(root/'sw.js').write_text(template.replace('__RELEASE__',json.dumps(release)).replace('__ASSETS__',json.dumps(manifest)).replace('__GAME_ROUTES__',json.dumps(routes)))
(root/'offline-release.json').write_text(json.dumps({'release':release,'commit':os.environ.get('VERCEL_GIT_COMMIT_SHA'),'assets':manifest},indent=2))
print(f'Strict script policy: {len(list(assets.glob("*.js")))} content-addressed scripts, offline release {release}')
