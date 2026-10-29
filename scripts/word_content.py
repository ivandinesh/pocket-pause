"""Build deterministic Words levels from the pinned, attributed game lexicon."""
from collections import Counter
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
LEXICON_PATH = ROOT / 'games/words-lexicon.txt'
MANIFEST_PATH = ROOT / 'games/word-content-manifest.json'
LEVEL_COUNT = 1000
RACKS_BY_LENGTH = {4: 100, 5: 300, 6: 350, 7: 250}


def _rank(value):
    return hashlib.sha256(('dopop-words-v2:' + value).encode('ascii')).digest()


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


def _can_spell(word_counts, rack_counts):
    return all(rack_counts.get(letter, 0) >= count for letter, count in word_counts.items())


def level_racks(words):
    """Return 1,000 distinct, playable racks in a stable length progression."""
    word_counts = [(word, Counter(word)) for word in words]
    anchors_by_length = {length: {} for length in RACKS_BY_LENGTH}
    for word in words:
        if len(word) in anchors_by_length:
            signature = ''.join(sorted(word))
            anchors_by_length[len(word)].setdefault(signature, word)

    eligible = {}
    for length, needed in RACKS_BY_LENGTH.items():
        anchors = sorted(
            anchors_by_length[length].items(),
            key=lambda item: _rank(item[0]),
        )
        accepted = []
        for signature, anchor in anchors:
            rack_counts = Counter(anchor)
            matches = 0
            for word, counts in word_counts:
                if len(word) <= length and _can_spell(counts, rack_counts):
                    matches += 1
                    if matches == 6:
                        accepted.append((signature, anchor))
                        break
            if len(accepted) >= needed + 200:
                break
        eligible[length] = accepted

    racks = []
    for length, needed in RACKS_BY_LENGTH.items():
        racks.extend(anchor for _, anchor in eligible[length][:needed])
    if len(racks) < LEVEL_COUNT:
        remaining = [
            item
            for length, values in eligible.items()
            for item in values[RACKS_BY_LENGTH[length]:]
        ]
        remaining.sort(key=lambda item: _rank(item[0]))
        racks.extend(anchor for _, anchor in remaining[:LEVEL_COUNT - len(racks)])
    if len(racks) != LEVEL_COUNT or len({''.join(sorted(rack)) for rack in racks}) != LEVEL_COUNT:
        raise ValueError('Pinned lexicon cannot provide 1,000 distinct playable Words racks')
    return racks


def javascript_content():
    words, manifest = load_lexicon()
    if manifest['version'] != 2:
        raise ValueError('Words content version and provenance manifest disagree')
    racks = level_racks(words)
    return '''const WORD_CONTENT_VERSION=2;
const WORD_BANK=''' + json.dumps(words, separators=(',', ':')) + ''';
const WORD_LEVEL_RACKS=''' + json.dumps(racks, separators=(',', ':')) + ''';
function wordsFor(letters){return WORD_BANK.filter(w=>canSpell(w,letters)).sort((a,b)=>a.length-b.length||a.localeCompare(b));}
function wordRng(seed){let x=(seed>>>0)||0x6d2b79f5;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function makeWordLevel(index){
  const i=((index%1000)+1000)%1000,letters=WORD_LEVEL_RACKS[i],all=wordsFor(letters),random=wordRng(Math.imul(i+1,0x9e3779b1));
  const count=3+Math.floor(i/250),pool=all.filter(w=>w.length>=4&&w!==letters);
  for(let n=pool.length-1;n>0;n--){const j=Math.floor(random()*(n+1));[pool[n],pool[j]]=[pool[j],pool[n]];}
  const targets=all.includes(letters)?[letters]:[];
  for(const word of pool){if(targets.length>=count)break;if(!targets.includes(word))targets.push(word);}
  for(const word of all){if(targets.length>=count)break;if(!targets.includes(word))targets.push(word);}
  const targetSet=new Set(targets);
  return{letters,targets,bonus:all.filter(w=>!targetSet.has(w))};
}
'''
