from pathlib import Path
p=Path('index.html')
s=p.read_text()
marker='/* Words: larger bonus and hint labels */'
if marker in s:
    raise SystemExit('already patched')
css='''\n/* Words: larger bonus and hint labels */\n#wordsPage #bonusCount{font-size:15px!important;font-weight:600;letter-spacing:.01em}\n#wordsPage .round-tool.hint small{font-size:12px!important;font-weight:700;letter-spacing:.02em;margin-top:3px}\n'''
needle='\n/* Snake-only true full-screen playfield */'
if needle not in s:
    raise SystemExit('insertion point not found')
s=s.replace(needle,css+needle,1)
p.write_text(s)
print('Words bonus and hint labels enlarged')
