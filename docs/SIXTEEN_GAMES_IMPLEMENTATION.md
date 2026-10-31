# Sixteen-game expansion — implementation and validation

Date: 2026-10-31. This implements the 16-game shortlist from [the research plan](NEW_GAMES_RESEARCH_AND_PLAN.md). A local preview was provided before the user authorized final checks, commit and push.

## Scope

The catalogue grows from 24 to 40 games. Each addition has 30 pinned levels/layouts (480 total), a geometric home icon, compact game controls, both themes, help, keyboard/pointer input, independent saved attempts, retry, undo and optional free hints. The existing footer and appearance entry stay in their established locations. There is no new wallet, paid retry, account, ad, remote content API or analytics provider.

| Game | Campaign and correctness |
|---|---|
| Memory Pairs | 6, 8 and 10 pairs; exact pair inventory; hidden identities stay out of accessibility labels |
| Flip Lights | 3×3 to 5×5; constructive reachable starts; GF(2) solution hints; no unproven optimal-move claim |
| Peg Solitaire | Small square and later cross masks; reverse-generated starts with replayed forward witnesses; one peg may finish anywhere |
| Domino Pairs | Complete double-two/double-three sets; unique tilings verified by exact search |
| Rectangles | One area clue per rectangular region; unique partitions independently verified |
| Tents | Unique tent layouts; row/column and diagonal checks plus perfect tree/tent matching |
| Slant | Vertex counts and global cycle rejection; unique complete diagonal arrangements |
| Dot Sweep | Safe opening; verified no-guess route with local/subset deductions; free undo/retry after an accidental reveal |
| Greater Grid | Unique Latin squares with inequalities and fixed values |
| Skyline | Unique Latin squares with visibility clues from all four sides |
| Symmetry Islands | Connected, half-turn-symmetric regions with one center each; unique partition verified |
| Magnets | Unknown versus confirmed neutral domino states; polarity and row/column counts; unique assignment |
| Four Regions | Four symbol-coded colors, fixed clues and shared-edge constraints; unique assignments relative to those labels |
| Cage Sums | Connected arithmetic cages; unique Latin solution; correct repeated values, differences and exact ratios |
| Tracks | One connected A–B route, fixed segments and aligned occupancy clues; no separate loops; unique route verified |
| Hidden Rays | Bounded ray tracing with entry precedence; every observationally equivalent arrangement is accepted |

The generators and packs are DoPop-authored. Beam tracing adapts the rule precedence of the Portable Puzzle Collection's `blackbox.c`; its exact source revision and full MIT notice are recorded in `scripts/runtime-inventory.json`, `THIRD_PARTY.md`, the offline credits and `licenses/portable-puzzles-MIT.txt`. Other upstream references describe rules, not imported commercial boards or assets. Names are descriptive labels, not trademark-clearance claims.

## Startup and offline behavior

Only inert page shells, original icons and a small loader join the existing application. The new rule core, interface module, stylesheet, help specifications and level JSON load when a new game is opened. They are content-addressed same-origin assets; no new external runtime dependency or permissive CSP exception is required. A fresh home load must leave `DoPopQuietCore` undefined.

The whole set of deferred assets remains part of the verified atomic offline release. Deferred execution reduces startup parsing, not the total installation bytes. Both the pre-packaging worker tests and final security packaging rebuild their digests after new assets are emitted. An incomplete download cannot replace the last complete release or truthfully claim that every game is offline-ready.

New board shells use the existing single-instance responsive relocation mechanism. The board and controls are never duplicated for desktop and mobile. New styles use existing theme roles and scope to the new pages. Dragging also has tap alternatives; a resize cancels an incomplete gesture. Small-screen edge and clue placement are covered in the responsive suite.

## Save compatibility

Each game uses a new `pocketpause.v1.<gameId>` key with `version: 1`, `contentVersion: 1`, current level, per-level attempts, histories and best unassisted result. Existing keys, engines and pinned level packs remain separate. Level content is committed rather than regenerated on page load, so an RNG or generator change cannot silently alter an existing level.

Undo keeps the active attempt's last 30 snapshots, with up to 90 additional snapshots across inactive unfinished attempts. Completed inactive boards retain their result and board while releasing undo copies. This limits storage pressure without deleting levels/results or touching another game's records. Storage failures show an export-backup message; writes never clear unrelated keys. A repaired new-game record retains its valid per-level attempts instead of discarding the entire game.

Backups fail closed for a deferred game's key until its semantic validator is available. The import flow calls `DoPopSaveSafety.prepare(data)` before validation, which loads only the pure core and relevant level packs. It does not require opening the game or loading its UI/styles. Validation is still synchronous after preparation; existing restore leases, snapshot/rollback behavior, generation marker and multi-tab checks remain in place.

Hint use is recorded per attempt and stays assisted through Undo. Existing unassisted bests remain saved. A retry starts a new attempt. Peg hints follow a stored witness where applicable; a bounded search from other positions can recommend undo when it cannot find a quick completion. That message is not a proof that the board is unsolvable. Hidden Rays hints reveal observations; its Check action submits a hypothesis rather than adding a Play/Resume step.

