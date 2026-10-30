"""Read-only release verification. Never executes analytics or sends game telemetry."""
import argparse,hashlib,json,urllib.request
parser=argparse.ArgumentParser();parser.add_argument('--url',default='https://www.dopop.fun');parser.add_argument('--commit');args=parser.parse_args();base=args.url.rstrip('/')
def get(path):
    with urllib.request.urlopen(base+path,timeout=20)as response:return response.read(),response.headers
body,headers=get('/offline-release.json');release=json.loads(body)
if args.commit:assert release.get('commit')==args.commit,'Production commit differs from requested release'
for path in ['/','/games/sudoku','/sw.js']:
    _,h=get(path)
    assert h.get('X-Content-Type-Options')=='nosniff',path+' lacks MIME protection'
    assert h.get('X-Frame-Options')=='DENY',path+' lacks framing protection'
    assert h.get('Referrer-Policy')=='no-referrer',path+' lacks referrer policy'
    script=next(x for x in h.get('Content-Security-Policy','').split(';')if x.strip().startswith('script-src '))
    assert 'unsafe-inline'not in script and 'unsafe-eval'not in script,path+' has weak script policy'
for asset in release['assets']:
    content,_=get(asset['url']);assert hashlib.sha256(content).hexdigest()==asset['sha'],'Artifact digest mismatch: '+asset['url']
print('PASS: deployed release '+release['release']+', requested commit (if supplied), representative headers and every offline asset digest.')
