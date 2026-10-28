from pathlib import Path
p=Path('index.html');s=p.read_text();assert 'id="antsApartStyles"' not in s
s=s.replace('</head>','<style id="antsApartStyles">'+Path('games/ants-apart.css').read_text()+'</style></head>')
s=s.replace('</script>',Path('games/ants-apart.js').read_text()+'\n</script>',1)
p.write_text(s)
