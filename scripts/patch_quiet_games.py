"""Add inert shells; all new game engines and level packs remain deferred."""
from pathlib import Path
from html import escape
import json
p=Path('index.html');s=p.read_text();specs=json.loads(Path('games/quiet-specs.json').read_text())
assert 'id="quietCards"' not in s
cards=[];pages=[]
for spec in specs:
    id=spec['id'];name=escape(spec['name']);subtitle=escape(spec['subtitle'])
    cards.append('<button class="game-card" data-quiet-game="'+id+'"><span class="mini-art quiet-art" aria-hidden="true"><svg viewBox="0 0 64 64">'+spec['icon']+'</svg></span><span class="card-copy"><b>'+name+'</b></span></button>')
    pages.append('<section id="'+id+'Page" class="page game-page quiet-game" aria-label="'+name+' game"><div class="game-heading"><button class="back-button" aria-label="Back to games">←</button><div><p class="eyebrow">'+name.upper()+'</p><h1>'+subtitle+'</h1></div><div class="quiet-stat"><b data-level-value>1</b><span>of 30</span></div></div><div class="quiet-board-wrap"><div class="quiet-board"></div><div class="quiet-tools" aria-label="Game tools"></div></div><p class="quiet-note" role="status" aria-live="polite"></p><div class="quiet-actions"><button data-quiet-level>Level 1</button><button data-quiet-undo disabled>Undo</button><button data-quiet-hint>Hint</button><button data-quiet-reset>Retry</button><button data-quiet-help aria-label="How to play '+name+'">?</button><button data-quiet-next class="quiet-next" hidden>Next</button><button data-quiet-retry-load hidden>Try opening again</button></div></section>')
s=s.replace('</main>',''.join(pages)+'</main>',1)
s=s.replace('</body>','<template id="quietCards">'+''.join(cards)+'</template></body>',1)
s=s.replace('</head>','<style>.quiet-art svg{width:72%;height:72%;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}.quiet-art{color:var(--theme-accent,#4f78ec)}.quiet-game .quiet-note{min-height:30px;text-align:center;color:var(--theme-muted,#65748d)}body:has(.quiet-game.active) .topbar{display:none}body:has(.quiet-game.active) #app{min-height:100dvh}</style></head>',1)
pos=s.index('<script type="module">');end=s.index('</script>',pos)
s=s[:end]+Path('app/quiet-loader.js').read_text()+s[end:]
p.write_text(s)
print('Added 16 deferred game shells; existing engines and saves retained')
