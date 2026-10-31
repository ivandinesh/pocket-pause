"""Emit same-origin content-addressed modules/data before final offline hashing."""
from pathlib import Path
import hashlib,json
root=Path('dist');assets=root/'assets';assets.mkdir(exist_ok=True)
def emit(source):
    data=Path(source).read_bytes();name=hashlib.sha256(data).hexdigest()+Path(source).suffix
    (assets/name).write_bytes(data)
    return '/assets/'+name
mapping={key:emit(source)for key,source in [('core','games/quiet-core.js'),('ui','games/quiet-ui.js'),('css','games/quiet-ui.css'),('specs','games/quiet-specs.json')]}
mapping['levels']={spec['id']:emit('games/quiet-levels/'+spec['id']+'.json')for spec in json.loads(Path('games/quiet-specs.json').read_text())}
p=root/'index.html';s=p.read_text();assert s.count('__QUIET_ASSETS__')==1;s=s.replace('__QUIET_ASSETS__',json.dumps(mapping,separators=(',',':')));p.write_text(s)
release=json.loads((root/'offline-release.json').read_text())
for path in [mapping[k]for k in ('core','ui','css','specs')]+list(mapping['levels'].values()):release['assets'].append({'url':path,'sha':hashlib.sha256((root/path[1:]).read_bytes()).hexdigest()})
# The pre-packaging regression suite also exercises the worker. Rebuild its
# contract now; build_security repeats this after externalizing startup scripts.
for asset in release['assets']:
    asset['sha']=hashlib.sha256((root/('index.html'if asset['url']=='/'else asset['url'][1:])).read_bytes()).hexdigest()
template=Path('pwa/sw.js').read_text()
routes=['/games']+['/games/'+g['slug']for g in json.loads(Path('seo/games.json').read_text())]
release['release']=hashlib.sha256((json.dumps(release['assets'])+template+json.dumps(routes)+Path('vercel.json').read_text()).encode()).hexdigest()[:20]
(root/'sw.js').write_text(template.replace('__RELEASE__',json.dumps(release['release'])).replace('__ASSETS__',json.dumps(release['assets'])).replace('__GAME_ROUTES__',json.dumps(routes)))
(root/'offline-release.json').write_text(json.dumps(release,indent=2))
(root/'quiet-assets.json').write_text(json.dumps(mapping,indent=2))
print('Emitted 16 deferred packs; engines and UI excluded from the startup script')
