from pathlib import Path
p=Path('index.html');s=p.read_text();assert 'id="logicTrioStyles"' not in s
s=s.replace('</head>','<style id="logicTrioStyles">'+Path('games/logic-trio.css').read_text()+'</style></head>')
s=s.replace('</script>',Path('games/logic-trio.js').read_text()+'\n</script>',1);p.write_text(s)
