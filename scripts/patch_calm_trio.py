"""Add three isolated games to the existing site; generate reproducible Color Paths puzzles."""
import json, random
from pathlib import Path

def adjacent(a,b,n): return abs(a%n-b%n)+abs(a//n-b//n)==1

def levels():
    result=[]; seen=set()
    for level in range(1,51):
        n=5 if level<=18 else 6 if level<=36 else 7
        rng=random.Random(42791+level*809)
        for attempt in range(200):
            path=[r*n+c for r in range(n) for c in (range(n) if r%2==0 else range(n-1,-1,-1))]
            # Backbite transformations preserve one full-board Hamiltonian path.
            for _ in range(n*n*35):
                if rng.random()<.5: path.reverse()
                options=[i for i in range(3,len(path)) if adjacent(path[0],path[i],n)]
                if options:
                    i=rng.choice(options);path=path[i-1::-1]+path[i:]
            count=4 if n==5 else 5 if n==6 else 6
            lengths=[3]*count
            for _ in range(n*n-3*count): lengths[rng.randrange(count)]+=1
            paths=[];at=0
            for length in lengths: paths.append(path[at:at+length]);at+=length
            # Reject trivial neighboring endpoints and repeated endpoint layouts.
            if any(adjacent(p[0],p[-1],n) for p in paths): continue
            key=(n,tuple(sorted(tuple(sorted((p[0],p[-1]))) for p in paths)))
            if key in seen: continue
            seen.add(key)
            assert sorted(sum(paths,[]))==list(range(n*n))
            assert all(adjacent(a,b,n) for p in paths for a,b in zip(p,p[1:]))
            result.append({'n':n,'ends':[[p[0],p[-1]] for p in paths],'solution':paths})
            break
        else: raise RuntimeError('Could not generate distinct level')
    return result

if __name__=='__main__':
    p=Path('index.html');s=p.read_text()
    assert 'id="calmTrioStyles"' not in s
    data=levels()
    # Solutions retained for validation/hints, no remote service or user data.
    js='const CALM_FLOW_LEVELS='+json.dumps(data,separators=(',',':'))+';\n'+Path('games/calm-trio.js').read_text()
    s=s.replace('</head>','<style id="calmTrioStyles">'+Path('games/calm-trio.css').read_text()+'</style></head>')
    s=s.replace('</script>',js+'\n</script>',1)
    p.write_text(s)
    print('Added Color Paths, Untangle and Flood: 50 levels each')
