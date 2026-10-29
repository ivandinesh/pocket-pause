# Naming and content review — 2026-10-27

Baseline inspected: GitHub main f8692c82e51805fef6cb40a3553bf7e9be91b406.
This pre-change report is an engineering risk screen, not trademark clearance or
an opinion that any implementation is non-infringing. The tracked collection has
17 games. Review covers source HTML, assembly scripts, game JS/CSS, PWA, plans,
license/data files and Git history. No bundled image/audio/font binaries, npm
packages, downloaded game engines or commercial puzzle archive were identified.
Source inspection cannot establish independent authorship or the complete history
of pasted code/data. Those uncertainties are explicitly retained below.

## A. Game risk register (before changes)

N = name, C = copyright/content, V = visual identity, D = data/license.
LOW means no specific concern found in this screen, not clearance.
NR means NEEDS REVIEW. Overall combines observed issues and evidence gaps.

| Current | Proposed final | Overall | N | C | V | D | Evidence and planned action |
|---|---|---|---|---|---|---|---|---|
| Words | Words | NEEDS REVIEW | LOW | NR | MEDIUM | NR | Letter wheel and inline word bank/1,000 precomputed levels. No external source recorded for these lists. Keep; request provenance confirmation. |
| Word Search | Word Search | NEEDS REVIEW | LOW | NR | LOW | NR | Seeded letter placement using inline themed word lists; list authorship unrecorded. Keep. |
| Word Guess | Word Guess | MEDIUM | LOW | MEDIUM | MEDIUM | MEDIUM | MIT dictionary notice present; own fixed answer selection and daily permutation documented. Retain notice and clue symbols; familiar grid feedback still merits visual review. |
| Sudoku | Sudoku | LOW | LOW | LOW | LOW | LOW | Seeded solved-grid permutations and cell removal in makeSudoku; no imported boards found. Keep. |
| Snake | Snake | MEDIUM | LOW | NR | MEDIUM | LOW | Canvas dots/eyes and repository engine; earlier design references do not establish originality. Keep; visual comparison remains advisable. |
| Tetris | Falling Blocks | HIGH | HIGH | MEDIUM | HIGH | NR | Branded title plus familiar 10x20 falling-piece presentation. Rename all display text; existing monochrome dots, palette and controls retained. Rename alone does not resolve expression/trade-dress questions. |
| Zip Line | Number Path | MEDIUM | MEDIUM | LOW | MEDIUM | NR | Seeded backbite path and walls generated locally, no imported daily boards. Rename; retain blue geometry/animated path and level IDs. RNG provenance needs review. |
| Pac-Man | Maze Chase | HIGH | HIGH | HIGH | HIGH | LOW | Mouth-shaped player and eye-bearing pursuers, generated 15x19 mazes. Rename; replace player, pursuers, power markers and home icon with geometric artwork. Preserve maze algorithm. |
| Fidget | Fidget | LOW | LOW | LOW | LOW | LOW | Canvas geometric spinner/gears, no external artwork found. Keep. |
| Dot Connect | Dot Connect | MEDIUM | LOW | MEDIUM | MEDIUM | LOW | Seeded goals, loops and frost resemble a known commercial genre. Repository implementation and icon geometry; keep, retain visual-review caveat. |
| 2048 | 2048 | NEEDS REVIEW | MEDIUM | NR | LOW | NR | dopopMerge is a compact flat-array implementation, not the original project's file/class layout. No imported original assets found; absence is not proof of authorship. Keep name; require author confirmation before claiming fully original code. |
| Flow | Color Paths | MEDIUM | MEDIUM | LOW | MEDIUM | LOW | Python seeded full-board paths split into endpoint pairs; numbered endpoints and pale DoPop board. Rename display strings; preserve generated levels. |
| Untangle | Untangle | LOW | LOW | LOW | LOW | LOW | Seeded grid graph scrambled onto ring, solution computed locally. Keep. |
| Flood | Flood | LOW | LOW | LOW | LOW | LOW | Seeded color board and greedy solution budget. Keep. |
| Light Up | Light Up | LOW | LOW | LOW | LOW | LOW | Seeded walls, constructive lights and clue counts. Keep. |
| Bridges | Bridges | LOW | LOW | LOW | LOW | LOW | Seeded connected rectilinear graph and counts. Keep. |
| Slide | Slide | LOW | LOW | LOW | LOW | LOW | Legal seeded moves from solved grid. Keep. |

## B. License and asset inventory

