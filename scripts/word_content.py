"""Build deterministic Words levels from the pinned, attributed game lexicon."""
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
LEXICON_PATH = ROOT / 'games/words-lexicon.txt'
MANIFEST_PATH = ROOT / 'games/word-content-manifest.json'
LEVEL_COUNT = 1000


def load_lexicon():
    manifest = json.loads(MANIFEST_PATH.read_text())
    data = LEXICON_PATH.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if digest != manifest['lexicon_sha256']:
        raise ValueError('Words lexicon checksum does not match its provenance manifest')
    words = data.decode('ascii').splitlines()
    if len(words) != manifest['lexicon_entries'] or words != sorted(set(words)):
        raise ValueError('Words lexicon is not the pinned normalized word list')
    if any(not (3 <= len(word) <= 7 and word.isalpha() and word.isupper()) for word in words):
        raise ValueError('Words lexicon contains an unexpected entry')
    return words, manifest


def javascript_content():
    words, manifest = load_lexicon()
    if manifest['version'] != 2:
        raise ValueError('Words content version and provenance manifest disagree')
    data = (ROOT / 'games/word-levels.json').read_bytes()
    if hashlib.sha256(data).hexdigest() != manifest['word_levels_sha256']:
        raise ValueError('Pinned Words levels checksum differs from the reviewed content')
    levels = json.loads(data)
    if len(levels) != LEVEL_COUNT:
        raise ValueError('Expected 1,000 pinned Words levels')
    racks = [level['letters'] for level in levels]
    return '''const WORD_CONTENT_VERSION=2;
const WORD_BANK=''' + json.dumps(words, separators=(',', ':')) + ''';
const WORD_LEVEL_RACKS=''' + json.dumps(racks, separators=(',', ':')) + ''';
const WORD_LEVEL_TARGETS=''' + json.dumps([level['targets'] for level in levels], separators=(',', ':')) + ''';
function wordsFor(letters){return WORD_BANK.filter(w=>canSpell(w,letters)).sort((a,b)=>a.length-b.length||a.localeCompare(b));}
function wordRng(seed){let x=(seed>>>0)||0x6d2b79f5;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function makeWordLevel(index){
  const i=((index%1000)+1000)%1000,letters=WORD_LEVEL_RACKS[i],all=wordsFor(letters),targets=[...WORD_LEVEL_TARGETS[i]];
  const targetSet=new Set(targets);
  return{letters,targets,bonus:all.filter(w=>!targetSet.has(w))};
}
'''
