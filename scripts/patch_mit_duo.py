from pathlib import Path
import json
p=Path('index.html');s=p.read_text();assert 'id="mitDuoStyles"' not in s
css=Path('games/mit-duo.css').read_text()
core=Path('games/mit-duo-core.js').read_text()
ui=Path('games/mit-duo.js').read_text()
credits=Path('games/mit-credits.js').read_text()
lic0=Path('licenses/0hh1-MIT.txt').read_text()
lic1=Path('licenses/0hn0-MIT.txt').read_text()
s=s.replace('</head>','<style id="mitDuoStyles">'+css+'</style></head>')
license_js='globalThis.DOPopLicense0hh1='+json.dumps(lic0)+';globalThis.DOPopLicense0hn0='+json.dumps(lic1)+';\n'
s=s.replace('</script>',license_js+core+'\n'+ui+'\n'+credits+'\n</script>',1)
p.write_text(s)
