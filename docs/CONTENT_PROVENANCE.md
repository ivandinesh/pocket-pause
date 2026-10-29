# Content provenance follow-up — 2026-10-29

Reviewed GitHub main `9432d19d09ca4ebbce5b8b0ca3d6516d3cab4698`.
The initial local source tree matched that main (`734f847ae4341ea68fdb8cd7f3fb573c4853a8c5`).
This is a source-history audit, not legal clearance. A commit author is not proof
of independent creation. No missing permission has been inferred from a missing
license on DoPop-owned code, and no third-party license has been assigned to
unrelated code.

## Confirmed imported content

Word Guess dictionary: tabatkins/wordle-list, MIT, Copyright (c) 2022 Tab Atkins Jr.
Source: https://github.com/tabatkins/wordle-list/blob/main/LICENSE
Full notice: `games/word-guess-LICENSE.txt`. Retained in the JavaScript bundle and
now rendered in the Home → Credits & licenses dialog. Both copies are inside the
hash-verified offline HTML. This confirmed dictionary import is separated from puzzle-rule acknowledgments.
After resuming, main advanced to `81ecb11f0a6a702b78dcd49fb79def4bd1882e48`,
adding Binary Grid, Sightline and Ants Apart. This change is based on that newer
main. It consolidates the existing credits button, retains both Q42 MIT notices,
and labels those games as rule references consistent with THIRD_PARTY.md; no
new claim of upstream engine import is made. All three new games are retained.
External source links need connectivity; the notice itself does not.

## Historical components investigated first

| Component | Traceable evidence | Result / next action |
|---|---|---|
| Words bank | First tracked in production snapshot `665fd83`; inline WORDS, EXTRA_WORDS and ANCHORS in index.html | Pre-snapshot authorship/source not recorded. Obtain the creation record or source/license from the owner. Not marked cleared. |
| Words 1,000 fixed levels | Added in `87a3f1ade7b96acc93a142a4cc69c34f712d67af` as literal word_levels in scripts/patch_zip_redo.py | Commit describes unique puzzles but contains no reproducible generating source or upstream attribution. Keep exact IDs, letters, targets and bonus words pending provenance. |
| Word Search | SEARCH_WORD_SETS and makeSearch introduced in `041bcd45060c7657e920448a7e28c94d8d015f36` | Inline themed sets and seeded placement, no external fetch or imported board pack. This supports local generation but does not establish authorship of the word selection. Keep exact sets/order and seeds pending confirmation. |
| 2048 | Introduced in `732b4c33de53c1d10e31e0615be991c15eb32ff5`; flat-array dopopMerge in scripts/patch_dots_2048.py | No upstream import or derivation record. Different structure from Cirulli is not proof of independent creation. Replaced the uncertain merge/move-availability core with pinned MIT upstream code in this change. The DoPop interface, storage, seeded spawn and undo remain unchanged; the import does not retroactively establish provenance of every older UI line. |

These investigations locate the evidence gaps; they do not resolve the missing
historical authorship. The owner answered “Not sure” about original sources on
2026-10-29. The 2048 rules engine was replaced with a documented licensed source;
word banks and level content were retained. Silently replacing uncertain word content would conflict with the
requirement to preserve existing level identities. Keeping legacy levels during
a migration would also retain their unresolved provenance, not cure it.

To close the gaps, supply creation records confirming internally authored code/
word selections and generated levels, or the exact external source and license.
For an externally sourced unlicensed component, seek permission or plan replacement.
If exact old content must be removed, level identity cannot simultaneously remain
unchanged; a separately reviewed migration must preserve earned progress and
explain the changed puzzle version rather than deleting saves.

## Random helper evidence

The Mulberry32-shaped routines in index.html and patch_zip_redo.py correspond to
the published algorithm. The JS reference explicitly declares public domain:
https://github.com/bryc/code/blob/master/jshash/PRNGs.md
Inspected blob: `5b58125493d8043cc416bd035b8f24fa8843e006`.
Original C reference by Tommy Ettinger carries a CC0 dedication:
https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
These are documented reference leads, not proof of the historical copy source.
No seeded algorithm was changed and no unverified import credit added to Home.

## Retained implementation and assets

All other game implementations remain unchanged. No external image, audio or font
file was identified in the reviewed tree. Sounds are synthesized and graphics
are drawn in code. Existing generator evidence and residual visual/name questions
remain documented in IP_REVIEW.md. This change does not grant blanket clearance.

## Compatibility and validation