| Component | Source/author | License and requirement | Notice/location | Assessment |
|---|---|---|---|---|
| Accepted five-letter dictionary | https://github.com/tabatkins/wordle-list ; Tab Atkins Jr. | MIT; retain copyright and permission notice with substantial copies | games/word-guess-LICENSE.txt; Copyright (c) 2022 Tab Atkins Jr.; embedded by patch_word_guess.py | Present. Upstream import revision was not recorded; upstream rights cannot be independently guaranteed. |
| Fixed 1,000 Word Guess answers | games/word-guess-answers.txt; selection described as DoPop-authored in README | No separate project license declared; dictionary notice retained | README and WORD_GUESS_PLAN.md | Preserve IDs/order and own date permutation. |
| Words/Word Search word banks and precomputed Words levels | index.html, patch_new_games.py, patch_zip_redo.py | No external attribution/license recorded | None | NEEDS REVIEW: confirm source and author; do not invent a license. |
| Mulberry32-style random helper | index.html mulberry32; patch_zip_redo.py zipRandom | No provenance/license recorded | None | NEEDS REVIEW: recognizable algorithm implementation; retain to avoid changing saved levels pending provenance check. |
| 2048 rules/UI | scripts/patch_dots_2048.py; repository history | No original-project reuse established | No Cirulli notice in repo | NEEDS REVIEW. Original upstream is MIT (Copyright 2014 Gabriele Cirulli): https://github.com/gabrielecirulli/2048/blob/master/LICENSE.txt . Preserve/add that notice if reuse is confirmed; do not falsely assign it to unrelated code. |
| Other game engines/generators | Tracked HTML/JS/Python | No blanket license declared | README | Locally implemented/generated evidence, not a forensic originality guarantee. |
| Sound effects | index.html beep; games/word-guess.js oscillator tones | Synthesized in code; no external recording found | Source | Single tones/chord, not imported arcade audio. |
| Optional music | patch_dots_2048.py musicTone/music scheduling | Synthesized pentatonic sequence described as original in GAME_PLAN.md | Source and GAME_PLAN.md | No audio files or external sound packs found. |
| Game icons/art | Inline CSS, SVG and canvas; PWA PNG generation in build_offline.py | Repository-drawn geometry; system-rendered symbols | Source | Maze icon/character needs replacement. No external screenshot/promo artwork tracked. |
| Fonts | CSS local/system font fallback names (Inter, SF, Segoe etc.) | No font files distributed or downloaded | CSS | Referencing locally installed fonts does not establish a license to bundle their files. |
| Runtime/build | Browser platform; Python/Node standard libraries | Tools not bundled into app | No package manifest/dependency lockfile | No third-party frontend packages found. |
| Feedback link | Google Forms responder URL | External service, not redistributed software/assets | feedback-config.json | Opens externally; not an offline feature. |

## C. Preliminary naming search — not clearance

Web and store searches found existing use of all four descriptive replacements:
- Falling Blocks: https://play.google.com/store/apps/details?id=com.gamesbykevin.fallingblocks and https://apps.apple.com/se/app/falling-blocks-puzzle-game/id1474442643
- Maze Chase: https://play.google.com/store/apps/details?id=com.maze_chase and https://store.steampowered.com/app/2365380/Maze_Chase/
- Number Path: https://apps.apple.com/se/app/number-path-brain-logic-game/id6789552025 and https://play.google.com/store/apps/details?id=games.playbrain.numberpath
- Color Paths: https://play.google.com/store/apps/details?id=com.zestful.colorpaths ; similar App Store use https://apps.apple.com/se/app/color-paths-out/id6796360085
- DoPop/dopop/dopop.fun: no verified exact software trademark record obtained.
  Exact web search found a prior Dopop NFT website design portfolio:
  https://mostaql.com/portfolio/1072640-dopop-website . This is a lead, not proof
  of a live product or registered right. Similar names require review too.

EUIPO search entry returned HTTP 403; WIPO Brand Database returned a verification
challenge; USPTO search interface yielded no retrievable records. Search-engine
index queries do not substitute for database searches and empty results do not
establish availability. Google-specific search results were not separately
verified; web-search provider/store coverage is preliminary. No registration
number, status, owner or goods/services comparison has been verified for any
proposed title. Formal EUIPO/TMview, WIPO, USPTO and relevant national/common-law
searches remain open, including DoPop and similar spellings, classes 9/41/42 as
appropriate. Do not describe the replacements or DoPop as legally cleared.

Use proposed names as descriptive collection labels in this engineering change;
permanent brand adoption and large-scale promotion need professional clearance.
Do not change the DoPop domain or PWA identity as a side effect of this task.

## D. Planned change boundaries and persistence

Rename visible copy/accessibility/docs only; preserve internal game IDs, CSS hooks,
file names, storage keys, serialized schemas and all level seeds/data. Maze art
changes are rendering-only. No save migration, data removal or mechanic rewrite.
Add tests for names, license inclusion, unchanged save identifiers/data and maze
art hooks. Run the full suite and browser checks before any commit.

