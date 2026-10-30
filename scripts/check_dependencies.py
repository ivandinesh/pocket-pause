"""Query OSV for exact runtime/locked tooling versions; fail closed on unavailable checks."""
from pathlib import Path
import json,urllib.request
inventory=json.loads(Path('scripts/runtime-inventory.json').read_text())
packages={(x['name'],x['version'])for x in inventory['runtime']}
lock=json.loads(Path('tooling/package-lock.json').read_text())
for key,value in lock['packages'].items():
    if 'node_modules/'in key:packages.add((key.rsplit('node_modules/',1)[1],value['version']))
ordered=sorted(packages)
query={'queries':[{'package':{'ecosystem':'npm','name':name},'version':version}for name,version in ordered]}
request=urllib.request.Request('https://api.osv.dev/v1/querybatch',data=json.dumps(query).encode(),headers={'Content-Type':'application/json'})
result=json.load(urllib.request.urlopen(request,timeout=30))
failures=[{'package':ordered[i][0],'version':ordered[i][1],'advisories':[v['id']for v in r.get('vulns',[])]}for i,r in enumerate(result['results'])if r.get('vulns')]
if failures:raise SystemExit(json.dumps(failures))
print(f'PASS: OSV returned no advisories for {len(ordered)} exact runtime/tooling package versions. Bundled transitive provenance remains a separate upstream check.')
