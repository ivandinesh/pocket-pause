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
 'scripts/patch_maze_ant_spider.py',
 'scripts/patch_dots_2048.py',
 'scripts/patch_calm_trio.py',
 'scripts/patch_word_guess.py',
 'scripts/patch_logic_trio.py',
 'scripts/patch_mit_duo.py',
 'scripts/patch_ants_apart.py',
 'scripts/patch_puzzle_set.py',
 'scripts/patch_ui_polish.py',
 'scripts/patch_responsive.py',
 'scripts/patch_game_session.py',
 'scripts/patch_credits.py',
 'scripts/patch_privacy_analytics.py',
 'scripts/patch_faro.py',
 'scripts/patch_play_metrics.py',
 'scripts/patch_theme.py',
 'scripts/patch_seo.py',
]
# All patch scripts operate on a disposable copy, never tracked source.
root=Path(__file__).resolve().parent.parent
with tempfile.TemporaryDirectory(prefix='dopop-build-') as temp:
    stage=Path(temp)
    for name in ('index.html','vercel.json','feedback-config.json','games','pwa','scripts','app','licenses','seo'):
        source=root/name
        if source.is_dir(): shutil.copytree(source,stage/name)
        else: shutil.copy2(source,stage/name)
    import os
    os.chdir(stage)
    subprocess.run(['node','scripts/test_word_guess.cjs'],check=True)
    subprocess.run(['node','scripts/test_mit_duo.cjs'],check=True)
    subprocess.run(['node','scripts/test_puzzle_set.cjs'],check=True)
    subprocess.run(['node','scripts/test_theme.cjs'],check=True)
    subprocess.run(['node','scripts/test_telemetry.cjs'],check=True)
    subprocess.run(['node','scripts/test_save_safety.cjs'],check=True)
    subprocess.run(['python3','scripts/test_html_scripts.py'],check=True)
    subprocess.run(['node','scripts/test_guide_client.cjs'],check=True)
    for step in steps:
        subprocess.run(['python3',step],check=True)
    Path('dist').mkdir(exist_ok=True)
    Path('dist/index.html').write_text(Path('index.html').read_text())
    print('Pocket Pause build complete')
    
    subprocess.run(['python3','scripts/build_offline.py'],check=True)
    subprocess.run(['python3','scripts/build_seo.py'],check=True)
    
    for test in ['scripts/test_ants_apart.cjs','scripts/test_game_session.cjs','scripts/test_responsive.cjs','scripts/test_auto_update.cjs','scripts/test_logic_trio.cjs','scripts/test_new_games.cjs','scripts/test_2048_compat.cjs','scripts/test_calm_trio.cjs','scripts/test_mit_duo.cjs','scripts/test_mit_duo_release.cjs','scripts/test_offline.cjs','scripts/test_renamed_games.cjs','scripts/test_faro.cjs']:
        subprocess.run(['node',test],check=True)
    subprocess.run(['python3','scripts/test_ip_release.py'],check=True)
    subprocess.run(['python3','scripts/test_credits.py'],check=True)
    subprocess.run(['python3','scripts/test_seo.py'],check=True)
    subprocess.run(['python3','scripts/build_security.py'],check=True)
    subprocess.run(['python3','scripts/test_security_release.py'],check=True)
    output=root/'dist'
    if output.exists(): shutil.rmtree(output)
    shutil.copytree(stage/'dist',output)
