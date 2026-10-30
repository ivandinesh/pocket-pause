"""Externalize executable scripts after assembly, retaining exact order and script types."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re,os
root=Path('dist');assets=root/'assets';assets.mkdir(exist_ok=True)
pattern=re.compile(r'<script\b([^>]*)>(.*?)</script>',re.S|re.I)
def external(match):
    attrs,code=match.groups()
    if re.search(r'\bsrc\s*=',attrs) or re.search(r'type=[\"\']application/ld\+json',attrs):return match[0]
    digest=hashlib.sha256(code.encode()).hexdigest()
    (assets/(digest+'.js')).write_text(code)
    return '<script'+attrs+' src="/assets/'+digest+'.js"></script>'
for file in root.rglob('*.html'):file.write_text(pattern.sub(external,file.read_text()))
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
