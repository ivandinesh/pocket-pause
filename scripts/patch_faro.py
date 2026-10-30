"""Keep the existing Faro collector and pinned SDK; add bounded application context."""
import json,os
from pathlib import Path
path=Path('index.html');html=path.read_text();marker='<!-- DOPOP_FARO_BASELINE -->'
assert marker not in html,'Faro already injected'
commit=(os.environ.get('VERCEL_GIT_COMMIT_SHA')or'1.0.0').strip();version=commit[:12]if commit!='1.0.0'else commit
catalogue=json.loads(Path('seo/games.json').read_text())
telemetry=Path('app/telemetry.js').read_text().replace('__CATALOGUE__',json.dumps([{'id':g['id'],'slug':g['slug']}for g in catalogue]))
loader=Path('app/faro-loader.js').read_text().replace('__VERSION__',json.dumps(version))
html=html.replace('</head>',marker+'\n<script>\n'+telemetry+'\n'+loader+'\n</script></head>',1)
needle='function showPage(name){'
assert needle in html
html=html.replace(needle,needle+"globalThis.DOPopTelemetry?.view(name);",1)
path.write_text(html)
print('Added production-only Faro application signals')