This release also includes the separately developed word-content cleanup: it keeps Words level/score identities while replacing sensitive vocabulary, and migrates affected Word Guess rounds as documented in [WORD_CONTENT_REVIEW.md](WORD_CONTENT_REVIEW.md). That migration is not caused by these new save namespaces.

## Files and regeneration

- `games/quiet-core.js`: pure new-game rules, state checks and bounded runtime hint helpers.
- `games/quiet-ui.js`, `games/quiet-ui.css`: deferred controls and presentation.
- `games/quiet-specs.json`: original help, icon geometry and display labels.
- `games/quiet-levels/*.json`, `games/quiet-pack-manifest.json`: stable level content and fingerprints.
- `scripts/quiet-solvers.cjs`, `scripts/generate_quiet_pack.cjs`: build-time verification/generation; no solver search runs during home startup.
- `app/quiet-loader.js`, `scripts/patch_quiet_games.py`, `scripts/build_quiet_assets.py`: inert shell, deferred loading and hashed offline integration.
- `scripts/test_quiet_pack.cjs`, `scripts/test_quiet_browser.cjs`: rule, content, save and real-control regression gates.

Regenerate intentionally with `node scripts/generate_quiet_pack.cjs`. Do not replace a published pack under the same content version merely to change difficulty; retain existing IDs/content or add an explicit migration/version. Normal builds only verify and package the committed packs. They do not contact upstream repositories or regenerate content.

## Validation record

The full build verifies all 480 packs. Unique-solution families are searched from their clues without reading stored solutions; action puzzles replay constructive witnesses; Dot Sweep replays a deduction proof. Counterexamples cover matching insufficiency, diagonal cycles and distinct Hidden Rays layouts with identical complete probe signatures. Original game tests continue, including 16,368 legacy-equivalent 2048 moves and all 36 Ants Apart layouts/collision rules.

The new browser suite completes levels 1 and 30 of every new game using normal controls, in mobile light and desktop dark layouts, then checks Undo, Help, reload, semantic backup validation, startup deferral and preservation of existing saved records. The responsive matrix grows to 640 game/viewport/theme views. Existing footer, live-state reflow, strict-CSP, SDK privacy/integrity and restore-failure tests remain applicable.

Final locally checked candidate: offline release `dc74ed6d4903db2abc08`. The full build passed, all 20 deferred source files match their emitted content hashes, and these browser checks passed:

- All 16 additions completed at levels 1 and 30 in mobile light and desktop dark; reload, Undo, level changes, Hint/Retry, Help, independent old saves and unopened-game backup validation passed.
- All 640 catalogue/viewport/theme views fit horizontally with visible boards and no runtime errors; desktop views required no page scrolling.
- Actual service-worker installation followed by first opening every addition offline passed, including a direct guide fallback and backup preparation.
- A real 24-to-40 service-worker upgrade waited during an active Ants game, updated after returning home, preserved the Ants save byte-for-byte, and opened all 16 additions offline afterward.
- Existing live-game reflow, footer/appearance utilities, all-40-game CSP/security and backup restore checks passed.
- Final review reproduced a concurrent first-open race that attached two controllers. The loader now rechecks after its asynchronous specification fetch; the new regression verifies one mount and a working first move.
- Credential-pattern checks passed; OSV reported no advisories for the three exact runtime/tooling package versions in the existing inventory/lockfile. This does not audit every transitive component inside the upstream CDN bundle.

Five alternating cold runs per build used Chrome at 390×844, 4× CPU throttling, 150 ms network latency, 1.6 Mbps download throughput and gzip. HTTP cache and service workers were disabled for this startup comparison. The baseline is the preserved 24-game build with the same word-content cleanup.

| Median measurement | 24 games | 40 games | Change |
|---|---:|---:|---:|
| Largest contentful paint | 548 ms | 548 ms | 0 ms |
| First contentful paint | 548 ms | 548 ms | 0 ms |
| Observed long-task blocking time | 60 ms | 59 ms | −1 ms |
| Compressed page/resource bodies | 259,217 B | 264,628 B | +5,411 B (5.3 KiB) |

Timing differences are within the variation of this small local sample, while the additional transfer bytes are measurable. The new rule core remained unloaded on home in every candidate run. Complete offline installation grows from 898,283 to 1,083,921 raw asset bytes; the sum of individually gzipped asset bodies grows from 262,062 to 303,138 bytes (about 40.1 KiB). Actual transfer depends on server compression and headers. These are local comparisons, not new public PageSpeed scores or real-user Core Web Vitals. Physical iPhone/Android testing has not been performed.

## Preview and release

Build with `python3 scripts/build.py`, then serve `python3 scripts/preview.py` and open `http://localhost:8765/`. Each game can also be entered through `/?game=<gameId>` and its generated guide. Preview review precedes any commit or production push. Rollback can remove a new catalogue entry while retaining its independent saved data for a compatible return.
