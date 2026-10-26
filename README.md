# dopop

Little games. Good moments. https://www.dopop.fun/

A mobile-first collection of calm puzzles, arcade games and tactile fidgets. No accounts, advertisements or purchases. Browser-local progress, optional sound and an installable offline experience. GitHub main deploys to the existing pocket-pause Vercel project and dopop.fun domains.

## Game collection

| Game | Interaction and progression |
| --- | --- |
| Words | Circular letter wheel; connect letters; 1,000 distinct letter sets; saved progress and level selection |
| Word Search | Find hidden words; puzzle selector and automatic progression |
| Word Guess | Five letters, six guesses; Daily and 1,000 fixed levels; hard mode, clue symbols, keyboard, statistics and streaks |
| Sudoku | Number placement; puzzle selection and automatic progression |
| Snake | Dot body and larger head with eyes; smooth movement, colors, shapes and speed selection |
| Tetris | Falling blocks; starting level and appearance choices |
| Zip Line | Ordered number connections covering the board; walls; editable path, flowing highlights, saved path and level picker |
| Pac-Man | Continuous movement, queued turns, power dots, changing mazes, appearance and level controls |
| Fidget | Free play; several spinner modes; Connected has ten varied gears, Spin and particles |
| Dot Connect | 100 levels; matching-color chains, loop clears, goals, move limits and frost |
| 2048 | Classic 4×4 merges; undo, saved board and best score; optional music |
| Flow | 50 levels; join matching pairs and fill all cells without crossing |
| Untangle | 50 levels; move nodes until edges do not cross or pass through nodes |
| Flood | 50 levels; expand the corner region with colors within a move budget |
| Light Up | 50 levels; illuminate every open cell; lights cannot see one another; numbered walls constrain adjacent lights |
| Bridges | 50 levels; tap between islands to cycle zero/single/double bridges; match island totals and connect the entire network |
| Slide | 50 levels; slide adjacent numbered tiles into the empty cell; 3×3 then 4×4; starts generated through legal moves |

New Light Up, Bridges and Slide games include independent saves, undo (last 30 moves), reset confirmation, level selection, appearance controls and automatic advancement after completion. These are original generated puzzles; a known solution is checked, but uniqueness of every solution and human difficulty have not been proven. Bridges uses nearest-neighbor rectilinear island grids, so legal bridge segments cannot cross. Future expansions should improve puzzle variety after playtesting.

## Theme and interface contract

