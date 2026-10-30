"""Fail on recognizable credential formats; never print matching values."""
import re,subprocess
from pathlib import Path
patterns=[rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',rb'gh[pousr]_[A-Za-z0-9]{30,}',rb'github_pat_[A-Za-z0-9_]{40,}',rb'AKIA[A-Z0-9]{16}',rb'(?:sk_live|rk_live)_[A-Za-z0-9]{20,}']
failed=[]
for raw in subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).split(b'\0'):
    if not raw:continue
    p=Path(raw.decode())
    if p.is_file()and any(re.search(pattern,p.read_bytes())for pattern in patterns):failed.append(str(p))
if failed:raise SystemExit('Potential credentials in: '+', '.join(failed))
print('PASS: no recognized credential patterns in tracked source. GitHub secret push protection remains required.')
