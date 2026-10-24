import subprocess
from pathlib import Path
steps=[
 'scripts/patch_tetris_appearance.py',
 'scripts/patch_new_games.py',
 'scripts/patch_zip_fidget_tune.py',
 'scripts/patch_zip_drag_fix.py',
 'scripts/patch_zip_live_drag.py',
]
for step in steps:
    subprocess.run(['python3',step],check=True)
Path('dist').mkdir(exist_ok=True)
Path('dist/index.html').write_text(Path('index.html').read_text())
print('Pocket Pause build complete')
