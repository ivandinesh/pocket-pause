from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re
root=Path('dist')
class Check(HTMLParser):
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        assert not any(k.lower().startswith('on')for k in a),'Inline event attribute'
        if tag=='script'and a.get('type')!='application/ld+json':
            assert a.get('src','').startswith('/'),'Executable scripts must be same-origin assets'
            assert (root/a['src'][1:]).is_file(),'Script missing from release'
for file in root.rglob('*.html'):Check().feed(file.read_text())
headers={x['key']:x['value']for x in json.loads(Path('vercel.json').read_text())['headers'][0]['headers']}
script=next(d for d in headers['Content-Security-Policy'].split(';')if d.strip().startswith('script-src '))
assert 'unsafe-inline'not in script and 'unsafe-eval'not in script
release=json.loads((root/'offline-release.json').read_text());cached={a['url']for a in release['assets']}
for a in release['assets']:assert hashlib.sha256((root/('index.html'if a['url']=='/'else a['url'][1:])).read_bytes()).hexdigest()==a['sha']
for file in (root/'assets').glob('*.js'):
    assert '/assets/'+file.name in cached
    assert hashlib.sha256(file.read_bytes()).hexdigest()==file.stem
print('PASS: strict script CSP, no executable inline scripts/event attributes, all scripts and offline digests verified.')

inventory=json.loads(Path('scripts/runtime-inventory.json').read_text())['runtime'][0]
loader=Path('app/faro-loader.js').read_text()
assert inventory['url'] in loader and inventory['integrity'] in loader,'Runtime inventory differs from the loaded artifact'
