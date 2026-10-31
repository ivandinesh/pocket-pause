# Third-party software and content

DoPop keeps third-party provenance explicit. A credit is not a substitute for the applicable license; full notices are bundled into the offline application when required.

| DoPop component | Upstream/reference | License | What DoPop uses |
| --- | --- | --- | --- |
| 2048 movement engine | https://github.com/gabrielecirulli/2048 at `478b6ec346e3787f589e4af751378d06ded4cbbc` | MIT; Copyright (c) 2014 Gabriele Cirulli | Unmodified Grid, Tile and GameManager code, isolated behind the DoPop adapter. Full notice: `licenses/2048-MIT.txt`. |
| Binary Grid | 0hh1, Q42; preserved source lineage via https://github.com/florisluiten/0hh1 | MIT; Copyright (c) 2014 Q42 | Puzzle-rule lineage/reference. DoPop supplies its own deterministic level generation, interface, saves, styling and offline integration. Full notice: `licenses/0hh1-MIT.txt`. |
| Sightline | 0hn0, Q42; upstream https://github.com/Techdojo/0hn0 | MIT; Copyright (c) 2015 Q42 | Puzzle-rule lineage/reference. DoPop supplies its own deterministic level generation, interface, saves, styling and offline integration. Full notice: `licenses/0hn0-MIT.txt`. |
| Word Guess accepted dictionary | tabatkins/wordle-list | MIT | Accepted-guess dictionary, with editorial vocabulary exclusions. Existing full notice remains in `games/word-guess-LICENSE.txt`. |
| Words and Word Search lexicon | Alan Beale, 12dicts 6.0.2, `International/3of6game.txt` | Public domain; compiler requests acknowledgment | Filtered 3–7 letter subset with editorial vocabulary exclusions. Source release, exact archive hash, transformation and offline attribution: `games/word-content-manifest.json` and `games/12dicts-NOTICE.txt`. |
| Hidden Rays beam tracing | Simon Tatham's Portable Puzzle Collection, `blackbox.c:fire_laser_internal`, revision `616da16f25da428ccda805536209095bd062676e` | MIT; full contributor notice retained | Rule precedence adapted into `games/quiet-core.js:ray`. Full notice: `licenses/portable-puzzles-MIT.txt`, included in offline credits. No upstream frontend, artwork or puzzle pack imported. |

## Import policy

- Pin and record the exact upstream repository and license before incorporating third-party code or data.
- Prefer permissive licenses suitable for commercial redistribution, such as MIT, BSD, Apache-2.0 or ISC.
- Do not import GPL/AGPL code into the bundled DoPop application without an explicit licensing decision for the combined work.
- Do not treat source-available, freeware, game mechanics, artwork, music, levels or branding as reusable merely because they can be viewed online.
- Preserve all required copyright and permission notices in offline distributions.

## Public notices and historical provenance

Home → Credits & licenses includes the Word Guess dictionary, 12dicts word-data
attribution, and 2048 engine notices, plus the existing Q42 notices offline. Rule
references are labeled separately from imported code and derived data. The
historical audit and replacement record are in
[CONTENT_PROVENANCE.md](docs/CONTENT_PROVENANCE.md).

## New puzzle rule references

The sixteen-game expansion is documented in [SIXTEEN_GAMES_IMPLEMENTATION.md](docs/SIXTEEN_GAMES_IMPLEMENTATION.md). Its new interfaces, deterministic generators and fixed level packs are DoPop-authored. Memory Pairs uses original geometric symbols. The remaining games refer to the Portable Puzzle Collection's documented rules; only the identified Hidden Rays tracing adaptation is attributed as copied/adapted implementation. Source inspection and license fingerprints are in [the research manifest](docs/research/new-game-sources-2026-10-31.json).

Rotate Network, Loop, Color Code and Picture Grid reference the documented Net, Loopy, Guess and Pattern rules in the [Portable Puzzle Collection](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/). The new JavaScript, UI, canvas/SVG geometry and procedural level content were written for DoPop. No upstream code or puzzle pack was imported, so these references are not listed as bundled MIT code. Exact manual URLs, generator paths and the pinned level-pack hash are in `games/puzzle-set-manifest.json`. Any future upstream code import requires a pinned revision, a file-level license check and the full applicable offline notice.