- Plain white outside play areas. Restrained pale-blue dots may appear within boards and home artwork.
- Blue is the default accent (#4f78ec); use the shared SNAKE_COLORS palette rather than inventing competing options.
- Rounded geometry, soft borders, clear dark text and ample spacing. Offer round/square choices where the mechanics permit.
- Home is a compact app-icon grid with readable game labels. Preserve familiar icon placement when adding games.
- Game pages use a compact back/title/sound header, a generous play area, and bottom level/actions controls. Avoid repeating the site masthead inside games.
- Respect viewport height and device safe areas. On short landscape screens, scrolling is preferable to overlapping controls.
- Color swatches must have equal width/height, zero inherited padding, a centered dot and a centered selected ring. Word Guess has scoped dialog overrides for this reason.
- Word Guess clue colors retain their meanings regardless of accent: green correct, amber misplaced, gray absent. Optional symbols and accessible labels complement color.
- Animations should be gentle, with reduced-motion support for animated effects. Sound is opt-in. Never require audio to solve a puzzle.
- Keep help available and explain controls. Every control needs a descriptive accessible label; keep native button keyboard behavior and visible focus.

## Input and mobile behavior

Games use touch/pointer controls, with keyboard support where implemented. Word Guess provides a persistent on-screen keyboard plus physical keyboard input. Bridges taps the spaces between islands; Slide taps tiles; Light Up taps cells. Do not rely on hover.

Existing site-wide gesture safeguards prevent accidental selection, context menus and repeated-tap zoom during games. Preserve editable input behavior and pinch zoom where supported. CSS/browser emulation does not establish physical iPhone Safari correctness: device QA remains a separate release step.

## State and saves

Progress lives in localStorage on the current browser and origin. Existing keys are contracts: do not rename, clear or silently migrate them without a tested migration. Switching between dopop.fun, www.dopop.fun and older Vercel origins can produce separate saves.

- Existing games primarily use pocketpause.v1.*; Zip also uses pocketpause.zip.progress.v1.
- Word Guess: pocketpause.v1.wordguess.v1, with independent date/level rounds, guesses, unfinished entry, preferences and derived statistics.
- Light Up/Bridges/Slide: pocketpause.v1.logic.lightUp, pocketpause.v1.logic.bridges, pocketpause.v1.logic.slide.
- New games fit the existing backup allowlist. Offline & saves exports/imports JSON, validates allowed keys and asks before replacing progress.
- Clearing site data removes saves. Browser storage can be evicted or refused. Exported backups are recommended; installation is not a permanent backup.
- No accounts or cloud sync. Saves are not shared across devices. Arcade resume behavior follows each game's implementation.

Word Guess answer IDs and the answer manifest must stay fixed. Its Daily uses the device's local date and a deterministic 1,000-day permutation; it is not the NYT schedule. Older unfinished daily rounds remain saved when choosing Today. Hard mode locks after the first submitted guess. Completed rounds are not counted twice. The bundled accepted-guess list is broader than the curated answer list.

## Offline architecture

All games, styles and dictionaries are bundled into dist/index.html. No runtime dictionary download is needed. scripts/build_offline.py creates icons, the web manifest, the release descriptor and a versioned service worker. Release assets are checked with SHA-256 before installation succeeds. The complete release is cached together; failed downloads do not replace a usable older release.

The client displays Ready for offline play only after a worker cache check. Updates install in the background; the Update ready action requires open clients to be safely at home before activation. Keep this protocol intact to avoid interrupting active play. The worker also supports cache checking/repair.

Install: open online, wait for readiness, use Safari Add to Home Screen or Android Install app, and open the installed app online once before disconnecting. HTTPS is required (a normal HTTP preview cannot verify service-worker installation). New releases regenerate hashes automatically, including CSS-only changes.

## Source map

| Path | Responsibility |
| --- | --- |
| index.html | Tracked base application; build scripts patch this source in sequence |
| scripts/build.py | Ordered assembly and test gate |
| scripts/patch_*.py | Existing game additions and targeted compatibility patches |
| games/calm-trio.* | Flow, Untangle, Flood |
| games/word-guess* | Word Guess mechanics, UI, styling, fixed answers, dictionary and license |
| games/logic-trio.* | Light Up, Bridges, Slide generators, mechanics and UI |
| pwa/client.js | Registration, readiness, update UI, installation and backup controls |
| pwa/sw.js | Worker template, release cache verification and update coordination |
| pwa/style.css | Offline management UI |
| scripts/build_offline.py | Offline release and icon generation |
| vercel.json | Build/output configuration and service-worker/manifest cache headers |

## Build and verify

Requirements: Python 3 and Node.js. There are no frontend package dependencies to install for this static build.

Run from a **fresh source checkout**:

    python3 scripts/build.py

Output is dist/. Important: the inherited build pipeline modifies index.html in place. Do not run it twice against already-patched source. Use a disposable fresh checkout for each build; never commit the generated index.html over the tracked base. Do not discard unrelated user edits to obtain a clean build.

The build runs Word Guess rules first, then assembles games and offline assets, then runs:

    node scripts/test_logic_trio.cjs
    node scripts/test_new_games.cjs
    node scripts/test_calm_trio.cjs
    node scripts/test_offline.cjs

Checks cover answer validity, duplicate letters, hard constraints, win/loss, deterministic daily schedules, save validation, 2048 merge rules, Dot Connect rules, generated puzzle solutions, Slide parity, backup validation, cache-only navigation, hash mismatch failures, cache repair and multi-tab update safety. A failing check exits the build unsuccessfully.

Browser QA should cover game entry, interactions, completion, level changes, undo/reset, modal controls, refresh/resume, small phone portrait and landscape, reduced motion, offline reopening and an update from the prior release. Known-solution validation does not replace interaction testing or physical device testing.

## Release and rollback

1. Fetch the latest main and compare against the working copy. Preserve unrelated changes.
2. Keep changes scoped; use stable save keys and deterministic level IDs.
3. Build/test in fresh source. Review the exact changed files, including license and offline integration.
4. Commit to connected GitHub main. Vercel auto-deploys to the existing project; do not recreate the project or change domains.
5. Verify the production deployment commit and READY status; inspect live gameplay and offline readiness.
6. Installed users may need to return home and apply Update ready.

Rollback by reverting the release commit or using the platform's deployment rollback procedure. Preserve new save keys so a subsequent restored release can recover progress. Verify domain assignment and automatic deployments after a platform rollback.

## Dependencies and license notices

The Word Guess accepted dictionary comes from https://github.com/tabatkins/wordle-list under MIT. Its full notice is in games/word-guess-LICENSE.txt and embedded in the bundle. Answer selection and puzzle generators are dopop's own content. Do not copy third-party game branding, artwork or proprietary puzzle schedules. This repository does not declare a blanket license for all original application code.

## Remaining roadmap

Previously discussed but not implemented here: Loop, Color Code, Peg Solitaire and Rotate. Prioritize puzzle variety, accessible inputs and physical-device QA before increasing level counts. Accounts, analytics, advertising, purchases and cloud synchronization are outside the current design.
