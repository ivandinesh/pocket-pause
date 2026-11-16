from pathlib import Path

index = Path('index.html')
html = index.read_text()
css = Path('games/ant-tap.css').read_text()
js = Path('games/ant-tap.js').read_text()
html = html.replace('</head>', '<style>\n' + css + '</style>\n</head>', 1)
module = html.index('<script type="module">')
end = html.index('</script>', module)
index.write_text(html[:end] + '\n' + js + html[end:])
