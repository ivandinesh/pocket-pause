"""Bundle Word Guess locally before the existing hash-verified offline release."""
import json
from pathlib import Path

root=Path(__file__).resolve().parent.parent
p=root/'index.html'
s=p.read_text()
assert 'id="wordGuessStyles"' not in s, 'Word Guess already applied: use a fresh source build'
answers=(root/'games/word-guess-answers.txt').read_text().split()
dictionary=sorted(set((root/'games/word-guess-dictionary.txt').read_text().upper().split()))
assert len(answers)==len(set(answers))==1000
assert all(len(w)==5 and w.isalpha() and w in dictionary for w in answers)
js='const WG_ANSWERS='+json.dumps(answers)+';\nconst WG_DICTIONARY=new Set('+json.dumps(dictionary)+');\n'
manifest=json.loads((root/'games/word-content-manifest.json').read_text())
js+='const WG_UPDATED_ANSWER_INDICES=new Set('+json.dumps([r['level']-1 for r in manifest['word_guess']['replacements']])+');\n'
js+='/* '+(root/'games/word-guess-LICENSE.txt').read_text()+' */\n'
js+=(root/'games/word-guess-core.js').read_text()+'\n'+(root/'games/word-guess.js').read_text()
s=s.replace('</head>','<style id="wordGuessStyles">'+(root/'games/word-guess.css').read_text()+'</style></head>')
s=s.replace('</script>',js+'\n</script>',1)
p.write_text(s)
print('Word Guess: 1,000 fixed answers and',len(dictionary),'offline guesses')
