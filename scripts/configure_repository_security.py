"""Review/apply the production ruleset only after real CI succeeds on remote main.
No tokens are read or printed; authentication is delegated to the GitHub CLI.
"""
from pathlib import Path
import argparse,json,subprocess
parser=argparse.ArgumentParser();parser.add_argument('--apply',action='store_true');args=parser.parse_args()
repo='repos/ivandinesh/pocket-pause'
def api(endpoint,method='GET',data=None):
    cmd=['gh','api',repo+endpoint,'--method',method]
    if data is not None:cmd+=['--input','-']
    p=subprocess.run(cmd,input=json.dumps(data)if data is not None else None,capture_output=True,text=True)
    if p.returncode:raise SystemExit('GitHub configuration request failed; verify repository permissions.')
    return json.loads(p.stdout)if p.stdout.strip()else None
config=json.loads(Path('.github/main-ruleset.json').read_text())
branch=api('/branches/main');sha=branch['commit']['sha']
runs=api('/commits/'+sha+'/check-runs?per_page=100')['check_runs']
checks=next(r for r in config['rules']if r['type']=='required_status_checks')['parameters']['required_status_checks']
for required in checks:
    run=next((r for r in runs if r['name']==required['context']and r['app']['slug']=='github-actions'),None)
    if not run or run['status']!='completed'or run['conclusion']!='success':raise SystemExit('Deferred: publish the workflows and wait for successful '+required['context']+' on remote main before enabling enforcement.')
    required['integration_id']=run['app']['id']
alerts=api('/code-scanning/alerts?state=open&ref=refs/heads/main&per_page=100')
if any(a.get('rule',{}).get('security_severity_level') in ['high','critical']or a.get('rule',{}).get('severity')=='error'for a in alerts):
    raise SystemExit('Deferred: resolve blocking code-scanning alerts before enabling enforcement.')
print('Verified CI on main '+sha[:12]+'. Required checks: '+', '.join(c['context']for c in checks))
if not args.apply:print('Review passed. No settings changed; use --apply to enable the reviewed ruleset.');raise SystemExit(0)
# Recheck the branch immediately before mutation; do not enforce an unverified new head.
if api('/branches/main')['commit']['sha']!=sha:raise SystemExit('Main changed during verification; rerun after its checks finish.')
existing=next((r for r in api('/rulesets')if r['name']==config['name']),None)
api('/rulesets'+('/'+str(existing['id'])if existing else ''),'PUT'if existing else 'POST',config)
print('Production ruleset enabled. Normal changes now require a pull request and passing checks.')
