"""Verify offline third-party notices and unchanged 2048 compatibility behavior."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re
s=Path('dist/index.html').read_text()
class Notices(HTMLParser):
    def __init__(self):super().__init__();self.inside=False;self.parts=[]
    def handle_starttag(self,tag,attrs):
        if tag=='dialog' and dict(attrs).get('id')=='creditsDialog':self.inside=True
    def handle_endtag(self,tag):
        if tag=='dialog':self.inside=False
    def handle_data(self,data):
        if self.inside:self.parts.append(data)
n=Notices();n.feed(s);notice=''.join(n.parts)
assert Path('games/word-guess-LICENSE.txt').read_text() in notice
assert Path('games/12dicts-NOTICE.txt').read_text() in notice
assert s.count('id="creditsDialog"')==1
assert "button.textContent='Credits & licenses'" in s
assert 'aria-labelledby="creditsTitle"' in s and '<form method="dialog">' in s
assert "dialog.addEventListener('close',()=>button.focus())" in s
# No unconfirmed attribution is presented as an included component.
assert 'Tatham' not in notice
assert 'Derived word data: Words and Word Search' in notice
assert 'Imported code: 2048 movement engine' in notice
assert 'Imported content:' in notice and 'Puzzle-rule acknowledgments' in notice
for path in ('licenses/0hh1-MIT.txt','licenses/0hn0-MIT.txt','licenses/2048-MIT.txt'):
    assert Path(path).read_text() in notice
assert s.count("button.id='creditsLicensesButton'")==1
release=json.loads(Path('dist/offline-release.json').read_text())
assert next(a['sha'] for a in release['assets'] if a['url']=='/')==hashlib.sha256(Path('dist/index.html').read_bytes()).hexdigest()
for key,item in json.loads(Path('scripts/credits-compatibility.json').read_text()).items():
    m=re.search(item['pattern'],s,re.S);assert m,key
    assert hashlib.sha256(m[0].encode()).hexdigest()==item['sha256'],key+' changed'
for name,digest in json.loads(Path('games/vendor/2048/checksums.json').read_text()).items():
    assert hashlib.sha256((Path('games/vendor/2048')/name).read_bytes()).hexdigest()==digest,name
print('PASS: offline MIT and 12dicts notices; credits accessibility hooks; unchanged 2048 spawn/storage; pinned upstream file checksums.')
