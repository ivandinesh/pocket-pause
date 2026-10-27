import subprocess, shutil, tempfile
from pathlib import Path
steps=[
 'scripts/patch_tetris_appearance.py',
 'scripts/patch_new_games.py',
 'scripts/patch_zip_fidget_tune.py',
 'scripts/patch_zip_drag_fix.py',
 'scripts/patch_zip_live_drag.py',
 'scripts/patch_zip_touch_canvas.py',
 'scripts/patch_zip_redo.py',
 'scripts/patch_dots_2048.py',
 'scripts/patch_calm_trio.py',
 'scripts/patch_word_guess.py',
 'scripts/patch_logic_trio.py',
 'scripts/patch_ui_polish.py',
]
# All patch scripts operate on a disposable copy, never tracked source.
root=Path(__file__).resolve().parent.parent
with tempfile.TemporaryDirectory(prefix='dopop-build-') as temp:
    stage=Path(temp)
    for name in ('index.html','feedback-config.json','games','pwa','scripts'):
        source=root/name
        if source.is_dir(): shutil.copytree(source,stage/name)
        else: shutil.copy2(source,stage/name)
    import os
    os.chdir(stage)
    subprocess.run(['node','scripts/test_word_guess.cjs'],check=True)
    for step in steps:
        subprocess.run(['python3',step],check=True)
    Path('dist').mkdir(exist_ok=True)
    Path('dist/index.html').write_text(Path('index.html').read_text())
    print('Pocket Pause build complete')
    
    subprocess.run(['python3','scripts/build_offline.py'],check=True)
    
    for test in ['scripts/test_auto_update.cjs','scripts/test_logic_trio.cjs','scripts/test_new_games.cjs','scripts/test_calm_trio.cjs','scripts/test_offline.cjs']:
        subprocess.run(['node',test],check=True)
    output=root/'dist'
    if output.exists(): shutil.rmtree(output)
    shutil.copytree(stage/'dist',output)
