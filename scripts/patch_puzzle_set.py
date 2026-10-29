from pathlib import Path
p=Path('index.html')
s=p.read_text()
assert 'id="puzzleSetStyles"' not in s
s=s.replace('</head>','<style id="puzzleSetStyles">'+Path('games/puzzle-set.css').read_text()+'</style></head>')
js=Path('games/puzzle-set-core.js').read_text()+'\nconst PuzzleSetLevels='+Path('games/puzzle-set-levels.json').read_text().strip()+';\n'+Path('games/puzzle-set.js').read_text()
s=s.replace('</script>',js+'\n</script>',1)
p.write_text(s)