Existing IP fingerprints protect save keys, fixed Words and Word Guess levels,
Number Path, Maze Chase, Color Paths and Falling Blocks. New fingerprints protect
Words bank/anchors, Word Search sets/generator and 2048 spawn/storage helpers.
The former merge-source fingerprint is deliberately replaced by a frozen golden
behavior digest captured before replacement: 16,368 moves covering exhaustive
short rows/columns and 1,500 seeded boards, all directions, scores, animation
destinations, legal-move detection and input immutability. New vendor checksums
protect the exact pinned source files.
Do not regenerate these fixtures to hide a behavior change. Full release tests
verify these alongside offline hashing and license inclusion. Native dialog
provides keyboard dismissal and focus containment; closing restores footer focus.
Physical iOS/Android checks and a real installed-PWA upgrade remain manual QA.

## 2048 licensed engine replacement

Source: https://github.com/gabrielecirulli/2048
Pinned commit: `478b6ec346e3787f589e4af751378d06ded4cbbc`.
License: MIT, Copyright (c) 2014 Gabriele Cirulli, `licenses/2048-MIT.txt`.
Unmodified files in `games/vendor/2048/`:

| File | Upstream Git blob |
|---|---|
| grid.js | 29f0821e505b0440db8ba23c6ae88f4b5f44180a |
| tile.js | 92a670a5a60507bae99f333f0d3a9e23706f629f |
| game_manager.js | 1c13d15bd667afe06f95316942324885c45d8e6d |
| LICENSE.txt (stored as licenses/2048-MIT.txt) | b0dbfa4d7526587bcc21a4883222b20805d5c065 |

`games/merge-licensed.js` scopes these classes and adapts their movement to
DoPop's existing flat 16-cell board. It never constructs the upstream input,
storage or rendering managers. Upstream random spawning and rendering hooks
are replaced with no-ops on the isolated transient manager; DoPop continues to
spawn exactly once through its existing seeded function and renders its own UI.
No upstream artwork, fonts, keyboard handler, storage adapter or styles are
imported. Full MIT text is bundled with the code and readable in Credits offline.

This replacement resolves the source of the active merge and move-availability
engine. It is not a statement that all historical DoPop code is Cirulli's or MIT.

## Validation outcome — 2026-10-29

Normal `python3 scripts/build.py`: PASS, including all 20 games in the mocked
offline cache, both 1,000-level path/maze suites, existing game rule checks,
16,368 legacy-equivalent 2048 moves, readable full notices and unchanged save/
level fingerprints. `git diff --check`: PASS. Source snapshots were not updated
to disguise word-data or persistence changes.

Browser UI/physical-device QA is outstanding: no browser executable is installed
in this environment, and both Chromium download attempts failed. Automated HTML
and hash checks verify bundling, not visual layout or native focus behavior.
Check Home credits at 320px width and desktop, scroll all notices, use Done and
Escape, verify focus returns, then repeat offline in an installed PWA.

## Follow-up — Words and Word Search data replacement — 2026-10-29

The original lexical source could not be established from the repository history
or owner confirmation. The prior Words bank, fixed 1,000-level table, and four
Word Search sets have been removed from the current source/build inputs. Git
history was not rewritten, so older commits still contain the historical data.

Current source: Alan Beale's 12dicts release 6.0.2,
`International/3of6game.txt`. The compiler explicitly releases the lists to the
public domain and requests acknowledgment. DoPop uses neither of the 12dicts
lists whose antecedent terms are excepted (`2of12inf` and `2+2+3`). The archive
SHA-256 and the transformed dataset hashes are recorded in
`games/word-content-manifest.json`; the archive checksum matches the SourceForge
release page. Offline Home credits include the source, compiler, data treatment,
and requested acknowledgment in `games/12dicts-NOTICE.txt`.

The committed normalized lexicon contains 24,148 unique uppercase ASCII entries
of 3–7 letters, selected from unannotated entries only. Words levels are
reproducibly generated from that pinned lexicon: 1,000 distinct playable racks,
with target count increasing from three to six across four level bands. Word
Search uses eight newly selected themes from the same lexicon and retains its
local seeded grid generator. Its 1,000-level selector remains; only the themed
word content and resulting grids change.

Words keeps its existing `words.progress` storage key and level index. Save
content version 2 retains level and score but discards legacy in-progress finds,
bonus finds, hint reveals, and hint count, then informs the player. Word Search
keeps its existing numeric puzzle key; it did not persist found-word attempts.
The Word Guess dictionary and fixed answer IDs are untouched. These changes
resolve the missing source attribution for current Words/Word Search data; they
do not establish independent authorship for all historical game code or provide
formal legal clearance.