## E. Open release checks

Physical iOS/Android: appearance controls, next pieces, maze swipe turns, path
selection/completion, portrait/landscape, home-screen offline cold start and a
real old-to-new HTTPS service-worker update with another tab actively playing.
Mocked worker tests are not a substitute. Source provenance confirmations and
formal name/trade-dress clearance remain unresolved after technical tests pass.

## F. Implementation and changed-files report — 2026-10-28

Implemented the four proposed display names. Existing internal identifiers,
selectors, filenames and storage namespaces intentionally retain legacy words.
Generic wording such as “Find your flow” is not a game brand reference.

| Files | Changes |
|---|---|
| index.html | Falling Blocks titles/accessibility labels; current 17-game metadata |
| games/calm-trio.js | Separate display name from stable flow ID; Color Paths title/help/accessibility |
| scripts/patch_zip_redo.py | Number Path/Maze Chase copy; new geometric maze icon, diamond player, ring drones and beacons; no maze/controls/save changes |
| scripts/patch_new_games.py, patch_tetris_appearance.py | Updated generated titles and accessibility copy |
| scripts/patch_calm_trio.py, patch_game_session.py, patch_zip_fidget_tune.py, patch_zip_touch_canvas.py | Naming/comments kept consistent with assembly anchors |
| scripts/test_offline.cjs, test_calm_trio.cjs, test_game_session.cjs | New expected display names/test output; legacy storage identifiers retained |
| scripts/ip-compatibility.json, test_ip_release.py | Baseline fingerprints and release naming/license/syntax checks |
| scripts/test_renamed_games.cjs | Full generated path/maze coverage and legacy maze-save fixture |
| scripts/build.py | Runs new release checks in the normal build gate |
| README.md | Current names, IP statement, inventory link; corrected outdated in-place build warning |
| docs/IP_REVIEW.md | Pre-change risk register, license inventory, search limitations and completion report |

Actions for all other games: retained names/mechanics/artwork. All data/license
uncertainties from sections A–C remain open; the edits do not downgrade these
items to legally cleared. No additional external assets or licenses were added.

Persistence: baseline fingerprint checks compare storage literals, the falling
engine, maze generator, Number Path generator and fixed Color Paths/Words/Word
Guess level data. No key or schema migration occurs. A legacy maze save fixture
restores level, score, remaining dots and lives. Number Path level 500 survived
browser reload. Falling Blocks retains preferences/starting level; it did not
previously persist an entire active run, and this change does not add that claim.

Browser QA: all 17 launch/back routes passed. Falling Blocks Play/Rotate/next
pieces and Green appearance worked; Number Path level 500 loaded; Color Paths
help has the new title and level 50 loaded; Maze Chase level 2 and geometric art
rendered. Existing lifecycle caveat: after opening an arcade dialog, Resume is
required; the older Play/pause control can change its status text while the shared
pause guard still blocks movement. This predates the naming change and remains
an explicitly recorded follow-up, not silently treated as a new naming regression.

Manual outstanding: real touch dragging/completion on phones; all renamed pages
at small/landscape viewports; physical Safari/Chrome installed mode; real HTTPS
old-cache upgrade, offline cold launch and a second actively playing tab. This
HTTP preview cannot establish real service-worker behavior. Automated worker
coverage simulates installation, digest checks, offline reads and update deferral.

No claim of formal EU/US/worldwide trademark clearance, independent authorship of
all historical source, or copyright-free games is made. A professional should
review the aggregate falling-block expression and proposed names before major
promotion. Prior screenshots/social posts outside this repository were not edited.

Final automated result: PASS on 2026-10-28 for the normal build and every included
suite, including all 1,000 Number Path routes/anchors/walls, all 1,000 connected
maze layouts, legacy maze-save restore, unchanged compatibility fingerprints,
embedded MIT notice and generated JavaScript syntax. Offline release identifier:
`b00ab7d919302d440515` (previous production build: `f6b623db045ce266f3e7`).
Build/test success is technical verification only. Branch prepared for review;
production/main is unchanged by this naming batch.

## Current word-data status — 2026-10-29

The earlier risk table is a historical baseline. The unresolved Words and Word
Search datasets have since been replaced in current source with a filtered
subset of Alan Beale's 12dicts 6.0.2 `International/3of6game.txt` word-game
list. The source declares a public-domain release and requests acknowledgment;
the full source, archive hash, normalization, derived hashes, and offline notice
are recorded in `games/word-content-manifest.json` and
`games/12dicts-NOTICE.txt`. Words saves use a content-version migration that
keeps level and score while clearing only the incompatible current attempt.

This lowers the outstanding data-provenance risk for current releases. The
older data remains in historical Git commits, and the change is not a claim of
formal legal clearance or of independent authorship for every legacy code path.
