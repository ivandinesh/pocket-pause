"""Release naming, license and saved-level compatibility gate.
Fingerprints captured from the built main f8692c8, before naming/art changes.
Do not update fingerprints to hide an unintended migration.
"""
from pathlib import Path
import hashlib,json,re,subprocess,tempfile
s=Path('dist/index.html').read_text()
for key,item in json.loads(Path('scripts/ip-compatibility.json').read_text()).items():
    found=re.findall(item['pattern'],s,re.S)
    assert found, key
    assert hashlib.sha256('\n'.join(found).encode()).hexdigest()==item['sha256'], key+' compatibility changed'
for name in ('Falling Blocks','Maze Chase','Number Path','Color Paths','Binary Grid','Sightline','Ants Apart'):
    assert name in s, name
assert not re.search(r'\b(?:Tetris|TETRIS|Pac-Man|PAC-MAN|Pacman|Zip Line|ZIP LINE)\b',s)
assert Path('games/word-guess-LICENSE.txt').read_text() in s
# MIT notices are embedded as JavaScript string literals, so verify the exact JSON-encoded text.
assert json.dumps(Path('licenses/0hh1-MIT.txt').read_text()) in s
assert json.dumps(Path('licenses/0hn0-MIT.txt').read_text()) in s
assert 'pocketpause.v1.binaryGrid' in s and 'pocketpause.v1.sightline' in s
assert 'pocketpause.v1.antsApartPrototype' in s
assert 'const mouth=' not in s and '>◕</span>' not in s
assert 'solid diamond navigator' in s and 'Ring drones' in s
# The app stays self-contained; a namespace URI is not an external asset.
assert not re.search(r'<(?:script|img|audio|video)[^>]*src=["\']https?://',s)
with tempfile.TemporaryDirectory() as directory:
    for i,m in enumerate(re.finditer(r'<script\b[^>]*>(.*?)</script>',s,re.S)):
        p=Path(directory)/f'module-{i}.mjs';p.write_text(m[1]);subprocess.run(['node','--check',str(p)],check=True)
print('PASS: display names, MIT notices, unchanged legacy save keys/engines/level data, new isolated save keys, differentiated maze art, bundled-script syntax.')
