"""Embed verified third-party notices in the hashed offline app."""
from html import escape
from pathlib import Path
p=Path('index.html');s=p.read_text()
assert 'id="creditsDialog"' not in s
notice=escape(Path('games/word-guess-LICENSE.txt').read_text())
word_data_notice=escape(Path('games/12dicts-NOTICE.txt').read_text())
markup='''
<dialog id="creditsDialog" aria-labelledby="creditsTitle">
<h2 id="creditsTitle" tabindex="-1" autofocus>Credits &amp; licenses</h2>
<p>Third-party content included in DoPop is listed below. These notices are available offline; source links need an internet connection.</p>
<h3>Derived word data: Words and Word Search</h3>
<pre>'''+word_data_notice+'''</pre>
<h3>Imported content: Word Guess dictionary</h3>
<p>The accepted-word dictionary comes from <a href="https://github.com/tabatkins/wordle-list" target="_blank" rel="noopener noreferrer">tabatkins/wordle-list</a>, by Tab Atkins Jr., under the MIT License. This attribution covers the dictionary, not the whole game.</p>
<pre>'''+notice+'''</pre>
<h3>Imported code: 2048 movement engine</h3>
<p>Based on <a href="https://github.com/gabrielecirulli/2048/tree/478b6ec346e3787f589e4af751378d06ded4cbbc" target="_blank" rel="noopener noreferrer">2048 by Gabriele Cirulli</a>, under the MIT License. DoPop supplies the interface, saved-game format and deterministic tile spawning.</p>
<details><summary>2048 — MIT notice</summary><pre>'''+escape(Path('licenses/2048-MIT.txt').read_text())+'''</pre></details>
<h3>Puzzle-rule acknowledgments</h3>
<p>Binary Grid draws on the rules popularized by 0hh1; Sightline draws on 0hn0, both from Q42. These are rule references, separate from imported code attribution. DoPop provides its own generators and interface. The existing upstream notices are retained below.</p>
<p><a href="https://github.com/florisluiten/0hh1" target="_blank" rel="noopener noreferrer">0hh1 source reference</a> · <a href="https://github.com/Techdojo/0hn0" target="_blank" rel="noopener noreferrer">0hn0 source reference</a></p>
<p>Rotate Network, Loop, Color Code and Picture Grid use DoPop implementations and generated levels. Rule references for new puzzles: <a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/net.html" target="_blank" rel="noopener noreferrer">Net</a>, <a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/loopy.html" target="_blank" rel="noopener noreferrer">Loopy</a>, <a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/guess.html" target="_blank" rel="noopener noreferrer">Guess</a> and <a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/pattern.html" target="_blank" rel="noopener noreferrer">Pattern</a> in the Portable Puzzle Collection. No reference code, puzzle packs or artwork are bundled for these four games.</p>
<details><summary>0hh1 — MIT notice</summary><pre>'''+escape(Path('licenses/0hh1-MIT.txt').read_text())+'''</pre></details>
<details><summary>0hn0 — MIT notice</summary><pre>'''+escape(Path('licenses/0hn0-MIT.txt').read_text())+'''</pre></details>
<form method="dialog"><button class="soft-button">Done</button></form>
</dialog>
'''
css='''<style>
#creditsDialog{box-sizing:border-box;width:min(640px,calc(100% - 24px));max-height:85dvh;overflow:auto;padding:24px;border:1px solid #dfe7f8;border-radius:24px;background:#fff;color:#33415e}
#creditsDialog::backdrop{background:#26334d66}#creditsDialog h2{margin:0 0 16px;font-size:24px}#creditsDialog p{line-height:1.6}#creditsDialog pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;line-height:1.6;background:#f5f7fb;padding:16px;border-radius:12px}#creditsDialog a,#creditsLicensesButton{color:#315ec7}#creditsDialog button{min-height:44px;padding:10px 20px}#creditsLicensesButton{display:inline-flex;align-items:center;min-height:44px;padding:0 8px}#creditsDialog :focus-visible,#creditsLicensesButton:focus-visible{outline:2px solid #315ec7;outline-offset:3px}
</style>'''
s=s.replace('</head>',css+'</head>')
s=s.replace('</body>',markup+'</body>')
p.write_text(s)
