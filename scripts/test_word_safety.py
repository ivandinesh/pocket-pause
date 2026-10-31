"""Editorial vocabulary, level solvability and stable-slot release checks."""
from collections import Counter
import hashlib
import json
from pathlib import Path

root=Path(__file__).resolve().parent.parent
games=root/'games'
manifest=json.loads((games/'word-content-manifest.json').read_text())
policy=json.loads((games/'word-safety-policy.json').read_text())
blocked=set().union(*map(set,policy['categories'].values()))
def words(name):
    entries=(games/name).read_text().upper().split()
    assert len(entries)==len(set(entries)),name+' duplicates'
    assert not (set(entries)&blocked),name+' contains excluded entries'
    return entries

lex=words('words-lexicon.txt');dictionary=words('word-guess-dictionary.txt');answers=words('word-guess-answers.txt')
assert len(lex)==manifest['lexicon_entries']
assert len(dictionary)==manifest['word_guess']['dictionary_entries']
assert len(answers)==1000 and set(answers)<=set(dictionary)
assert all(len(w)==5 for w in dictionary+answers)
assert {'RAPE','SHIT','FUCK','CUNT','NIGGER','FAGGOT'}<=blocked
# Fragment matching must not erase harmless everyday words or neutral identities.
assert {'GRAPE','GRASS','SHELL','TITLE','CLASS','ASSIST','CUMIN','WHISK','GAY','QUEER'}<=set(lex)
checks={'words-lexicon.txt':manifest['lexicon_sha256'],'word-search-themes.json':manifest['word_search_themes_sha256'],
        'word-levels.json':manifest['word_levels_sha256'],'word-safety-policy.json':manifest['word_safety_policy_sha256'],
        'word-guess-dictionary.txt':manifest['word_guess']['dictionary_sha256'],'word-guess-answers.txt':manifest['word_guess']['answers_sha256']}
for filename,digest in checks.items():assert hashlib.sha256((games/filename).read_bytes()).hexdigest()==digest,filename
levels=json.loads((games/'word-levels.json').read_text());assert len(levels)==1000
signatures=set()
for i,level in enumerate(levels):
    rack=level['letters'];targets=level['targets']
    assert len(rack)==(4 if i<100 else 5 if i<400 else 6 if i<750 else 7)
    assert rack in lex and len(targets)==3+i//250 and len(set(targets))==len(targets)
    signature=''.join(sorted(rack));assert signature not in signatures;signatures.add(signature)
    assert all(word in lex and not (Counter(word)-Counter(rack)) for word in targets),(i+1,level)
stable=[v for i,v in enumerate(levels,1) if i not in manifest['review']['words_changed_levels']]
assert hashlib.sha256(json.dumps(stable,separators=(',',':')).encode()).hexdigest()==manifest['review']['unchanged_words_levels_sha256']
themes=json.loads((games/'word-search-themes.json').read_text())
assert len(themes)==8 and all(set(theme)<=set(lex) for theme in themes)
print(f'PASS: all vocabulary exclusions, provenance hashes, 1,000 solvable Words slots ({len(stable)} unchanged), 1,000 Word Guess answers and 8 themes.')
